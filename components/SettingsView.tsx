import React from 'react';
import { Activity, Database, Shield, ToggleLeft, ToggleRight, Server } from 'lucide-react';

interface SettingsViewProps {
  backendUrl: string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ backendUrl }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-8 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="border-b border-slate-800 pb-6">
          <h2 className="text-3xl font-bold text-slate-100 font-mono tracking-tight">SYSTEM CONFIGURATION</h2>
          <p className="text-slate-400 mt-2">Manage Urban Pulse Sentinel parameters and backend connections.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* System Status Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="text-emerald-400" size={20} />
              System Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 font-mono text-sm">Core Service</span>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">ONLINE</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 font-mono text-sm">Gemini Model</span>
                <span className="text-indigo-400 text-xs font-bold bg-indigo-500/10 px-2 py-1 rounded">GEMINI-3-FLASH</span>
              </div>
               <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 font-mono text-sm">Uptime</span>
                <span className="text-slate-200 text-sm font-mono">14h 22m 10s</span>
              </div>
            </div>
          </div>

          {/* Ingestion Settings */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Database className="text-blue-400" size={20} />
              Stream Ingestion
            </h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-200 font-medium">Video Analysis</div>
                    <div className="text-slate-500 text-xs">Real-time object detection</div>
                  </div>
                  <ToggleRight className="text-indigo-500 cursor-pointer hover:text-indigo-400 transition-colors" size={32} />
               </div>
               <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-200 font-medium">Social Sentinel</div>
                    <div className="text-slate-500 text-xs">Keyword monitoring (X/Twitter)</div>
                  </div>
                  <ToggleRight className="text-indigo-500 cursor-pointer hover:text-indigo-400 transition-colors" size={32} />
               </div>
               <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-200 font-medium">Acoustic Arrays</div>
                    <div className="text-slate-500 text-xs">Decibel anomaly detection</div>
                  </div>
                   <ToggleLeft className="text-slate-600 cursor-pointer hover:text-slate-500 transition-colors" size={32} />
               </div>
            </div>
          </div>

          {/* Security */}
           <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl md:col-span-2">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="text-amber-400" size={20} />
              Security & Permissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="p-4 bg-slate-950 rounded border border-slate-800 flex flex-col items-center text-center gap-2">
                  <div className="text-slate-400 text-xs uppercase font-bold">Role</div>
                  <div className="text-white font-mono">ADMINISTRATOR</div>
               </div>
                <div className="p-4 bg-slate-950 rounded border border-slate-800 flex flex-col items-center text-center gap-2">
                  <div className="text-slate-400 text-xs uppercase font-bold">Region</div>
                  <div className="text-white font-mono">LOS ANGELES (DOWNTOWN)</div>
               </div>
                <div className="p-4 bg-slate-950 rounded border border-slate-800 flex flex-col items-center text-center gap-2">
                  <div className="text-slate-400 text-xs uppercase font-bold">Auth Token</div>
                  <div className="text-emerald-400 text-xs font-mono">ACTIVE (Expires 2h)</div>
               </div>
            </div>
          </div>
          
           {/* Backend Config */}
           <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl md:col-span-2">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Server className="text-slate-400" size={20} />
              Backend Configuration
            </h3>
            <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-1">
                 <label className="text-xs text-slate-400 font-bold uppercase">API Endpoint</label>
                 <div className="flex gap-2">
                    <input type="text" value={backendUrl} readOnly className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-300 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                    <button className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded border border-slate-700 hover:bg-slate-700 transition-colors">TEST</button>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsView;
