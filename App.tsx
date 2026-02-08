import React, { useState, useEffect } from 'react';
import { COUNTRY_CITY_OPTIONS, INITIAL_INCIDENTS, LANDMARKS, MOCK_STREAMS } from './constants';
import CityMap from './components/CityMap';
import StreamGrid from './components/StreamGrid';
import IncidentFeed from './components/IncidentFeed';
import ReasoningPanel from './components/ReasoningPanel';
import SettingsView from './components/SettingsView';
import { LayoutDashboard, Radio, Settings, ShieldAlert, WifiOff, Zap, RefreshCw } from 'lucide-react';
import { Incident, Stream } from './types';

const App: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [streams, setStreams] = useState<Stream[]>(MOCK_STREAMS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [backendError, setBackendError] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'streams' | 'settings'>('dashboard');
  const [isIngestLoading, setIsIngestLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState(COUNTRY_CITY_OPTIONS[0]?.code ?? 'USA');
  const [selectedCityId, setSelectedCityId] = useState(COUNTRY_CITY_OPTIONS[0]?.cities[0]?.id ?? 'los-angeles');
  const [mapFocusScope, setMapFocusScope] = useState<'country' | 'city'>('city');
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
  const selectedCountry = COUNTRY_CITY_OPTIONS.find((country) => country.code === selectedCountryCode) ?? COUNTRY_CITY_OPTIONS[0];
  const selectedCity = selectedCountry?.cities.find((city) => city.id === selectedCityId) ?? selectedCountry?.cities[0] ?? null;

  const filteredIncidents = incidents.filter((incident) => {
    if (!selectedCountry || !selectedCity) return true;
    if (!incident.countryCode || !incident.cityId) return true;
    return incident.countryCode === selectedCountry.code && incident.cityId === selectedCity.id;
  });

  const filteredStreams = streams.filter((stream) => {
    if (!selectedCountry || !selectedCity) return true;
    if (!stream.countryCode || !stream.cityId) return true;
    return stream.countryCode === selectedCountry.code && stream.cityId === selectedCity.id;
  });

  const selectedIncident = filteredIncidents.find(i => i.id === selectedIncidentId) || null;
  const cityLandmarks = selectedCity ? LANDMARKS.filter((landmark) => landmark.cityId === selectedCity.id) : [];

  // ✅ Fetch incidents from backend (silent)
  const fetchIncidents = async () => {
    try {
      setIsFetching(true);
      const res = await fetch(`${backendUrl}/incidents`);
      if (!res.ok) throw new Error("Failed to fetch incidents");
      const data = await res.json();
      setIncidents(data);
      setBackendError(false);
    } catch (err) {
      console.error("❌ Failed to fetch incidents:", err);
      setBackendError(true);
      // Keep existing incidents, don't fall back to INITIAL_INCIDENTS
    } finally {
      setIsFetching(false);
    }
  };

  // ✅ Fetch streams from backend (silent)
  const fetchStreams = async () => {
    try {
      const res = await fetch(`${backendUrl}/streams`);
      if (!res.ok) throw new Error("Failed to fetch streams");
      const data = await res.json();
      if (data.length >= 4) {
        setStreams(data);
        return;
      }
      setStreams(MOCK_STREAMS);
    } catch (err) {
      // Silently use mock streams if backend fails
      setStreams(MOCK_STREAMS);
    }
  };

  // ✅ Trigger ingest cycle to create incidents
  const triggerIngest = async () => {
    console.log('🌱 Triggering ingest cycle...');
    setIsIngestLoading(true);
    try {
      const res = await fetch(`${backendUrl}/ingest/run`, {
        method: 'GET'
      });
      if (!res.ok) throw new Error("Failed to trigger ingest");
      const data = await res.json();
      console.log('✅ Ingest cycle completed:', data.incidents?.length || 0, 'incident(s) created');
      
      // Refresh incidents after ingest
      setTimeout(() => {
        fetchIncidents();
        fetchStreams();
      }, 1000);
    } catch (err) {
      console.error("❌ Ingest error:", err);
      setBackendError(true);
    } finally {
      setIsIngestLoading(false);
    }
  };

  // Fetch incidents and streams on mount (only once)
  useEffect(() => {
    console.log('🚀 App mounted');
    fetchIncidents();
    fetchStreams();

    // Only poll if no incidents exist (every 10 seconds)
    // This helps when incidents are created but not yet fetched
    const interval = setInterval(() => {
      if (incidents.length === 0) {
        fetchIncidents();
      }
    }, 100000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-select first incident if none selected
  useEffect(() => {
    if (incidents.length > 0 && !selectedIncidentId) {
      setSelectedIncidentId(incidents[0].id);
    }
  }, [incidents.length]);

  useEffect(() => {
    if (!selectedCountry) return;
    setSelectedCityId(selectedCountry.cities[0]?.id ?? '');
    setMapFocusScope('country');
  }, [selectedCountryCode]);

  useEffect(() => {
    if (filteredIncidents.length === 0) {
      setSelectedIncidentId(null);
      return;
    }
    if (!selectedIncidentId || !filteredIncidents.some((incident) => incident.id === selectedIncidentId)) {
      setSelectedIncidentId(filteredIncidents[0].id);
    }
  }, [filteredIncidents, selectedIncidentId]);

  return (
    <div className="flex h-screen w-screen bg-[#0b1220] text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <div className="w-16 bg-[#0f172a] border-r border-slate-800 flex flex-col items-center py-6 gap-8 z-20">
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 cursor-pointer hover:bg-indigo-500 transition-all hover:scale-105 hover:shadow-indigo-500/50"
          title="Dashboard Home"
        >
           <ShieldAlert className="text-white" size={24} />
        </div>
        <nav className="flex flex-col gap-6 w-full items-center">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`p-3 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-slate-800 text-indigo-300 shadow-inner' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'}`}
            title="Dashboard"
          >
            <LayoutDashboard size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('streams')}
            className={`p-3 rounded-xl transition-all duration-200 ${activeTab === 'streams' ? 'bg-slate-800 text-indigo-300 shadow-inner' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'}`}
            title="Live Streams"
          >
            <Radio size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-3 rounded-xl transition-all duration-200 ${activeTab === 'settings' ? 'bg-slate-800 text-indigo-300 shadow-inner' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'}`}
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 bg-[#0f172a]/85 backdrop-blur flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-widest font-mono text-white">URBAN PULSE <span className="text-indigo-400">SENTINEL</span></h1>
            <div className="h-4 w-px bg-slate-700"></div>
            {backendError ? (
               <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-950/30 px-2 py-1 rounded border border-red-900">
                  <WifiOff size={12} /> BACKEND OFFLINE
               </div>
            ) : (
               <div className="flex items-center gap-2 text-xs font-mono text-emerald-200 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-700/60">
                  <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  SYSTEM ACTIVE
               </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={triggerIngest}
              disabled={isIngestLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white text-xs font-bold py-1 px-3 rounded transition"
              title="Trigger ingest cycle to create incidents"
            >
              <span>🌱</span>
              {isIngestLoading ? 'Ingesting...' : 'Trigger Ingest'}
            </button>

            <button
              onClick={fetchIncidents}
              disabled={isFetching}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold py-1 px-3 rounded transition"
              title="Refresh incidents"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>

            <div className="h-4 w-px bg-slate-700"></div>
            <div className="text-xs font-mono text-slate-400">
              Incidents: {filteredIncidents.length} • Streams: {filteredStreams.length}
            </div>
            <div className="text-xs font-mono text-slate-400">
              V.3.0.1 // GEMINI-3-FLASH
            </div>
          </div>
        </header>

        {/* View Router */}
        {activeTab === 'dashboard' && (
          <main className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
            {/* Left Col: Incidents */}
            <IncidentFeed 
              incidents={filteredIncidents} 
              selectedId={selectedIncidentId}
              onSelect={setSelectedIncidentId}
            />

            {/* Center Col: Map & Streams */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top: Map (60%) */}
              <div className="flex-[3] p-4 pb-2 flex flex-col min-h-0">
                 <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                   <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="uppercase text-slate-300">G7 Coverage:</span>
                     {COUNTRY_CITY_OPTIONS.map((country) => {
                       const isActive = country.code === selectedCountry?.code;
                       return (
                         <button
                           key={country.code}
                           type="button"
                           onClick={() => {
                             setSelectedCountryCode(country.code);
                             setMapFocusScope('country');
                           }}
                           className={`px-2 py-0.5 rounded-full border text-[10px] transition ${
                             isActive
                               ? 'border-indigo-400 text-indigo-200 bg-indigo-500/10'
                               : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                           }`}
                         >
                           {country.name}
                         </button>
                       );
                     })}
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="flex flex-col gap-1">
                       <label className="text-[10px] font-mono text-slate-400 uppercase">Country</label>
                       <select
                         value={selectedCountryCode}
                         onChange={(event) => setSelectedCountryCode(event.target.value)}
                         className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                       >
                         {COUNTRY_CITY_OPTIONS.map((country) => (
                           <option key={country.code} value={country.code}>
                             {country.name}
                           </option>
                         ))}
                       </select>
                     </div>
                     <div className="flex flex-col gap-1">
                       <label className="text-[10px] font-mono text-slate-400 uppercase">City</label>
                       <select
                         value={selectedCity?.id ?? ''}
                         onChange={(event) => {
                           setSelectedCityId(event.target.value);
                           setMapFocusScope('city');
                         }}
                         className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                       >
                         {selectedCountry?.cities.map((city) => (
                           <option key={city.id} value={city.id}>
                             {city.name}
                           </option>
                         ))}
                       </select>
                     </div>
                   </div>
                 </div>
                 <div className="flex-1 min-h-0">
                    <CityMap 
                      incidents={filteredIncidents} 
                      selectedIncidentId={selectedIncidentId} 
                      onSelectIncident={setSelectedIncidentId}
                      selectedCity={selectedCity}
                      selectedCountry={selectedCountry ?? null}
                      mapFocusScope={mapFocusScope}
                      landmarks={cityLandmarks}
                    />
                 </div>
              </div>
              
              {/* Bottom: Streams (40%) */}
              <div className="flex-[2] p-4 pt-2 border-t border-slate-800 bg-slate-900/40">
                 <div className="flex justify-between items-center mb-2">
                   <h3 className="text-xs font-bold text-slate-400 font-mono uppercase">
                     Live Feeds ({filteredStreams.length})
                   </h3>
                   <span className="text-[10px] font-mono text-slate-500 uppercase">
                     {selectedCity?.name ?? 'All Cities'} • {selectedCountry?.name ?? 'Global'}
                   </span>
                 </div>
                 <StreamGrid streams={filteredStreams} />
              </div>
            </div>

            {/* Right Col: AI Reasoning */}
            <div className="w-96 shadow-2xl z-10">
               <ReasoningPanel incident={selectedIncident} streams={filteredStreams} />
            </div>
          </main>
        )}

        {activeTab === 'streams' && (
           <main className="flex-1 overflow-hidden p-6 animate-in fade-in duration-300 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
                  <Radio className="text-indigo-300" />
                  FULL SPECTRUM MONITORING
                </h2>
                <div className="text-sm font-mono text-slate-400">
                  {streams.length} Active Sources
                </div>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                 <StreamGrid streams={streams} />
              </div>
           </main>
        )}

        {activeTab === 'settings' && (
           <SettingsView backendUrl={backendUrl} />
        )}
      </div>
    </div>
  );
};

export default App;
