import React, { useEffect, useState } from 'react';
import { Incident, Stream } from '../types';
import { generateIncidentAnalysis } from '../services/geminiService';
import { Bot, BrainCircuit, Terminal, AlertTriangle, CheckCircle } from 'lucide-react';

interface ReasoningPanelProps {
  incident: Incident | null;
  streams: Stream[];
}

const ReasoningPanel: React.FC<ReasoningPanelProps> = ({ incident, streams }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const runAnalysis = async () => {
      if (!incident) {
        setAnalysis(null);
        return;
      }

      // If incident already has a hypothesis, use it (cached)
      if (incident.hypothesis) {
        setAnalysis({
          reasoning_steps: incident.hypothesis.reasoningSteps,
          hypothesis_text: incident.summary, // Fallback if direct text isn't in model
          recommended_action: incident.hypothesis.recommendedAction,
          confidence_score: incident.hypothesis.confidenceScore
        });
        return;
      }

      // Otherwise, query Gemini (Simulation of Agent)
      setLoading(true);
      const resultJson = await generateIncidentAnalysis(incident, streams);
      try {
        const parsed = JSON.parse(resultJson);
        setAnalysis(parsed);
      } catch (e) {
        console.error("Failed to parse JSON", e);
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
  }, [incident, streams]);

  if (!incident) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 border-l border-slate-700 bg-slate-900/50">
        <BrainCircuit size={48} className="mb-4 opacity-50" />
        <p className="text-sm font-mono text-center">SELECT AN INCIDENT TO INITIALIZE REASONING ENGINE</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-700">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Bot className="text-sentinel-accent" size={20} />
          <h2 className="font-bold text-slate-100 font-mono">AGENT REASONING</h2>
        </div>
        <div className="text-xs font-mono text-sentinel-accent animate-pulse">
           {loading ? 'ANALYZING...' : 'LIVE'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Context Header */}
        <div className="bg-slate-800/40 p-3 rounded border border-slate-700">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Target Event</h3>
          <p className="text-white font-medium">{incident.title}</p>
          <div className="flex gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded font-bold ${
              incident.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {incident.severity}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
              CONFIDENCE: {analysis?.confidence_score ? (analysis.confidence_score * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>

        {loading ? (
           <div className="space-y-2 font-mono text-sm text-green-400">
             <p className="animate-pulse">_ Accessing multimodal streams...</p>
             <p className="animate-pulse delay-75">_ Fusing video/sensor data...</p>
             <p className="animate-pulse delay-150">_ Generating hypothesis...</p>
           </div>
        ) : analysis ? (
          <>
            {/* Thought Process / Reasoning Steps */}
            <div>
              <h3 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-3 font-mono">
                <Terminal size={14} /> Reasoning Chain
              </h3>
              <ul className="space-y-3">
                {analysis.reasoning_steps?.map((step: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-300">
                    <span className="text-slate-600 font-mono">0{idx + 1}</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hypothesis */}
            <div className="p-3 rounded border border-blue-900/50 bg-blue-950/20">
              <h3 className="text-xs font-bold text-blue-400 uppercase mb-1 font-mono">Hypothesis</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                {analysis.hypothesis_text}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="p-4 rounded border border-green-900/50 bg-green-950/20 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <h3 className="flex items-center gap-2 text-xs font-bold text-green-400 uppercase mb-2 font-mono">
                <CheckCircle size={14} /> Recommended Intervention
              </h3>
              <p className="text-white text-lg font-bold mb-4">
                {analysis.recommended_action}
              </p>
              
              <div className="flex gap-2">
                 <button className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 rounded transition-colors shadow-lg shadow-green-900/20">
                    AUTHORIZE ACTION
                 </button>
                 <button className="px-3 border border-slate-600 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded transition-colors">
                    DISMISS
                 </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-red-400 text-sm font-mono">
             <AlertTriangle size={16} className="inline mr-2"/>
             Analysis Unavailable
          </div>
        )}
      </div>
    </div>
  );
};

export default ReasoningPanel;