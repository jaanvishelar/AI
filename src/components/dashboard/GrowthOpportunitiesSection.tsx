import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Calculator, 
  ArrowRight, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { DatasetAnalysisResult, GrowthOpportunity, AIConfidence } from '../../types';
import { aiService, AIAnalysisSession } from '../../services/aiService';

interface GrowthOpportunitiesSectionProps {
  dataset: DatasetAnalysisResult;
  onNavigateToAnalyst?: () => void;
  onNavigateToGrowth?: () => void;
}

export const GrowthOpportunitiesSection: React.FC<GrowthOpportunitiesSectionProps> = ({
  dataset,
  onNavigateToAnalyst,
  onNavigateToGrowth,
}) => {
  const [session, setSession] = useState<AIAnalysisSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [openWhyId, setOpenWhyId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    aiService.generateInsights(dataset, false).then((data) => {
      if (isMounted) {
        setSession(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [dataset.datasetName]);

  const getConfidenceBadge = (confidence: AIConfidence) => {
    if (confidence === 'High') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          High Confidence
        </span>
      );
    }
    if (confidence === 'Medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Info className="w-3 h-3 text-amber-600" />
          Medium Confidence
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <AlertCircle className="w-3 h-3 text-slate-500" />
        Low Confidence
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="h-5 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const opportunities = session?.growthOpportunities || [];
  if (opportunities.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Growth Engine
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Opportunity Sizing
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Revenue Growth Opportunities
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Model-identified levers grounded in historical customer order behavior and basket sizes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onNavigateToGrowth && (
            <button
              onClick={onNavigateToGrowth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              <span>Autonomous Growth Engine</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          {onNavigateToAnalyst && (
            <button
              onClick={onNavigateToAnalyst}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <span>Ask AI Analyst</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {opportunities.map((opp) => {
          const isWhyOpen = openWhyId === opp.id;

          return (
            <div
              key={opp.id}
              className="bg-slate-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl p-4 transition-all shadow-2xs hover:shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100/70 text-emerald-800">
                    <Target className="w-3 h-3 text-emerald-700" />
                    Growth Play
                  </span>
                  {getConfidenceBadge(opp.confidence)}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {opp.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <span className="text-slate-400">Target:</span>
                    <span className="text-slate-700">{opp.targetSegment}</span>
                  </div>
                </div>

                {/* Estimated Impact Box */}
                {opp.estimatedImpact && (
                  <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-lg p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                      <span>Potential Revenue Lift:</span>
                      <span className="text-[9px] bg-emerald-200/60 px-1 rounded text-emerald-900">Estimated</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-700 mt-0.5">
                      {opp.estimatedImpact}
                    </div>
                    {opp.calculationFormula && (
                      <div className="mt-1 flex items-start gap-1 text-[11px] text-emerald-800 font-mono">
                        <Calculator className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{opp.calculationFormula}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actionable Next Step */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
                  <span className="font-bold text-slate-800 block mb-0.5">
                    Recommended Next Step:
                  </span>
                  <p className="leading-relaxed text-slate-600">
                    {opp.recommendedNextStep}
                  </p>
                </div>
              </div>

              {/* Why am I seeing this? */}
              {opp.whyDetails && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                  <button
                    onClick={() => setOpenWhyId(isWhyOpen ? null : opp.id)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-indigo-600" />
                      Why am I seeing this?
                    </span>
                    {isWhyOpen ? (
                      <ChevronUp className="w-3 h-3 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-indigo-600" />
                    )}
                  </button>

                  {isWhyOpen && (
                    <div className="mt-2 bg-slate-900 text-slate-200 rounded-lg p-3 space-y-2 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-100 uppercase text-[9px] block">
                          Method:
                        </span>
                        <span className="text-slate-300">{opp.whyDetails.method}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-100 uppercase text-[9px] block">
                          Limitations:
                        </span>
                        <span className="text-slate-400">{opp.whyDetails.limitations}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
