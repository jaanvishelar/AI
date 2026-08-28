import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { LoadingStage } from '../../hooks/useMerchantData';

interface LoadingAnalysisProps {
  stage: LoadingStage;
}

const STAGES = [
  { id: 'understanding', label: 'Dataset understood & schema classified' },
  { id: 'metrics', label: 'Metrics calculated & aggregated' },
  { id: 'trends', label: 'Trends analyzed & anomalies detected' },
  { id: 'reasoning', label: 'AI reasoning & quality evaluated' },
  { id: 'insights', label: 'Evidence-backed insights generated' },
];

export const LoadingAnalysis: React.FC<LoadingAnalysisProps> = ({ stage }) => {
  const getStageStatus = (stageId: string) => {
    const stageIndex = STAGES.findIndex((s) => s.id === stage);
    const targetIndex = STAGES.findIndex((s) => s.id === stageId);

    if (stage === 'ready' || stageIndex > targetIndex) {
      return 'completed';
    }
    if (stageIndex === targetIndex) {
      return 'in-progress';
    }
    return 'pending';
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        {/* Spinner */}
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Analyzing your dataset...
        </h3>
        <p className="text-xs text-slate-600 mb-6">
          Profiling merchant records and constructing automated data science pipeline
        </p>

        {/* Steps */}
        <div className="space-y-3 text-left">
          {STAGES.map((s) => {
            const status = getStageStatus(s.id);
            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium transition-all ${
                  status === 'completed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    : status === 'in-progress'
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 font-semibold'
                    : 'text-slate-600 bg-slate-50'
                }`}
              >
                {status === 'completed' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                )}
                {status === 'in-progress' && (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin flex-shrink-0" />
                )}
                {status === 'pending' && (
                  <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                )}
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
