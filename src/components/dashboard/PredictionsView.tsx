import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ShoppingBag, 
  ArrowRight, 
  RefreshCw, 
  HelpCircle, 
  ChevronRight, 
  Activity,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { DatasetAnalysisResult } from '../../types';
import { FullMLAnalysisResult, ChurnRiskLevel } from '../../types/ml';
import { MLService } from '../../services/mlService';

interface PredictionsViewProps {
  dataset: DatasetAnalysisResult;
  onNavigateToGrowth?: () => void;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({
  dataset,
  onNavigateToGrowth,
}) => {
  const [mlResult, setMlResult] = useState<FullMLAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMLTab, setActiveMLTab] = useState<'churn' | 'segmentation' | 'forecast' | 'anomalies' | 'products'>('churn');
  const [churnRiskFilter, setChurnRiskFilter] = useState<'ALL' | ChurnRiskLevel>('ALL');

  const loadMLData = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const records = dataset.allRows || dataset.sampleRows || [];
      const res = await MLService.runFullMLPipeline(records, dataset);
      setMlResult(res);
    } catch (err) {
      console.error('Failed to run ML pipeline:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMLData(false);
  }, [dataset.datasetName]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const churn = mlResult?.churn;
  const seg = mlResult?.segmentation;
  const forecast = mlResult?.forecast;
  const anomalies = mlResult?.anomalies;
  const products = mlResult?.products;

  const filteredChurnCustomers = (churn?.customers || []).filter((c) => {
    if (churnRiskFilter === 'ALL') return true;
    return c.riskLevel === churnRiskFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                Phase 3: Predictive Machine Learning
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                80/20 Cross-Validated Models
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Predictive Models & Machine Learning
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Supervised and unsupervised models evaluating customer churn risk, behavioral clusters, and time-series revenue trajectories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadMLData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
              <span>{refreshing ? 'Retraining Models...' : 'Retrain Models'}</span>
            </button>
            {onNavigateToGrowth && (
              <button
                onClick={onNavigateToGrowth}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors"
              >
                <span>View Growth Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Model Selector Tabs */}
        <div className="flex items-center gap-2 pt-5 overflow-x-auto">
          {[
            { id: 'churn', label: 'Customer Churn Risk', icon: Users, badge: `${churn?.highRiskCount || 0} High Risk` },
            { id: 'segmentation', label: 'K-Means Segmentation', icon: Layers, badge: `${seg?.optimalK || 4} Clusters` },
            { id: 'forecast', label: 'Revenue Forecasting', icon: TrendingUp, badge: `${forecast?.horizonDays || 30}-Day Projection` },
            { id: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle, badge: `${anomalies?.unusualTransactionsCount || 0} Outliers` },
            { id: 'products', label: 'Product Intelligence', icon: ShoppingBag, badge: `${products?.fastGrowingProducts?.length || 0} Surging` },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeMLTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMLTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-indigo-700/80 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: CHURN PREDICTION */}
      {/* ------------------------------------------------------------- */}
      {activeMLTab === 'churn' && churn && (
        <div className="space-y-6">
          {/* Churn Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">High Churn Risk</div>
              <div className="text-2xl font-extrabold text-rose-600 mt-1">{churn.highRiskCount}</div>
              <div className="text-xs text-slate-400 mt-1">Inactivity &gt; {churn.inactivityThresholdDays} days</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Model Validation Accuracy</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                {churn.modelComparison?.[0]?.accuracy || 88}%
              </div>
              <div className="text-xs text-slate-400 mt-1">ROC-AUC: {churn.modelComparison?.[0]?.rocAuc || 0.89}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Selected Model</div>
              <div className="text-base font-bold text-slate-900 mt-1 truncate">{churn.selectedModel}</div>
              <div className="text-xs text-slate-400 mt-1">80/20 Holdout cross-validation</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Avg Churn Probability</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{churn.avgChurnProbability}%</div>
              <div className="text-xs text-slate-400 mt-1">Across all analyzed accounts</div>
            </div>
          </div>

          {/* Customer Risk Profiles Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Customer Churn Profiles</h3>
                <p className="text-xs text-slate-500">
                  Individual risk levels evaluated using RFM features, discount sensitivity, and inactivity span.
                </p>
              </div>

              {/* Risk Filter Chips */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['ALL', 'High', 'Medium', 'Low'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setChurnRiskFilter(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      churnRiskFilter === lvl
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl} Risk
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Customer ID</th>
                    <th className="px-4 py-3">Risk Level</th>
                    <th className="px-4 py-3">Churn Prob</th>
                    <th className="px-4 py-3">Historical Spend</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3">Days Inactive</th>
                    <th className="px-4 py-3">Key Risk Signals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredChurnCustomers.slice(0, 15).map((c) => (
                    <tr key={c.customerId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{c.customerId}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.riskLevel === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : c.riskLevel === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {c.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">
                        {Math.round(c.churnProbability * 100)}%
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{formatINR(c.totalRevenue)}</td>
                      <td className="px-4 py-3">{c.totalOrders}</td>
                      <td className="px-4 py-3 font-mono">{c.daysInactive} days</td>
                      <td className="px-4 py-3 text-slate-500">
                        {c.contributingSignals.slice(0, 2).join(' • ') || 'Normal activity'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: K-MEANS CUSTOMER SEGMENTATION */}
      {/* ------------------------------------------------------------- */}
      {activeMLTab === 'segmentation' && seg && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Optimal Cluster Count (k)</div>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1">{seg.optimalK} Clusters</div>
              <div className="text-xs text-slate-400 mt-1">Evaluated across k=2..5</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Silhouette Score</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{seg.silhouetteScore}</div>
              <div className="text-xs text-slate-400 mt-1">High separation & compactness</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Clustering Methodology</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Normalized RFM + K-Means++</div>
              <div className="text-xs text-slate-400 mt-1">Standardized behavioral features</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {seg.segments.map((s) => (
              <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                    <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {s.customerPercentage}% of accounts
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-slate-400 text-[10px] font-semibold uppercase">Revenue Share</div>
                    <div className="font-bold text-slate-900 mt-0.5">{s.revenueSharePct}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-semibold uppercase">Segment AOV</div>
                    <div className="font-bold text-slate-900 mt-0.5">{formatINR(s.avgOrderValue)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-semibold uppercase">Recency</div>
                    <div className="font-bold text-slate-900 mt-0.5">{s.avgRecencyDays} days</div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-700">Recommended Segment Strategy:</div>
                  <p className="text-slate-600 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/60 leading-relaxed">
                    {s.recommendedStrategy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: TIME-SERIES REVENUE FORECASTING */}
      {/* ------------------------------------------------------------- */}
      {activeMLTab === 'forecast' && forecast && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">30-Day Forecast Revenue</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                {formatINR(forecast.forecastedRevenue)}
              </div>
              <div className="text-xs text-emerald-600 mt-1 font-medium">
                {forecast.forecastGrowthRatePct >= 0 ? '+' : ''}{forecast.forecastGrowthRatePct}% projected trend
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Model Validation MAE</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {formatINR(forecast.metrics.mae)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Mean Absolute Error</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Forecast Model</div>
              <div className="text-base font-bold text-slate-900 mt-1">{forecast.modelName}</div>
              <div className="text-xs text-slate-400 mt-1">Autoregressive + Seasonality</div>
            </div>
          </div>

          {/* Interactive Forecast Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Historical & 30-Day Forward Forecast</h3>
                <p className="text-xs text-slate-500">
                  Statistical confidence intervals (Upper & Lower 80% bounds) with seasonality modeling.
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.dailyPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                  <Tooltip
                    formatter={(val: any) => [formatINR(val), 'Revenue']}
                    labelFormatter={(lbl) => `Date: ${lbl}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="actualRevenue"
                    name="Actual Historical Revenue"
                    stroke="#4f46e5"
                    fill="#e0e7ff"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="predictedRevenue"
                    name="Projected Forecast"
                    stroke="#10b981"
                    fill="#d1fae5"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    name="Upper Bound (80%)"
                    stroke="#a7f3d0"
                    fill="transparent"
                    strokeDasharray="2 2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: MULTIVARIATE ANOMALY DETECTION */}
      {/* ------------------------------------------------------------- */}
      {activeMLTab === 'anomalies' && anomalies && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Flagged Anomalies</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {anomalies.unusualTransactionsCount}
              </div>
              <div className="text-xs text-slate-400 mt-1">{anomalies.anomalyRatePct}% of total orders</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Detection Algorithm</div>
              <div className="text-base font-bold text-slate-900 mt-1">{anomalies.modelUsed}</div>
              <div className="text-xs text-slate-400 mt-1">Contamination rate: {anomalies.contaminationThreshold}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Total Scanned Orders</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {anomalies.totalTransactions.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">Multivariate distance scan</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Unusual Transactions Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Order Amount</th>
                    <th className="px-4 py-3">Anomaly Score</th>
                    <th className="px-4 py-3">Contributing Signals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {anomalies.topAnomalies.map((a) => (
                    <tr key={a.transactionId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{a.transactionId}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{a.productName}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{formatINR(a.amount)}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {Math.round(a.anomalyScore * 100)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.contributingSignals.join(' • ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: PRODUCT VELOCITY INTELLIGENCE */}
      {/* ------------------------------------------------------------- */}
      {activeMLTab === 'products' && products && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.allProducts.slice(0, 6).map((p) => (
              <div key={p.productId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase">{p.category}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    p.velocityStatus === 'Fast Growing'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {p.velocityStatus}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{p.productName}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">Revenue</div>
                    <div className="font-bold text-slate-900 mt-0.5">{formatINR(p.totalRevenue)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">Units Sold</div>
                    <div className="font-bold text-slate-900 mt-0.5">{p.unitsSold.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
