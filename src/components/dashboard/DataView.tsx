import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  SlidersHorizontal,
  Sparkles,
  Download,
  Info,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { DatasetAnalysisResult, ColumnProfile } from '../../types';

interface DataViewProps {
  dataset: DatasetAnalysisResult;
  onOpenCleaning: () => void;
}

export const DataView: React.FC<DataViewProps> = ({ dataset, onOpenCleaning }) => {
  const { qualityScore, columns, cleaningSuggestions, sampleRows, inferredRoles } = dataset;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedColumnFilter, setSelectedColumnFilter] = useState<string>('all');

  // Filter and sort sample rows (first 50)
  const filteredAndSortedRows = useMemo(() => {
    let rows = [...(sampleRows || [])];

    // Search filter across all cells
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      rows = rows.filter(row => {
        return Object.values(row).some(val => 
          val !== null && val !== undefined && String(val).toLowerCase().includes(lower)
        );
      });
    }

    // Sort
    if (sortField) {
      rows.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return rows.slice(0, 50);
  }, [sampleRows, searchTerm, sortField, sortDirection]);

  const handleSort = (colName: string) => {
    if (sortField === colName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(colName);
      setSortDirection('asc');
    }
  };

  const filteredColumns = useMemo(() => {
    if (selectedColumnFilter === 'all') return columns;
    return columns.filter(c => c.detectedType === selectedColumnFilter);
  }, [columns, selectedColumnFilter]);

  const exportSampleCSV = () => {
    if (!sampleRows || sampleRows.length === 0) return;
    const keys = Object.keys(sampleRows[0]);
    const csvContent = [
      keys.join(','),
      ...sampleRows.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `preview_${dataset.datasetName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Section: Dataset Overview & Data Quality Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dataset Overview Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 truncate max-w-sm sm:max-w-md">
                  {dataset.datasetName}
                </h2>
                <span className="text-xs text-slate-400">
                  Profiled on {new Date(dataset.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {dataset.isDemo && (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider">
                Synthetic Demo
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rows</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {dataset.rowCount.toLocaleString()}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Columns</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {dataset.columnCount}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Missing Cells</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {qualityScore.breakdown.missingCells.toLocaleString()}
                <span className="text-xs font-medium text-slate-400 ml-1">
                  ({qualityScore.breakdown.missingValuesPct}%)
                </span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Duplicates</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {qualityScore.breakdown.duplicateRowCount.toLocaleString()}
                <span className="text-xs font-medium text-slate-400 ml-1">
                  ({qualityScore.breakdown.duplicateRowsPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Inferred Roles Summary */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Automatic Semantic Column Roles
            </span>
            <div className="flex flex-wrap gap-1.5">
              {inferredRoles.revenueColumn && (
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                  Revenue: <strong>{inferredRoles.revenueColumn}</strong>
                </span>
              )}
              {inferredRoles.customerColumn && (
                <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 text-xs font-medium border border-purple-200">
                  Customer: <strong>{inferredRoles.customerColumn}</strong>
                </span>
              )}
              {inferredRoles.dateColumn && (
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-medium border border-blue-200">
                  Date: <strong>{inferredRoles.dateColumn}</strong>
                </span>
              )}
              {inferredRoles.categoryColumn && (
                <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 text-xs font-medium border border-indigo-200">
                  Category: <strong>{inferredRoles.categoryColumn}</strong>
                </span>
              )}
              {inferredRoles.quantityColumn && (
                <span className="px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-800 text-xs font-medium border border-cyan-200">
                  Quantity: <strong>{inferredRoles.quantityColumn}</strong>
                </span>
              )}
              {inferredRoles.paymentStatusColumn && (
                <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
                  Status: <strong>{inferredRoles.paymentStatusColumn}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Data Quality Score Card (Geometric Balance Accent) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 border-l-4 border-l-indigo-500 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Data Quality</h2>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Big Score Meter */}
            <div className="text-center py-3">
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {qualityScore.score}
                <span className="text-lg font-semibold text-slate-400 ml-1">/100</span>
              </div>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                qualityScore.score >= 85
                  ? 'bg-emerald-100 text-emerald-800'
                  : qualityScore.score >= 70
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {qualityScore.grade} Quality
              </span>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Complete values</span>
                <span className="font-semibold text-emerald-600">
                  {qualityScore.breakdown.completeValuesPct}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Missing values</span>
                <span className="font-semibold text-slate-800">
                  {qualityScore.breakdown.missingValuesPct}% ({qualityScore.breakdown.missingCells})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Duplicate rows</span>
                <span className="font-semibold text-slate-800">
                  {qualityScore.breakdown.duplicateRowsPct}% ({qualityScore.breakdown.duplicateRowCount})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Invalid / anomaly values</span>
                <span className="font-semibold text-slate-800">
                  {qualityScore.breakdown.invalidValuesPct}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-4">
            Calculated across {qualityScore.breakdown.totalCells.toLocaleString()} total data cells
          </div>
        </div>
      </div>

      {/* 2. Cleaning Suggestions & Recommendations Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                AI Data Preparation Suggestions
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated diagnostics and non-destructive cleaning recommendations
            </p>
          </div>

          <button
            id="data-view-review-cleaning-btn"
            onClick={onOpenCleaning}
            className="px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto border border-indigo-200"
          >
            Review Cleaning Rules
          </button>
        </div>

        {cleaningSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {cleaningSuggestions.map((sug) => (
              <div key={sug.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900">{sug.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    sug.severity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sug.affectedCount} cases
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed mb-2">
                  {sug.description}
                </p>
                <div className="text-[11px] text-indigo-700 bg-white p-2 rounded-lg border border-indigo-100 font-medium">
                  <strong>Recommendation:</strong> {sug.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dataset has exceptional integrity with zero critical cleaning anomalies detected!</span>
          </div>
        )}
      </div>

      {/* 3. Column Profile Overview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Column Schema Overview</h2>
            <p className="text-xs text-slate-400">Detailed data types, missing counts, and distinct value profiling</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter Type:</span>
            <select
              id="column-filter-select"
              value={selectedColumnFilter}
              onChange={(e) => setSelectedColumnFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">All Types ({columns.length})</option>
              <option value="numerical">Numerical</option>
              <option value="categorical">Categorical</option>
              <option value="date">Date</option>
              <option value="boolean">Boolean</option>
              <option value="id">Identifier</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Column Name</th>
                <th className="py-3 px-4">Detected Type</th>
                <th className="py-3 px-4">Inferred Role</th>
                <th className="py-3 px-4">Missing Values</th>
                <th className="py-3 px-4">Unique Count</th>
                <th className="py-3 px-4">Range / Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredColumns.map((col) => (
                <tr key={col.name} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {col.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-medium capitalize">
                      {col.detectedType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium capitalize">
                      {col.inferredRole}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {col.missingCount > 0 ? (
                      <span className="text-amber-700 font-semibold">
                        {col.missingCount} ({col.missingPercentage}%)
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {col.uniqueCount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {col.detectedType === 'numerical' && col.min !== undefined && col.max !== undefined ? (
                      <span>Min: {col.min} | Max: {col.max} {col.mean ? `| Avg: ${col.mean}` : ''}</span>
                    ) : (
                      <span>{col.sampleValues.slice(0, 3).map(v => String(v)).join(', ')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Data Preview Table (First 50 Rows) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Dataset Preview</h2>
            <p className="text-xs text-slate-400">
              Showing first {filteredAndSortedRows.length} rows of {dataset.rowCount.toLocaleString()} total records
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="data-preview-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search preview rows..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-48 sm:w-60"
              />
            </div>

            <button
              id="data-preview-export-csv"
              onClick={exportSampleCSV}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export Sample
            </button>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3 w-12 text-slate-400 text-center">#</th>
                {columns.map((col) => (
                  <th
                    key={col.name}
                    onClick={() => handleSort(col.name)}
                    className="py-2.5 px-3 cursor-pointer hover:bg-slate-100/80 transition-colors select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.name}</span>
                      {sortField === col.name ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-indigo-600" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredAndSortedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="py-2 px-3 text-slate-400 text-center select-none">
                    {idx + 1}
                  </td>
                  {columns.map((col) => {
                    const val = row[col.name];
                    const isMissing = val === null || val === undefined || val === '' || (typeof val === 'number' && isNaN(val));
                    return (
                      <td key={col.name} className="py-2 px-3 whitespace-nowrap max-w-xs truncate text-slate-800">
                        {isMissing ? (
                          <span className="text-amber-700 italic font-sans font-medium text-[10px] bg-amber-50 px-1 py-0.5 rounded">
                            missing
                          </span>
                        ) : typeof val === 'boolean' ? (
                          <span className={val ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                            {String(val)}
                          </span>
                        ) : (
                          String(val)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
