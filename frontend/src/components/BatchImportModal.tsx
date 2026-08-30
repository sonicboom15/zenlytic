import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { BatchResponse } from '../types/customer';

interface BatchImportModalProps<T, R> {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  sampleTemplate: string;
  parseInput: (text: string) => T[];
  onImport: (items: T[]) => Promise<BatchResponse<R>>;
  renderItemSummary: (item: R) => string;
}

export function BatchImportModal<T, R>({
  title,
  isOpen,
  onClose,
  sampleTemplate,
  parseInput,
  onImport,
  renderItemSummary,
}: BatchImportModalProps<T, R>) {
  const [inputText, setInputText] = useState(sampleTemplate);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BatchResponse<R> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = async () => {
    setParseError(null);
    setResult(null);

    let items: T[] = [];
    try {
      items = parseInput(inputText);
      if (!items || items.length === 0) {
        setParseError('No valid items found in the input payload.');
        return;
      }
    } catch (e: any) {
      setParseError('Parsing failed: ' + e.message);
      return;
    }

    setLoading(true);
    try {
      const response = await onImport(items);
      setResult(response);
    } catch (err: any) {
      setParseError(err.response?.data?.message || err.message || 'Batch request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!result ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Paste JSON Array Payload
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  placeholder="Paste JSON array..."
                />
              </div>

              {parseError && (
                <div className="bg-rose-950/60 border border-rose-800 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl text-center">
                  <div className="text-xs text-slate-400 uppercase">Total Items</div>
                  <div className="text-xl font-bold text-white mt-1">{result.totalRequested}</div>
                </div>
                <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl text-center">
                  <div className="text-xs text-emerald-400 uppercase">Succeeded</div>
                  <div className="text-xl font-bold text-emerald-300 mt-1">{result.successCount}</div>
                </div>
                <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl text-center">
                  <div className="text-xs text-rose-400 uppercase">Failed</div>
                  <div className="text-xl font-bold text-rose-300 mt-1">{result.failureCount}</div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-800/50 px-4 py-2 text-xs font-semibold text-slate-300 border-b border-slate-800">
                  Item Execution Results
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                  {result.results.map((res, i) => (
                    <div key={i} className="p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {res.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        )}
                        <span className="font-mono text-slate-200">#{res.index + 1} [{res.keyIdentifier}]</span>
                        {res.data && <span className="text-slate-400">({renderItemSummary(res.data)})</span>}
                      </div>

                      {res.errorMessage && (
                        <span className="text-rose-400 font-mono text-[11px] bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
                          {res.errorMessage}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-800/40 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {loading ? 'Processing Batch...' : 'Start Batch Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

