import React, { useState, useEffect } from 'react';
import { INITIAL_INCIDENTS, MOCK_STREAMS } from './constants';
import CityMap from './components/CityMap';
import StreamGrid from './components/StreamGrid';
import IncidentFeed from './components/IncidentFeed';
import ReasoningPanel from './components/ReasoningPanel';
import SettingsView from './components/SettingsView';
import { LayoutDashboard, Radio, Settings, ShieldAlert, WifiOff } from 'lucide-react';
import { Incident } from './types';

const App: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [backendError, setBackendError] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'streams' | 'settings'>('dashboard');
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
  
  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || null;

  // Fetch Incidents from Backend
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch(`${backendUrl}/incidents`);
        if (!res.ok) throw new Error("Failed to connect");
        const data = await res.json();
        setIncidents(data);
        setBackendError(false);
      } catch (err) {
        console.error("Backend unreachable, using fallback data if available", err);
        setBackendError(true);
        setIncidents(INITIAL_INCIDENTS);
      }
    };

    fetchIncidents();
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

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
            <div className="text-xs font-mono text-slate-400">
             V.3.0.1 // GEMINI-3-FLASH
          </div>
        </header>

        {/* View Router */}
        {activeTab === 'dashboard' && (
          <main className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
            {/* Left Col: Incidents */}
            <IncidentFeed 
              incidents={incidents} 
              selectedId={selectedIncidentId}
              onSelect={setSelectedIncidentId}
            />

            {/* Center Col: Map & Streams */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top: Map (60%) */}
              <div className="flex-[3] p-4 pb-2 relative">
                 <CityMap 
                   incidents={incidents} 
                   selectedIncidentId={selectedIncidentId} 
                   onSelectIncident={setSelectedIncidentId}
                 />
              </div>
              
              {/* Bottom: Streams (40%) */}
              <div className="flex-[2] p-4 pt-2 border-t border-slate-800 bg-slate-900/40">
                 <div className="flex justify-between items-center mb-2">
                   <h3 className="text-xs font-bold text-slate-400 font-mono uppercase">Live Feeds ({MOCK_STREAMS.length})</h3>
                 </div>
                 <StreamGrid streams={MOCK_STREAMS} />
              </div>
            </div>

            {/* Right Col: AI Reasoning */}
            <div className="w-96 shadow-2xl z-10">
               <ReasoningPanel incident={selectedIncident} streams={MOCK_STREAMS} />
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
                  {MOCK_STREAMS.length} Active Sources
                </div>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                 <StreamGrid streams={MOCK_STREAMS} />
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
