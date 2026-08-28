import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  CreditCard,
  MapPin
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { DatasetAnalysisResult } from '../../types';
import { AIInsightsSection } from './AIInsightsSection';
import { GrowthOpportunitiesSection } from './GrowthOpportunitiesSection';

interface OverviewViewProps {
  dataset: DatasetAnalysisResult;
  onOpenCleaning: () => void;
  onNavigateToData: () => void;
  onNavigateToAnalyst?: () => void;
  onNavigateToGrowth?: () => void;
}

const PIE_COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

export const OverviewView: React.FC<OverviewViewProps> = ({
  dataset,
  onOpenCleaning,
  onNavigateToData,
  onNavigateToAnalyst,
  onNavigateToGrowth,
}) => {
  const { kpis, charts, qualityScore, cleaningSuggestions } = dataset;

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  const formatNumber = (val: number | null) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    return new Intl.NumberFormat('en-IN').format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Synthetic Demo Indicator or Quality Alert */}
      {dataset.isDemo && (
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-indigo-900">
            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>
              <strong>UrbanCart Synthetic Demo Dataset:</strong> Real-world multi-category retail data (~{dataset.rowCount.toLocaleString()} transactions) generated with intentional data quality nuances for validation.
            </span>
          </div>
          <button
            id="overview-inspect-columns-btn"
            onClick={onNavigateToData}
            className="font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 whitespace-nowrap"
          >
            Inspect Schema & Rows
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cleaning Suggestions Alert if issues detected */}
      {cleaningSuggestions.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>AI Data Preparation Suggestions:</strong> Detected {cleaningSuggestions.length} potential improvements (e.g. missing discounts, duplicate orders).
            </span>
          </div>
          <button
            id="overview-review-cleaning-btn"
            onClick={onOpenCleaning}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100/50 border border-amber-300 text-amber-900 font-semibold transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            Review Cleaning
            <ArrowRight className="w-3 h-3 text-amber-700" />
          </button>
        </div>
      )}

      {/* Primary KPI Cards Grid (Geometric 4-Column Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-slate-500 text-sm mb-1 flex items-center justify-between">
              <span>Total Revenue</span>
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            {kpis.totalRevenue !== null ? (
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(kpis.totalRevenue)}
              </div>
            ) : (
              <p className="text-xs text-amber-700 font-medium">
                Metric not calculable from dataset
              </p>
            )}
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span>Net of discounts & refunds</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-slate-500 text-sm mb-1 flex items-center justify-between">
              <span>Total Orders</span>
              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>
            {kpis.totalOrders !== null ? (
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatNumber(kpis.totalOrders)}
              </div>
            ) : (
              <p className="text-xs text-amber-700 font-medium">
                Metric not calculable from dataset
              </p>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-1">
            <span>{dataset.rowCount.toLocaleString()} total data rows</span>
          </div>
        </div>

        {/* Card 3: Avg Order Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-slate-500 text-sm mb-1 flex items-center justify-between">
              <span>Avg Order Value</span>
              <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            {kpis.averageOrderValue !== null ? (
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(kpis.averageOrderValue)}
              </div>
            ) : (
              <p className="text-xs text-amber-700 font-medium">
                Metric not calculable from dataset
              </p>
            )}
          </div>
          <div className="mt-2 text-xs text-indigo-600 font-medium flex items-center gap-1">
            <span>Mean value per transaction</span>
          </div>
        </div>

        {/* Card 4: Data Quality (Accent Geometric Border) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 border-l-4 border-l-indigo-500 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-slate-500 text-sm mb-1 flex items-center justify-between">
              <span>Data Quality</span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                qualityScore.score >= 85 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {qualityScore.score}
              <span className="text-sm font-normal text-slate-400 ml-1">/100</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-indigo-600 font-medium flex items-center gap-1">
            <span className="font-semibold">{qualityScore.grade} Health</span>
            <span>•</span>
            <span>{qualityScore.breakdown.completeValuesPct}% complete</span>
          </div>
        </div>
      </div>

      {/* Secondary Customer Intelligence Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Unique Customer Cohort
              </span>
              <div className="text-lg font-bold text-slate-900">
                {kpis.uniqueCustomers !== null ? formatNumber(kpis.uniqueCustomers) : 'N/A'}
              </div>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Distinct ID tracking
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Repeat Customer Rate
              </span>
              <div className="text-lg font-bold text-slate-900">
                {kpis.returningCustomerPercentage !== null ? `${kpis.returningCustomerPercentage}%` : 'N/A'}
              </div>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Multi-order retention
          </span>
        </div>
      </div>

      {/* AI Evidence-Backed Insights Section */}
      <AIInsightsSection 
        dataset={dataset} 
        onNavigateToAnalyst={onNavigateToAnalyst} 
      />

      {/* AI Revenue Growth Opportunities Section */}
      <GrowthOpportunitiesSection
        dataset={dataset}
        onNavigateToAnalyst={onNavigateToAnalyst}
        onNavigateToGrowth={onNavigateToGrowth}
      />

      {/* Main Grid: Revenue Trend (2 cols) & Data Profile (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <h2 className="text-base font-bold text-slate-900">Revenue Trend</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Chronological net revenue performance over order timeline</p>
              </div>
              {charts.revenueOverTime.length > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{charts.revenueOverTime[0]?.date} to {charts.revenueOverTime[charts.revenueOverTime.length - 1]?.date}</span>
                </div>
              )}
            </div>

            {charts.revenueOverTime.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.revenueOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(str) => {
                        const parts = str.split('-');
                        return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : str;
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#4f46e5" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No valid date or monetary column detected for time-series revenue analysis.
              </div>
            )}
          </div>
        </div>

        {/* Data Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Data Profile</h2>
              <span className="text-xs text-slate-400">{dataset.columnCount} columns detected</span>
            </div>

            {/* Quality Breakdown Bars */}
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Complete Records</span>
                  <span className="font-semibold text-emerald-600">{qualityScore.breakdown.completeValuesPct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${qualityScore.breakdown.completeValuesPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Missing Values</span>
                  <span className="font-semibold text-amber-600">{qualityScore.breakdown.missingValuesPct}% ({qualityScore.breakdown.missingCells})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, qualityScore.breakdown.missingValuesPct * 3)}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Duplicate Rows</span>
                  <span className="font-semibold text-rose-600">{qualityScore.breakdown.duplicateRowsPct}% ({qualityScore.breakdown.duplicateRowCount})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, qualityScore.breakdown.duplicateRowsPct * 5)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Column Schema Summary List */}
            <div className="border-t border-slate-100 pt-4 mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Schema Snapshot
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {dataset.columns.slice(0, 5).map((col) => (
                  <div key={col.name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium truncate max-w-[140px]">{col.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {col.detectedType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            id="overview-inspect-full-schema-btn"
            onClick={onNavigateToData}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Inspect Full Schema & Rows</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart Section 2: Category Breakdown & Orders by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">Revenue by Category</h2>
            <p className="text-xs text-slate-600">Total net sales per product category</p>
          </div>

          {charts.revenueByCategory.length > 0 ? (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.revenueByCategory} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-600 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No category or revenue column identified.
            </div>
          )}
        </div>

        {/* Revenue by City / Region (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">Revenue by City</h2>
            <p className="text-xs text-slate-600">Top geographic locations by sales volume</p>
          </div>

          {charts.revenueByCity.length > 0 ? (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.revenueByCity} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="city" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-600 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No city or location column detected in dataset.
            </div>
          )}
        </div>
      </div>

      {/* Chart Section 3: Payment Status & Acquisition Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Status Distribution (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Payment Status</h2>
            <p className="text-xs text-slate-600">Breakdown of transaction outcomes</p>
          </div>

          {charts.paymentStatusDistribution.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.paymentStatusDistribution}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {charts.paymentStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any, name: any, props: any) => [
                        `${Number(val).toLocaleString('en-IN')} orders (${props.payload.percentage}%)`,
                        name
                      ]}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status Legend List */}
              <div className="w-full space-y-1.5 mt-2">
                {charts.paymentStatusDistribution.map((item, idx) => (
                  <div key={item.status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} 
                      />
                      <span className="text-slate-700">{item.status}</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {item.percentage}% ({item.count.toLocaleString('en-IN')})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-600 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No payment status column detected.
            </div>
          )}
        </div>

        {/* Acquisition Channel Performance */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Acquisition Channels</h2>
            <p className="text-xs text-slate-600">Revenue generation across marketing sources</p>
          </div>

          {charts.acquisitionChannels && charts.acquisitionChannels.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.acquisitionChannels} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="channel" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-600 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No marketing acquisition channel column detected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
