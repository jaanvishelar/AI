import React from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Check
} from 'lucide-react';
import { DatasetAnalysisResult } from '../../types';

interface CleaningModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: DatasetAnalysisResult;
}

export const CleaningModal: React.FC<CleaningModalProps> = ({
  isOpen,
  onClose,
  dataset,
}) => {
  if (!isOpen) return null;

  const { cleaningSuggestions, qualityScore } = dataset;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        id="cleaning-modal-content"
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Data Preparation & Cleaning Review
              </h3>
              <p className="text-xs text-slate-600">
                Non-destructive data health assessment for {dataset.datasetName}
              </p>
            </div>
          </div>
          <button
            id="cleaning-modal-close"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Guaranteed Non-Destructive Banner */}
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-start gap-3 text-xs text-indigo-950">
            <ShieldCheck className="w-5 h-5 text-indigo-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-900 block mb-0.5">
                Data Integrity Principle: Zero Overwrite
              </span>
              <span>
                MerchantMind AI preserves your original source records in their exact state. Cleaning suggestions provide sanitized views for analytical algorithms while leaving uploaded files 100% unaltered.
              </span>
            </div>
          </div>

          {/* Quality Score Quick Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-600 block">Overall Health Score</span>
              <span className="text-xl font-bold text-slate-900">
                {qualityScore.score} / 100 ({qualityScore.grade})
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-600 block">Complete Records</span>
              <span className="text-sm font-bold text-emerald-700">
                {qualityScore.breakdown.completeValuesPct}%
              </span>
            </div>
          </div>

          {/* Suggestions List */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Detected Anomalies & Recommendations
            </h4>
            
            {cleaningSuggestions.length > 0 ? (
              <div className="space-y-3">
                {cleaningSuggestions.map((sug) => (
                  <div key={sug.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          sug.severity === 'high' ? 'text-rose-500' : 'text-amber-500'
                        }`} />
                        <span className="font-bold text-slate-900">{sug.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        sug.severity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sug.affectedCount} affected
                      </span>
                    </div>

                    <p className="text-slate-600 mb-2 leading-relaxed">
                      {sug.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[11px]">
                      <strong className="text-indigo-700">Suggested Action:</strong> {sug.recommendedAction}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-600 bg-slate-50 rounded-xl border border-slate-200">
                No cleaning suggestions required. Your dataset passes all health standards!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-600 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Original dataset remains untouched
          </span>
          <button
            id="cleaning-modal-dismiss-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
};
