import React from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Menu, 
  Database, 
  Sparkles,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { DatasetAnalysisResult } from '../../types';

interface HeaderProps {
  dataset: DatasetAnalysisResult | null;
  onOpenUpload: () => void;
  onTryDemo: () => void;
  onClearDataset: () => void;
  onBackToLanding: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dataset,
  onOpenUpload,
  onTryDemo,
  onClearDataset,
  onBackToLanding,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 shadow-xs">
      {/* Left branding & Mobile Trigger */}
      <div className="flex items-center gap-3">
        <button
          id="header-mobile-sidebar-toggle"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          id="header-back-home"
          onClick={onBackToLanding}
          className="flex items-center gap-3 text-left group"
          title="Return to Landing Page"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-indigo-700 transition-colors">
            M
          </div>
          <div>
            <div className="flex items-center gap-1 leading-none">
              <span className="font-bold text-slate-900 text-base tracking-tight">MerchantMind</span>
              <span className="text-indigo-600 font-bold text-base">AI</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:block">Data Scientist for Merchants</span>
          </div>
        </button>
      </div>

      {/* Center: Dataset Status Indicator */}
      <div className="flex items-center">
        {dataset ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <Database className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <div className="flex items-center gap-1.5 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs truncate">
                {dataset.datasetName}
              </span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-slate-500 flex-shrink-0 hidden sm:inline">
                {dataset.isDemo ? 'Synthetic Data Enabled' : `${dataset.rowCount.toLocaleString()} rows`}
              </span>
            </div>
            <button
              id="header-clear-dataset"
              onClick={onClearDataset}
              title="Clear current dataset"
              className="ml-1 p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Dataset:</span>
            <span className="font-semibold text-slate-700">No dataset selected</span>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button
          id="header-try-demo-btn"
          onClick={onTryDemo}
          className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          <span>Try Demo Dataset</span>
        </button>

        <button
          id="header-upload-dataset-btn"
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Dataset</span>
        </button>
      </div>
    </header>
  );
};
