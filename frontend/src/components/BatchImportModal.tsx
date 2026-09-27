import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Loader2,
  FileText,
  ShieldAlert,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { BatchResponse } from '../types/customer';
import { parseCsv, downloadCsvFile } from '../utils/csvParser';
import { Button, Badge } from './ui';

interface BatchImportModalProps<T, R> {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  sampleTemplate: string; // Default CSV string template
  templateFilename?: string; // Filename for template download e.g. "products_template.csv"
  parseInput?: (text: string) => T[]; // Optional custom parser; defaults to parseCsv
  onImport: (items: T[]) => Promise<BatchResponse<R>>;
  renderItemSummary: (item: R) => string;
}

export function BatchImportModal<T, R>({
  title,
  isOpen,
  onClose,
  sampleTemplate,
  templateFilename = 'import_template.csv',
  parseInput,
  onImport,
  renderItemSummary,
}: BatchImportModalProps<T, R>) {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('text');
  const [csvText, setCsvText] = useState(sampleTemplate);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<T[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BatchResponse<R> | null>(null);

  // Parse CSV text on change
  useEffect(() => {
    if (!csvText.trim()) {
      setParsedItems([]);
      setParseError(null);
      return;
    }

    try {
      const items = parseInput ? parseInput(csvText) : parseCsv<T>(csvText);
      setParsedItems(items);
      setParseError(items.length === 0 ? 'No valid records parsed from CSV content.' : null);
    } catch (e: any) {
      setParsedItems([]);
      setParseError('CSV Syntax Error: ' + e.message);
    }
  }, [csvText, parseInput]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        setActiveTab('text');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    downloadCsvFile(templateFilename, sampleTemplate);
  };

  const handleImport = async () => {
    setParseError(null);
    setResult(null);

    if (parsedItems.length === 0) {
      setParseError('No records to import. Please supply valid CSV rows.');
      return;
    }

    setLoading(true);
    try {
      const response = await onImport(parsedItems);
      setResult(response);
    } catch (err: any) {
      setParseError(err.response?.data?.message || err.message || 'Batch request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setParseError(null);
    setCsvText(sampleTemplate);
    setUploadedFileName(null);
  };

  const isRollback = result && result.failureCount > 0 && result.successCount === 0;

  // Extract preview headers & sample rows from parsed items
  const previewHeaders = parsedItems.length > 0 ? Object.keys(parsedItems[0] as any) : [];
  const previewRows = parsedItems.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500">
                CSV Template Import with Atomic Rollback Protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!result ? (
            <>
              {/* Action Ribbon: Template Download & Tab Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'text'
                        ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    CSV Text Editor
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'upload'
                        ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upload CSV File {uploadedFileName && `(${uploadedFileName})`}
                  </button>
                </div>

                <Button
                  variant="secondary"
                  size="xs"
                  icon={<Download className="w-3.5 h-3.5 text-blue-600" />}
                  onClick={handleDownloadTemplate}
                >
                  Download CSV Template
                </Button>
              </div>

              {/* Atomic Safety Notice */}
              <div className="bg-blue-50/70 border border-blue-200/70 text-blue-900 text-[11px] p-3 rounded-xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">All-or-Nothing Atomic Guarantee:</strong> If any single row fails validation or contains duplicate data, all changes will be automatically reverted and 0 records will be saved.
                </div>
              </div>

              {/* Tab 1: Upload CSV File */}
              {activeTab === 'upload' && (
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50/50 transition">
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-xs text-slate-800">
                    Drag and drop your <span className="text-blue-600">.csv</span> file here, or click to browse
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Accepts standard comma-separated files matching the template structure.
                  </p>
                  <input
                    id="batch-file-upload"
                    name="csvFile"
                    aria-label="Upload CSV file"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              )}

              {/* Tab 2: CSV Text Editor */}
              {activeTab === 'text' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="batch-csv-textarea" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      CSV Data Rows
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {parsedItems.length} valid record(s) parsed
                    </span>
                  </div>
                  <textarea
                    id="batch-csv-textarea"
                    name="csvData"
                    aria-label="CSV Data Rows input editor"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 font-mono text-xs text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition"
                    placeholder="sku,name,description,price,stockQuantity,category..."
                  />
                </div>
              )}

              {/* Error Message */}
              {parseError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{parseError}</span>
                </div>
              )}

              {/* Live Preview Table */}
              {parsedItems.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 border-b border-slate-200 flex items-center justify-between">
                    <span>Parsed Data Preview ({parsedItems.length} items)</span>
                    <Badge variant="success" size="sm">
                      Ready to Import
                    </Badge>
                  </div>
                  <div className="overflow-x-auto max-h-40 text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider">
                          <th className="p-2">#</th>
                          {previewHeaders.slice(0, 5).map((h) => (
                            <th key={h} className="p-2 font-mono">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {previewRows.map((row: any, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-2 text-slate-400 font-sans">{idx + 1}</td>
                            {previewHeaders.slice(0, 5).map((h) => (
                              <td key={h} className="p-2 text-slate-700 truncate max-w-[140px]">
                                {String(row[h] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results View */
            <div className="space-y-4">
              {/* Rollback Alert if All-or-Nothing Reverted */}
              {isRollback ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-xl flex items-start gap-3 shadow-xs">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-rose-900">
                      Atomic Batch Rolled Back — 0 Records Persisted
                    </h4>
                    <p className="text-[11px] text-rose-700 mt-1">
                      A record in this batch failed execution. To maintain database consistency, all prior inserts were completely reverted.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center gap-3 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs font-semibold">
                    Batch import completed successfully! {result.successCount} record(s) persisted to the database.
                  </div>
                </div>
              )}

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Requested</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{result.totalRequested}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-emerald-700 uppercase font-semibold">Succeeded</div>
                  <div className="text-xl font-bold text-emerald-700 mt-1">{result.successCount}</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-rose-700 uppercase font-semibold">Failed / Reverted</div>
                  <div className="text-xl font-bold text-rose-700 mt-1">{result.failureCount}</div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 border-b border-slate-200">
                  Item Execution Diagnostics
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {result.results.map((res, i) => (
                    <div key={i} className="p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        {res.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="font-mono font-bold text-slate-800">
                          #{res.index + 1} [{res.keyIdentifier}]
                        </span>
                        {res.data && (
                          <span className="text-slate-500 truncate">({renderItemSummary(res.data)})</span>
                        )}
                      </div>

                      {res.errorMessage && (
                        <span className="text-rose-700 font-mono text-[10px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200 shrink-0 max-w-[280px] truncate">
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
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          {result ? (
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
            >
              Import Another Batch
            </Button>
          ) : (
            <div className="text-[11px] text-slate-500">
              Template: <span className="font-mono text-slate-700 font-semibold">{templateFilename}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={onClose}>
              {result ? 'Done' : 'Cancel'}
            </Button>

            {!result && (
              <Button
                variant="primary"
                size="sm"
                loading={loading}
                disabled={parsedItems.length === 0}
                icon={<Upload className="w-4 h-4" />}
                onClick={handleImport}
              >
                {loading ? 'Processing Batch...' : `Start Batch Import (${parsedItems.length})`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
