import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Database,
  AlertCircle
} from 'lucide-react';

interface EmptyStateProps {
  onUploadFile: (file: File) => void;
  onLoadDemo: () => void;
  error?: string | null;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onUploadFile,
  onLoadDemo,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4">
      {/* Error Alert if any */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Upload Notice:</span> {error}
          </div>
        </div>
      )}

      {/* Main Upload Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 sm:p-12 text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Phase 1 Foundation
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Start with your merchant data
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
            Upload a CSV or Excel file and MerchantMind AI will automatically profile your data and prepare it for analysis.
          </p>

          {/* Drag & Drop Zone */}
          <div
            id="empty-state-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 transition-all cursor-pointer flex flex-col items-center justify-center ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
              id="empty-state-file-input"
            />

            <div className="w-14 h-14 rounded-2xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <p className="text-sm font-semibold text-slate-800 mb-1">
              Click to browse or drag & drop your dataset here
            </p>
            <p className="text-xs text-slate-600 mb-4">
              Supported formats: <strong className="text-slate-700">CSV</strong> or <strong className="text-slate-700">XLSX</strong> (Max 10 MB)
            </p>

            <button
              type="button"
              id="empty-state-upload-button"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Dataset
            </button>
          </div>

          {/* Privacy & Safe Profiling Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600 mt-5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Non-destructive analysis: Your original uploaded dataset is never modified or overwritten.</span>
          </div>
        </div>

        {/* Demo Dataset Callout Box */}
        <div className="bg-slate-50/90 border-t border-slate-200 p-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Don't have a dataset? Try our demo.
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Load <strong>UrbanCart</strong> synthetic retail data (~5,280 transactions) with real-world quality variations.
              </p>
            </div>
          </div>

          <button
            id="empty-state-load-demo-button"
            onClick={onLoadDemo}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>Load Demo Dataset</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
