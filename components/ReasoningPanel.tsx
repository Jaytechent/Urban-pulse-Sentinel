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
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionStatus, setActionStatus] = useState<'idle' | 'authorized' | 'dismissed'>('idle');

  useEffect(() => {
    const runAnalysis = async () => {
      if (!incident) {
        setAnalysis(null);
        setActionStatus('idle');
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
        setActionStatus('idle');
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
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-700 relative">
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
                 <button
                   onClick={() => setShowActionModal(true)}
                   className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 rounded transition-colors shadow-lg shadow-green-900/20"
                 >
                    AUTHORIZE ACTION
                 </button>
                 <button
                   onClick={() => setActionStatus('dismissed')}
                   className="px-3 border border-slate-600 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded transition-colors"
                 >
                    DISMISS
                 </button>
              </div>
            </div>

            {actionStatus !== 'idle' && (
              <div
                className={`text-xs font-mono px-3 py-2 rounded border ${
                  actionStatus === 'authorized'
                    ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-700 text-slate-400'
                }`}
              >
                {actionStatus === 'authorized'
                  ? 'ACTION AUTHORIZED: Dispatch simulation queued.'
                  : 'ACTION DISMISSED: Monitoring continues.'}
              </div>
            )}
          </>
        ) : (
          <div className="text-red-400 text-sm font-mono">
             <AlertTriangle size={16} className="inline mr-2"/>
             Analysis Unavailable
          </div>
        )}
      </div>
      {showActionModal && analysis && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">
                Confirm Intervention
              </h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                CLOSE
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-slate-400 text-xs uppercase font-mono">Recommended Action</p>
              <p className="text-white text-lg font-semibold">{analysis.recommended_action}</p>
              <p className="text-slate-400 text-xs uppercase font-mono">Why this action?</p>
              <p className="text-slate-200 text-sm leading-relaxed">{analysis.hypothesis_text}</p>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                Confidence:
                <span className="text-slate-200 font-semibold">
                  {(analysis.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setActionStatus('authorized');
                  setShowActionModal(false);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded transition-colors"
              >
                CONFIRM & SIMULATE
              </button>
              <button
                onClick={() => {
                  setActionStatus('dismissed');
                  setShowActionModal(false);
                }}
                className="flex-1 border border-slate-600 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReasoningPanel;
