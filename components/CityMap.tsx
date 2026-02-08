import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Incident, IncidentSeverity } from '../types';

interface CityMapProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
}

const CityMap: React.FC<CityMapProps> = ({ incidents, selectedIncidentId, onSelectIncident }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "#0b1220");

    // --- Draw Grid (Simulate City Blocks) ---
    const gridSize = 40;
    const numCols = Math.ceil(width / gridSize);
    const numRows = Math.ceil(height / gridSize);

    const gridGroup = svg.append("g").attr("class", "grid");

    for (let i = 0; i < numCols; i++) {
      for (let j = 0; j < numRows; j++) {
        // Randomly skip some blocks to make it look organic
        if (Math.random() > 0.1) {
          gridGroup.append("rect")
            .attr("x", i * gridSize + 2)
            .attr("y", j * gridSize + 2)
            .attr("width", gridSize - 4)
            .attr("height", gridSize - 4)
            .attr("fill", "#1f2937")
            .attr("opacity", 0.4);
        }
      }
    }

    // --- Draw Roads (Highways) ---
    const roadPath = d3.path();
    roadPath.moveTo(0, height / 2);
    roadPath.bezierCurveTo(width / 3, height / 2 - 100, width * 2 / 3, height / 2 + 100, width, height / 2);
    
    svg.append("path")
      .attr("d", roadPath.toString())
      .attr("fill", "none")
      .attr("stroke", "#334155")
      .attr("stroke-width", 8)
      .attr("opacity", 0.6);

    // --- Draw Incidents ---
    // Map simulated lat/lng to x/y. For demo, we just map loosely to center area
    const xScale = d3.scaleLinear().domain([34.0500, 34.0600]).range([height, 0]); // flipped for visual
    const yScale = d3.scaleLinear().domain([-118.2600, -118.2400]).range([0, width]);

    // Add pulsing effect definitions
    const defs = svg.append("defs");
    
    const pulseId = "pulse-gradient";
    const gradient = defs.append("radialGradient")
      .attr("id", pulseId);
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ef4444").attr("stop-opacity", 0.8);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#ef4444").attr("stop-opacity", 0);

    incidents.forEach((incident) => {
      // Create deterministic pseudo-random position if actual lat/lng is close
      // For demo visual stability, we map the actual values provided in constants
      // Note: mapping is arbitrary for the demo visualizer
      const x = (incident.location.lng + 118.2600) / 0.0200 * width;
      const y = (34.0600 - incident.location.lat) / 0.0100 * height;

      const isSelected = selectedIncidentId === incident.id;
      const color = incident.severity === IncidentSeverity.CRITICAL || incident.severity === IncidentSeverity.HIGH 
        ? "#ef4444" 
        : "#f59e0b";

      const g = svg.append("g")
        .attr("transform", `translate(${x},${y})`)
        .style("cursor", "pointer")
        .on("click", () => onSelectIncident(incident.id));

      // Pulse circle
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

      // Main Dot
      g.append("circle")
        .attr("r", isSelected ? 8 : 5)
        .attr("fill", color)
        .attr("stroke", isSelected ? "#fff" : "none")
        .attr("stroke-width", 2);

      // Label
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

  }, [incidents, selectedIncidentId]);

  return (
    <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden border border-slate-800 bg-[#0b1220] relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1 rounded border border-slate-700">
        <span className="text-xs text-slate-300 font-mono">LIVE MAP VISUALIZATION</span>
      </div>
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default CityMap;
