import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CountryOption, CityOption, Incident, IncidentSeverity, Landmark } from '../types';

interface CityMapProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  selectedCity: CityOption | null;
  selectedCountry: CountryOption | null;
  mapFocusScope: 'country' | 'city';
  landmarks: Landmark[];
}

const CityMap: React.FC<CityMapProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  selectedCity,
  selectedCountry,
  mapFocusScope,
  landmarks
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadMap = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson', {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error('Failed to load map data');
        }
        const data = await response.json();
        if (isMounted) {
          setWorldData(data);
          setMapError(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load map:', error);
          setMapError(true);
        }
      }
    };

    loadMap();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !worldData) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "#0b1220");

    const mapGroup = svg.append("g").attr("class", "map-group");

    const projection = d3.geoMercator().fitSize([width, height], worldData);
    const path = d3.geoPath(projection);

    mapGroup
      .selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#111827")
      .attr("stroke", "#1f2937")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.9);

    const defs = svg.append("defs");
    const pulseId = "pulse-gradient";
    const gradient = defs.append("radialGradient")
      .attr("id", pulseId);
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ef4444").attr("stop-opacity", 0.8);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#ef4444").attr("stop-opacity", 0);

    const incidentGroup = mapGroup.append("g").attr("class", "incident-group");
    const landmarkGroup = mapGroup.append("g").attr("class", "landmark-group");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);
        const showLabels = event.transform.k >= 3;
        landmarkGroup.selectAll("text").attr("display", showLabels ? null : "none");
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom as d3.ZoomBehavior<SVGSVGElement, unknown>);

    incidents.forEach((incident) => {
      const [x, y] = projection([incident.location.lng, incident.location.lat]) ?? [width / 2, height / 2];
      const isSelected = selectedIncidentId === incident.id;
      const color = incident.severity === IncidentSeverity.CRITICAL || incident.severity === IncidentSeverity.HIGH
        ? "#ef4444"
        : "#f59e0b";

      const g = incidentGroup.append("g")
        .attr("transform", `translate(${x},${y})`)
        .style("cursor", "pointer")
        .on("click", () => onSelectIncident(incident.id));

      if (incident.status === 'action_required' || incident.status === 'detecting') {
        g.append("circle")
          .attr("r", 10)
          .attr("fill", color)
          .attr("opacity", 0.5)
          .append("animate")
          .attr("attributeName", "r")
          .attr("from", "10")
          .attr("to", "30")
          .attr("dur", "1.5s")
          .attr("repeatCount", "indefinite");

        g.append("circle")
          .attr("r", 10)
          .attr("fill", color)
          .attr("opacity", 0.5)
          .append("animate")
          .attr("attributeName", "opacity")
          .attr("from", "0.5")
          .attr("to", "0")
          .attr("dur", "1.5s")
          .attr("repeatCount", "indefinite");
      }

      g.append("circle")
        .attr("r", isSelected ? 8 : 5)
        .attr("fill", color)
        .attr("stroke", isSelected ? "#fff" : "none")
        .attr("stroke-width", 2);

      if (isSelected) {
        g.append("text")
          .attr("y", -15)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .style("text-shadow", "0px 2px 4px rgba(0,0,0,0.8)")
          .text(incident.title);
      }
    });

    landmarks.forEach((landmark) => {
      const [x, y] = projection([landmark.lng, landmark.lat]) ?? [width / 2, height / 2];
      const g = landmarkGroup.append("g")
        .attr("transform", `translate(${x},${y})`)
        .style("pointer-events", "none");

      g.append("rect")
        .attr("x", -4)
        .attr("y", -4)
        .attr("width", 8)
        .attr("height", 8)
        .attr("transform", "rotate(45)")
        .attr("fill", "#38bdf8")
        .attr("opacity", 0.9);

      g.append("text")
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "#bae6fd")
        .attr("font-size", "10px")
        .attr("font-weight", 600)
        .style("text-shadow", "0px 2px 4px rgba(0,0,0,0.8)")
        .attr("display", "none")
        .text(landmark.name);
    });

    const focusTarget = selectedIncidentId
      ? incidents.find((incident) => incident.id === selectedIncidentId)
      : null;

    if (focusTarget) {
      const [focusX, focusY] = projection([focusTarget.location.lng, focusTarget.location.lat]) ?? [width / 2, height / 2];
      const focusScale = 4;
      svg.transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(width / 2 - focusX * focusScale, height / 2 - focusY * focusScale)
            .scale(focusScale)
        );
    } else if (mapFocusScope === 'country' && selectedCountry?.center) {
      const [focusX, focusY] = projection([selectedCountry.center.lng, selectedCountry.center.lat]) ?? [width / 2, height / 2];
      const focusScale = 2;
      svg.transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(width / 2 - focusX * focusScale, height / 2 - focusY * focusScale)
            .scale(focusScale)
        );
    } else if (selectedCity) {
      const [focusX, focusY] = projection([selectedCity.lng, selectedCity.lat]) ?? [width / 2, height / 2];
      const focusScale = 2.5;
      svg.transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(width / 2 - focusX * focusScale, height / 2 - focusY * focusScale)
            .scale(focusScale)
        );
    }
  }, [incidents, selectedIncidentId, selectedCity, selectedCountry, mapFocusScope, worldData, landmarks]);

  const handleZoom = (direction: 'in' | 'out') => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    const factor = direction === 'in' ? 1.25 : 0.8;
    svg.transition().duration(200).call(zoomBehaviorRef.current.scaleBy, factor);
  };

  return (
    <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden border border-slate-800 bg-[#0b1220] relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-2 rounded border border-slate-700 space-y-1">
        <div className="text-xs text-slate-300 font-mono uppercase">Live Map Visualization</div>
        <div className="text-[10px] text-slate-400 font-mono">
          {selectedCity?.name ?? 'Global'} • {selectedCountry?.name ?? 'World'}
        </div>
      </div>
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => handleZoom('in')}
          className="h-8 w-8 rounded bg-slate-900/80 border border-slate-700 text-slate-200 text-sm hover:bg-slate-800"
        >
          +
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="h-8 w-8 rounded bg-slate-900/80 border border-slate-700 text-slate-200 text-sm hover:bg-slate-800"
        >
          -
        </button>
      </div>
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-300 font-mono bg-slate-950/80">
          Map data unavailable. Check network access.
        </div>
      )}
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default CityMap;
