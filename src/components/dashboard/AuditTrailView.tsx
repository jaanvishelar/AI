import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Layers, 
  Activity, 
  CreditCard, 
  DollarSign, 
  Lock, 
  ArrowUpRight, 
  ChevronRight, 
  Zap, 
  Info,
  Check,
  RotateCcw
} from 'lucide-react';
import { AuditEvent, CommerceAction, CommerceStats, ActorType } from '../../types/commerce';
import { razorpayService } from '../../services/razorpayService';
import { ActionExecutionDrawer } from './ActionExecutionDrawer';

interface AuditTrailViewProps {
  onNavigateToGrowth?: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ onNavigateToGrowth }) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [actions, setActions] = useState<CommerceAction[]>([]);
  const [stats, setStats] = useState<CommerceStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  // Filters
  const [actorFilter, setActorFilter] = useState<'ALL' | ActorType>('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Selected Action Drawer
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<CommerceAction | null>(null);
  const [actionTimeline, setActionTimeline] = useState<AuditEvent[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const loadData = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const [allEvents, allActions, commerceStats, status] = await Promise.all([
        razorpayService.getAuditTrail(),
        razorpayService.getAllActions(),
        razorpayService.getCommerceStats(),
        razorpayService.getStatus(),
      ]);

      setEvents(allEvents);
      setActions(allActions);
      setStats(commerceStats);
      setConnectionStatus(status);
    } catch (err) {
      console.error('Failed to load audit trail:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto poll every 10 seconds for live webhook updates
    const timer = setInterval(() => loadData(false), 10000);
    return () => clearInterval(timer);
  }, []);

  const handleTestConnection = async () => {
    try {
      const res = await fetch('/api/razorpay/test-connection', { method: 'POST' });
      const data = await res.json();
      setConnectionStatus(data);
      loadData(false);
    } catch (err) {
      console.error('Connection test failed:', err);
    }
  };

  const handleOpenActionDrawer = async (actionId: string) => {
    try {
      const res = await razorpayService.getActionById(actionId);
      if (res) {
        setSelectedAction(res.action);
        setActionTimeline(res.timeline);
        setSelectedActionId(actionId);
        setDrawerOpen(true);
      }
    } catch (err) {
      console.error('Error fetching action details:', err);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `merchantmind_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset demo state? This will clear active demo actions and initialize a clean audit log for repeatable judge evaluations.')) {
      try {
        await razorpayService.resetDemoState();
        await loadData(true);
      } catch (err: any) {
        alert(`Reset failed: ${err.message}`);
      }
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    if (actorFilter !== 'ALL' && ev.actorType !== actorFilter) return false;
    if (eventTypeFilter !== 'ALL' && ev.eventType !== eventTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = ev.actionId?.toLowerCase().includes(q);
      const matchReason = ev.reason?.toLowerCase().includes(q);
      const matchActor = ev.actor?.toLowerCase().includes(q);
      const matchType = ev.eventType.toLowerCase().includes(q);
      if (!matchAction && !matchReason && !matchActor && !matchType) return false;
    }
    return true;
  });

  const getActorBadge = (actorType: ActorType) => {
    switch (actorType) {
      case 'AI':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MERCHANT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SYSTEM':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'RAZORPAY':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: AuditEvent['status']) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ERROR':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'BLOCKED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Track 01 Agentic Commerce & Razorpay Test Mode */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Razorpay Test Mode Engine • Track 01 Agentic Commerce
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Audit Trail & Autonomous Commerce Control Center
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Every action proposal, merchant approval, Razorpay test execution, and webhook payment event is recorded in this tamper-evident audit stream. Live mode is strictly blocked; zero real money is ever transferred.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleResetDemo}
              className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950 text-xs font-bold text-rose-300 rounded-xl border border-rose-900/50 transition-colors flex items-center gap-1.5"
              title="Reset transient demo actions for a fresh judge test run"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset Demo State</span>
            </button>

            <button
              onClick={handleTestConnection}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Test Connection</span>
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
              title="Refresh Audit Trail"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Connection Card Sub-bar */}
        {connectionStatus && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-semibold">Environment:</span>
              <span className="font-mono text-emerald-400 font-bold uppercase">
                {connectionStatus.mode} Mode
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">{connectionStatus.message}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                HMAC-SHA256 Webhook Verifier Active
              </span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Actions</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {stats?.totalActions || actions.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Prepared by AI</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Awaiting Sign-off</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {stats?.awaitingApproval || actions.filter(a => a.status === 'AWAITING_APPROVAL').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Human Gate Active</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Test Links</div>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
            {stats?.activeLinks || actions.filter(a => a.status === 'LINK_CREATED').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Razorpay Test Mode</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recovered Volume</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            ₹{(stats?.totalRecoveredVolume || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Simulated Recovery</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {stats?.completedActions || actions.filter(a => a.status === 'ACTION_COMPLETED').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Webhook Verified</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Audit Logs</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">
            {events.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Immutable Entries</div>
        </div>
      </div>

      {/* Actions Summary Table */}
      {actions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Commerce Actions Pipeline</h2>
            </div>
            {onNavigateToGrowth && (
              <button
                onClick={onNavigateToGrowth}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Explore Growth Opportunities</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Action ID & Title</th>
                  <th className="py-3 px-4">Opportunity Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Ceiling / Amount</th>
                  <th className="py-3 px-4">Targets</th>
                  <th className="py-3 px-4">Razorpay Resource</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{act.id}</div>
                      <div className="text-slate-500 text-[11px]">{act.title}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {act.opportunityType}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {act.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{act.maximumAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {act.targetCount}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-indigo-600">
                      {act.razorpayResourceId || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenActionDrawer(act.id)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <span>Decision Drawer</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Audit Trail Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
              />
            </div>

            {/* Actor Filter */}
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value as any)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Actors</option>
              <option value="AI">AI Agent</option>
              <option value="MERCHANT">Merchant</option>
              <option value="SYSTEM">System</option>
              <option value="RAZORPAY">Razorpay</option>
            </select>

            {/* Event Type Filter */}
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Event Types</option>
              <option value="ACTION_PREPARED">ACTION_PREPARED</option>
              <option value="ACTION_APPROVED">ACTION_APPROVED</option>
              <option value="POLICY_VALIDATION_PASSED">POLICY_VALIDATION_PASSED</option>
              <option value="RAZORPAY_RESOURCE_CREATED">RAZORPAY_RESOURCE_CREATED</option>
              <option value="WEBHOOK_VERIFIED">WEBHOOK_VERIFIED</option>
              <option value="PAYMENT_SUCCEEDED">PAYMENT_SUCCEEDED</option>
              <option value="ACTION_FAILED">ACTION_FAILED</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Showing {filteredEvents.length} of {events.length} events
            </span>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Log</span>
            </button>
          </div>
        </div>

        {/* Events Timeline Feed */}
        <div className="divide-y divide-slate-100">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No audit events matched your filter criteria.
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const isExpanded = expandedEventId === ev.id;
              return (
                <div key={ev.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${getActorBadge(ev.actorType)}`}>
                          {ev.actorType}: {ev.actor}
                        </span>

                        <span className="font-mono font-bold text-xs text-slate-900">
                          {ev.eventType}
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(ev.status)}`}>
                          {ev.status}
                        </span>

                        {ev.environment && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                            {ev.environment}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {ev.reason}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                        <span>ID: {ev.id}</span>
                        {ev.actionId && (
                          <button
                            onClick={() => handleOpenActionDrawer(ev.actionId!)}
                            className="text-indigo-600 font-bold hover:underline"
                          >
                            Action: {ev.actionId}
                          </button>
                        )}
                        {ev.amount && (
                          <span className="text-emerald-700 font-bold">
                            Amount: ₹{ev.amount.toLocaleString()}
                          </span>
                        )}
                        {ev.razorpayResourceId && (
                          <span className="text-indigo-600">
                            Resource: {ev.razorpayResourceId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-500 font-mono">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(ev.timestamp).toLocaleDateString()}
                      </div>
                      {ev.metadata && (
                        <button
                          onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                          className="mt-1 text-[10px] text-indigo-600 font-bold hover:underline"
                        >
                          {isExpanded ? 'Hide Payload' : 'View Payload'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Sanitized Metadata Payload */}
                  {isExpanded && ev.metadata && (
                    <div className="mt-3 p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                      <pre>{JSON.stringify(ev.metadata, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Execution Decision Drawer */}
      <ActionExecutionDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        action={selectedAction}
        timeline={actionTimeline}
        onRefreshAction={() => {
          if (selectedActionId) handleOpenActionDrawer(selectedActionId);
          loadData(false);
        }}
      />
    </div>
  );
};
