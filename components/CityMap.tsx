import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CountryOption, CityOption, Incident, IncidentSeverity, Landmark } from '../types';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface CityMapProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  selectedCity: CityOption | null;
  selectedCountry: CountryOption | null;
  mapFocusScope: 'country' | 'city';
  landmarks: Landmark[];
}

// ✅ Inner component that uses map hooks
const MapContent: React.FC<Omit<CityMapProps, 'selectedCity' | 'selectedCountry'> & {
  selectedCity: CityOption | null;
  selectedCountry: CountryOption | null;
  centerLat: number;
  centerLng: number;
  zoomLevel: number;
}> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  selectedCity,
  selectedCountry,
  mapFocusScope,
  landmarks,
  centerLat,
  centerLng,
  zoomLevel
}) => {
  const map = useMap();

  // Fly to selected incident
  useEffect(() => {
    if (selectedIncidentId) {
      const incident = incidents.find(i => i.id === selectedIncidentId);
      if (incident) {
        map.flyTo([incident.location.lat, incident.location.lng], 8, { duration: 0.75 });
      }
    }
  }, [selectedIncidentId, incidents, map]);

  // Fly to selected city
  useEffect(() => {
    if (selectedCity && !selectedIncidentId) {
      map.flyTo([selectedCity.lat, selectedCity.lng], 10, { duration: 0.75 });
    }
  }, [selectedCity, selectedIncidentId, map]);

  // Fly to selected country
  useEffect(() => {
    if (selectedCountry && !selectedIncidentId && !selectedCity && mapFocusScope === 'country') {
      map.flyTo([selectedCountry.center.lat, selectedCountry.center.lng], 4, { duration: 0.75 });
    }
  }, [selectedCountry, selectedIncidentId, selectedCity, mapFocusScope, map]);

  return (
    <>
      {/* Incidents as markers */}
      {incidents.map(incident => {
        const isSelected = selectedIncidentId === incident.id;
        const color = incident.severity === IncidentSeverity.CRITICAL || incident.severity === IncidentSeverity.HIGH
          ? '#ef4444'
          : '#f59e0b';

        // Create custom icon for incidents
        const incidentIcon = L.divIcon({
          html: `
            <div class="flex flex-col items-center">
              ${incident.status === 'action_required' || incident.status === 'detecting' ? `
                <div class="absolute w-8 h-8 rounded-full border-2" style="border-color: ${color}; animation: pulse 2s infinite;"></div>
              ` : ''}
              <div class="w-3 h-3 rounded-full" style="background-color: ${color}; border: ${isSelected ? '2px white' : 'none'};"></div>
            </div>
          `,
          className: 'incident-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        });

        return (
          <Marker
            key={incident.id}
            position={[incident.location.lat, incident.location.lng]}
            icon={incidentIcon}
            eventHandlers={{
              click: () => onSelectIncident(incident.id),
            }}
          >
            <Popup>
              <div className="p-3 bg-slate-900 text-white rounded">
                <h3 className="font-bold text-sm mb-1">{incident.title}</h3>
                <p className="text-xs text-slate-300 mb-2">{incident.summary}</p>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Severity:</span>
                  <span className={incident.severity === IncidentSeverity.CRITICAL ? 'text-red-400' : 'text-amber-400'}>
                    {incident.severity}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-300">{incident.location.address}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Landmarks as markers */}
      {landmarks.map(landmark => {
        const landmarkIcon = L.divIcon({
          html: `
            <div class="flex flex-col items-center">
              <div class="w-2 h-2 rounded-sm" style="background-color: #38bdf8; transform: rotate(45deg);"></div>
              <div class="text-[9px] text-blue-300 font-bold mt-1 whitespace-nowrap bg-black bg-opacity-50 px-1 rounded">
                ${landmark.name}
              </div>
            </div>
          `,
          className: 'landmark-marker',
          iconSize: [20, 30],
          iconAnchor: [10, 30],
          popupAnchor: [0, -30],
        });

        return (
          <Marker
            key={landmark.id}
            position={[landmark.lat, landmark.lng]}
            icon={landmarkIcon}
            interactive={false}
          />
        );
      })}

      {/* Add pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .incident-marker {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
        }
        .landmark-marker {
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
        }
      `}</style>
    </>
  );
};

// ✅ Main component
const CityMap: React.FC<CityMapProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  selectedCity,
  selectedCountry,
  mapFocusScope,
  landmarks
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Determine initial center and zoom
  let initialLat = 20;
  let initialLng = 0;
  let initialZoom = 2;

  if (selectedCity) {
    initialLat = selectedCity.lat;
    initialLng = selectedCity.lng;
    initialZoom = 10;
  } else if (selectedCountry) {
    initialLat = selectedCountry.center.lat;
    initialLng = selectedCountry.center.lng;
    initialZoom = 4;
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden border border-slate-800 bg-[#0b1220] relative"
    >
      <MapContainer
        center={[initialLat, initialLng]}
        zoom={initialZoom}
        className="w-full h-full"
        style={{ background: '#0b1220' }}
        zoomControl={false}
      >
        {/* Dark theme map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        {/* Map content */}
        <MapContent
          incidents={incidents}
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={onSelectIncident}
          selectedCity={selectedCity}
          selectedCountry={selectedCountry}
          mapFocusScope={mapFocusScope}
          landmarks={landmarks}
          centerLat={initialLat}
          centerLng={initialLng}
          zoomLevel={initialZoom}
        />
      </MapContainer>

      {/* Header info box */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-2 rounded border border-slate-700 space-y-1 pointer-events-none">
        <div className="text-xs text-slate-300 font-mono uppercase">Live Map</div>
        <div className="text-[10px] text-slate-400 font-mono">
          {selectedCity?.name ?? selectedCountry?.name ?? 'World'}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => {
            const mapElement = containerRef.current?.querySelector('.leaflet-container') as any;
            if (mapElement && mapElement.__vue__) {
              mapElement.__vue__.leafletObject.zoomIn();
            }
          }}
          className="h-8 w-8 rounded bg-slate-900/80 border border-slate-700 text-slate-200 text-sm hover:bg-slate-800 transition"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => {
            const mapElement = containerRef.current?.querySelector('.leaflet-container') as any;
            if (mapElement && mapElement.__vue__) {
              mapElement.__vue__.leafletObject.zoomOut();
            }
          }}
          className="h-8 w-8 rounded bg-slate-900/80 border border-slate-700 text-slate-200 text-sm hover:bg-slate-800 transition"
          title="Zoom out"
        >
          -
        </button>
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 z-10 text-[10px] text-slate-500 font-mono bg-slate-900/50 px-2 py-1 rounded pointer-events-none">
        Incidents: {incidents.length} • Landmarks: {landmarks.length}
      </div>
    </div>
  );
};

export default CityMap;