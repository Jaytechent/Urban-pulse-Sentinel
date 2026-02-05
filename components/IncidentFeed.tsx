import React from 'react';
import { Incident, IncidentSeverity } from '../types';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

interface IncidentFeedProps {
  incidents: Incident[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const IncidentFeed: React.FC<IncidentFeedProps> = ({ incidents, onSelect, selectedId }) => {
  return (
    <div className="h-full flex flex-col bg-slate-900 border-r border-slate-700 w-80">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2">
           <AlertTriangle size={16} className="text-sentinel-warning" />
           Detected Events
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {incidents.map((incident) => {
           const isActive = selectedId === incident.id;
           const severityColor = incident.severity === IncidentSeverity.CRITICAL || incident.severity === IncidentSeverity.HIGH
             ? 'border-l-red-500' 
             : 'border-l-amber-500';

           return (
             <div 
               key={incident.id}
               onClick={() => onSelect(incident.id)}
               className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors border-l-4 ${severityColor} ${isActive ? 'bg-slate-800' : ''}`}
             >
               <div className="flex justify-between items-start mb-1">
                 <h3 className="text-sm font-bold text-slate-200 leading-tight">{incident.title}</h3>
                 <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    incident.status === 'action_required' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-700 text-slate-400'
                 }`}>
                   {incident.status === 'action_required' ? 'ACT' : 'ANA'}
                 </span>
               </div>
               
               <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                 {incident.summary}
               </p>

               <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                 <span className="flex items-center gap-1">
                   <Clock size={10} />
                   {new Date(incident.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
                 <span className="flex items-center gap-1">
                   <MapPin size={10} />
                   {incident.location.address?.split(',')[0]}
                 </span>
               </div>
             </div>
           );
        })}
        {incidents.length === 0 && (
          <div className="p-6 text-center text-slate-600 text-sm italic">
            No active anomalies detected.
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentFeed;