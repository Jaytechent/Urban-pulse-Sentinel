import React from 'react';
import { Stream, StreamType } from '../types';
import { Video, Activity, Twitter } from 'lucide-react';

interface StreamGridProps {
  streams: Stream[];
}

const StreamGrid: React.FC<StreamGridProps> = ({ streams }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full overflow-y-auto pr-2">
      {streams.map((stream) => (
        <div key={stream.id} className="relative group bg-slate-900 rounded border border-slate-800 overflow-hidden aspect-video flex flex-col">
          
          {/* Header Overlay */}
          <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start">
             <div className="flex items-center gap-1.5">
                {stream.type === StreamType.VIDEO && <Video size={12} className="text-red-400" />}
                {stream.type === StreamType.SOCIAL && <Twitter size={12} className="text-blue-400" />}
                {stream.type === StreamType.SENSOR && <Activity size={12} className="text-emerald-400" />}
                <span className="text-[10px] font-mono text-white font-bold tracking-wider">{stream.id}</span>
             </div>
             <div className="flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
               <span className="text-[10px] text-red-400 font-mono uppercase">LIVE</span>
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-slate-950 flex items-center justify-center relative">
            {stream.type === StreamType.VIDEO ? (
              <>
                <img 
                  src={stream.endpoint} 
                  alt={stream.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                {/* Tech overlay lines */}
                <div className="absolute inset-0 border-[0.5px] border-white/10 pointer-events-none"></div>
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-green-400 bg-black/50 px-1">
                   OBJ_DETECT: 12
                </div>
              </>
            ) : stream.type === StreamType.SOCIAL ? (
               <div className="p-4 w-full h-full flex flex-col justify-between">
                  <div className="space-y-2">
                     <div className="h-1 bg-blue-500/20 rounded overflow-hidden">
                        <div className="h-full bg-blue-500 w-3/4"></div>
                     </div>
                     <div className="h-1 bg-blue-500/20 rounded overflow-hidden">
                        <div className="h-full bg-blue-500 w-1/2"></div>
                     </div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                     Inflow: High<br/>
                     Keywords: "Stuck", "Delay"
                  </div>
               </div>
            ) : (
              <div className="w-full h-full p-4 flex items-end justify-between gap-1">
                 {[40, 60, 30, 80, 50, 90, 45, 60].map((h, i) => (
                    <div key={i} className="bg-emerald-500/50 w-full rounded-t" style={{height: `${h}%`}}></div>
                 ))}
              </div>
            )}
          </div>

          {/* Footer Label */}
          <div className="bg-slate-950 p-2 border-t border-slate-800">
            <h4 className="text-xs text-slate-200 truncate font-medium">{stream.name}</h4>
          </div>
        </div>
      ))}
      
      {/* Add Stream Button Placeholder */}
      <div className="border border-slate-800 border-dashed rounded flex flex-col items-center justify-center gap-2 bg-slate-900/40 hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-400 hover:text-slate-200">
         <span className="text-2xl">+</span>
         <span className="text-xs font-mono">ADD SOURCE</span>
      </div>
    </div>
  );
};

export default StreamGrid;
