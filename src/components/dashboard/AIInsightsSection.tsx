import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  TrendingUp, 
  CheckCircle2, 
  Info, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Database,
  RefreshCw
} from 'lucide-react';
import { DatasetAnalysisResult, AIInsightItem, AIConfidence } from '../../types';
import { aiService, AIAnalysisSession } from '../../services/aiService';

interface AIInsightsSectionProps {
  dataset: DatasetAnalysisResult;
  onNavigateToAnalyst?: () => void;
}

export const AIInsightsSection: React.FC<AIInsightsSectionProps> = ({ dataset, onNavigateToAnalyst }) => {
  const [session, setSession] = useState<AIAnalysisSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [openWhyId, setOpenWhyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await aiService.generateInsights(dataset, force);
      setSession(data);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights(false);
  }, [dataset.datasetName]);

  const getCategoryBadge = (category: AIInsightItem['category']) => {
    const colors: Record<string, string> = {
      revenue: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      customer: 'bg-blue-50 text-blue-700 border-blue-200',
      product: 'bg-purple-50 text-purple-700 border-purple-200',
      channel: 'bg-amber-50 text-amber-700 border-amber-200',
      payment: 'bg-rose-50 text-rose-700 border-rose-200',
      risk: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${colors[category] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {category}
      </span>
    );
  };

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

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
              AI Insights Engine
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Powered by Gemini
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Evidence-Backed Merchant Insights
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time synthesis calculated across {dataset.rowCount.toLocaleString()} transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchInsights(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors disabled:opacity-50"
            title="Re-run AI synthesis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {onNavigateToAnalyst && (
            <button
              onClick={onNavigateToAnalyst}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
            >
              <span>Ask AI Analyst</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-4/5" />
              <div className="h-16 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Insights Grid */}
      {!loading && session && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {session.insights.map((insight) => {
            const isWhyOpen = openWhyId === insight.id;

            return (
              <div
                key={insight.id}
                className="bg-slate-50/50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 transition-all shadow-2xs hover:shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Category & Confidence */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {getCategoryBadge(insight.category)}
                    {getConfidenceBadge(insight.confidence)}
                  </div>

                  {/* Title & Finding */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-slate-700 mt-1 leading-relaxed font-medium">
                      {insight.finding}
                    </p>
                  </div>

                  {/* Evidence Box */}
                  <div className="bg-white border border-slate-200/80 rounded-lg p-3 text-xs text-slate-700 font-mono">
                    <span className="font-bold text-slate-500 block mb-0.5 text-[10px] uppercase">
                      Calculated Evidence:
                    </span>
                    {insight.evidence}
                  </div>

                  {/* Recommendation */}
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-900">
                    <div className="flex items-center gap-1 font-bold text-indigo-800 mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Recommended Action:</span>
                    </div>
                    <p className="text-indigo-800 leading-relaxed font-normal">
                      {insight.recommendation}
                    </p>
                  </div>
                </div>

                {/* Why am I seeing this? */}
                {insight.whyDetails && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80">
                    <button
                      onClick={() => setOpenWhyId(isWhyOpen ? null : insight.id)}
                      className="flex items-center justify-between w-full text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        Why am I seeing this?
                      </span>
                      {isWhyOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </button>

                    {isWhyOpen && (
                      <div className="mt-2.5 bg-slate-900 text-slate-200 rounded-lg p-3.5 space-y-2.5 text-xs">
                        <div>
                          <span className="font-bold text-slate-100 uppercase text-[10px] block mb-1">
                            Data Fields Used:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {insight.whyDetails.dataUsed.map((col, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px] border border-slate-700"
                              >
                                {col}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-slate-100 uppercase text-[10px] block mb-0.5">
                            Method:
                          </span>
                          <span className="text-slate-300">{insight.whyDetails.method}</span>
                        </div>

                        <div>
                          <span className="font-bold text-slate-100 uppercase text-[10px] block mb-0.5">
                            Limitations:
                          </span>
                          <span className="text-slate-400 text-[11px]">{insight.whyDetails.limitations}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
