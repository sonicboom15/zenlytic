import React from 'react';
import { SagaTimeline } from '../types/order';
import { CheckCircle2, Clock, XCircle, RotateCcw, Activity } from 'lucide-react';

interface SagaTimelineVisualizerProps {
  timeline: SagaTimeline;
}

export const SagaTimelineVisualizer: React.FC<SagaTimelineVisualizerProps> = ({ timeline }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-indigo-400" />
          <div>
            <h4 className="text-sm font-bold text-white">Distributed Saga Pipeline Timeline</h4>
            <div className="text-xs font-mono text-slate-400">Saga ID: {timeline.sagaId}</div>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            timeline.status === 'COMPLETED'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : timeline.status === 'FAILED' || timeline.status === 'COMPENSATED'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}
        >
          {timeline.status}
        </span>
      </div>

      <div className="space-y-4">
        {timeline.steps.map((step, idx) => {
          const isSuccess = step.status === 'SUCCESS';
          const isFailed = step.status === 'FAILED';
          const isCompensated = step.status === 'COMPENSATED';

          return (
            <div key={idx} className="relative flex items-start gap-4">
              {/* Connector line */}
              {idx < timeline.steps.length - 1 && (
                <div className="absolute left-4 top-8 -bottom-4 w-0.5 bg-slate-800" />
              )}

              {/* Status Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border z-10 flex-shrink-0 ${
                  isSuccess
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                    : isFailed
                    ? 'bg-rose-950 border-rose-500 text-rose-400'
                    : isCompensated
                    ? 'bg-amber-950 border-amber-500 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                {isFailed && <XCircle className="w-4 h-4" />}
                {isCompensated && <RotateCcw className="w-4 h-4" />}
                {!isSuccess && !isFailed && !isCompensated && <Clock className="w-4 h-4 animate-spin" />}
              </div>

              {/* Step Detail */}
              <div className="flex-1 bg-slate-800/40 border border-slate-800/80 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white">{step.stepName}</span>
                  <span className="font-mono text-[11px] text-slate-400">{step.durationMs} ms</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-mono font-medium ${
                      isSuccess
                        ? 'text-emerald-400'
                        : isFailed
                        ? 'text-rose-400'
                        : isCompensated
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.status}
                  </span>
                  <span className="text-slate-500 text-[10px]">{new Date(step.timestamp).toLocaleTimeString()}</span>
                </div>

                {step.errorMessage && (
                  <div className="mt-2 text-rose-300 font-mono text-[11px] bg-rose-950/50 p-2 rounded border border-rose-800/40">
                    Error: {step.errorMessage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

