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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!result ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Paste JSON Array Payload
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={10}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 font-mono text-xs text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition"
                  placeholder="Paste JSON array..."
                />
              </div>

              {parseError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Total Items</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{result.totalRequested}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                  <div className="text-xs text-emerald-700 uppercase font-semibold">Succeeded</div>
                  <div className="text-xl font-bold text-emerald-700 mt-1">{result.successCount}</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                  <div className="text-xs text-rose-700 uppercase font-semibold">Failed</div>
                  <div className="text-xl font-bold text-rose-700 mt-1">{result.failureCount}</div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 border-b border-slate-200">
                  Item Execution Results
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {result.results.map((res, i) => (
                    <div key={i} className="p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {res.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="font-mono font-medium text-slate-800">#{res.index + 1} [{res.keyIdentifier}]</span>
                        {res.data && <span className="text-slate-500">({renderItemSummary(res.data)})</span>}
                      </div>

                      {res.errorMessage && (
                        <span className="text-rose-700 font-mono text-[11px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
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
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
          >
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
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
