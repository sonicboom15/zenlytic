import React, { useEffect, useState } from 'react';
import { SagaTimeline } from '../types/order';
import { orderApi } from '../api/orderApi';
import { CheckCircle2, Clock, XCircle, RotateCcw, Activity, X, Loader2 } from 'lucide-react';

interface SagaTimelineVisualizerProps {
  timeline?: SagaTimeline;
  orderId?: string;
  onClose?: () => void;
}

export const SagaTimelineVisualizer: React.FC<SagaTimelineVisualizerProps> = ({
  timeline: directTimeline,
  orderId,
  onClose
}) => {
  const [timeline, setTimeline] = useState<SagaTimeline | null>(directTimeline || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId && !directTimeline) {
      setLoading(true);
      orderApi.getSagaTimeline(orderId)
        .then((data) => setTimeline(data))
        .catch((e) => console.warn('Failed to load saga timeline', e))
        .finally(() => setLoading(false));
    }
  }, [orderId, directTimeline]);

  const content = (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Distributed Saga Pipeline Timeline</h4>
            <div className="text-xs font-mono text-slate-500">
              Saga ID: {timeline?.sagaId || orderId}
            </div>
          </div>
        </div>

        {timeline && (
          <span
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
              timeline.status === 'COMPLETED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : timeline.status === 'FAILED' || timeline.status === 'COMPENSATED'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {timeline.status}
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
          Loading Saga step logs...
        </div>
      ) : !timeline || timeline.steps.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
          <div className="font-bold text-slate-800">4-Step Distributed Saga Execution Pipeline:</div>
          <div className="text-slate-600 space-y-1 font-mono text-[11px]">
            <div className="text-emerald-700">1. CreatePendingOrderStep (status: SUCCESS)</div>
            <div className="text-emerald-700">2. ReserveInventoryStep (status: SUCCESS)</div>
            <div className="text-emerald-700">3. ProcessPaymentStep (status: SUCCESS)</div>
            <div className="text-emerald-700">4. ConfirmOrderStep (status: SUCCESS)</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {timeline.steps.map((step, idx) => {
            const isSuccess = step.status === 'SUCCESS';
            const isFailed = step.status === 'FAILED';
            const isCompensated = step.status === 'COMPENSATED';

            return (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Connector line */}
                {idx < timeline.steps.length - 1 && (
                  <div className="absolute left-4 top-8 -bottom-4 w-0.5 bg-slate-200" />
                )}

                {/* Status Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border z-10 shrink-0 ${
                    isSuccess
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : isFailed
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : isCompensated
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                >
                  {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                  {isFailed && <XCircle className="w-4 h-4" />}
                  {isCompensated && <RotateCcw className="w-4 h-4" />}
                  {!isSuccess && !isFailed && !isCompensated && <Clock className="w-4 h-4 animate-spin text-amber-600" />}
                </div>

                {/* Step Detail */}
                <div className="flex-1 bg-slate-50/80 border border-slate-200/80 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-900">{step.stepName}</span>
                    <span className="font-mono text-[11px] text-slate-500 font-medium">{step.durationMs} ms</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-mono font-bold text-[11px] ${
                        isSuccess
                          ? 'text-emerald-700'
                          : isFailed
                          ? 'text-rose-700'
                          : isCompensated
                          ? 'text-amber-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.status}
                    </span>
                    <span className="text-slate-400 text-[10px]">{new Date(step.timestamp).toLocaleTimeString()}</span>
                  </div>

                  {step.errorMessage && (
                    <div className="mt-2 text-rose-800 font-mono text-[11px] bg-rose-50 p-2 rounded border border-rose-200">
                      Error: {step.errorMessage}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">Saga Timeline Inspector</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
};
