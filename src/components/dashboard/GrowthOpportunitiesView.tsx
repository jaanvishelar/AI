import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, 
  Sparkles, 
  Target, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  HelpCircle, 
  Sliders, 
  ArrowRight, 
  RefreshCw, 
  Filter, 
  Layers, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  CreditCard, 
  Award, 
  Lock, 
  X, 
  Check, 
  SlidersHorizontal,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Calculator,
  Search,
  ExternalLink,
  ShieldCheck,
  Play
} from 'lucide-react';
import { DatasetAnalysisResult, AIConfidence } from '../../types';
import { 
  GrowthOpportunityFull, 
  GrowthAnalysisSummary, 
  OpportunityPriority, 
  OpportunityCategory,
  ActionProposal
} from '../../types/growth';
import { CommerceAction, AuditEvent } from '../../types/commerce';
import { GrowthService } from '../../services/growthService';
import { razorpayService } from '../../services/razorpayService';
import { ActionApprovalModal } from './ActionApprovalModal';
import { ActionExecutionDrawer } from './ActionExecutionDrawer';

interface GrowthOpportunitiesViewProps {
  dataset: DatasetAnalysisResult;
  onNavigateToML?: () => void;
  onNavigateToData?: () => void;
  onNavigateToAudit?: () => void;
}

export const GrowthOpportunitiesView: React.FC<GrowthOpportunitiesViewProps> = ({
  dataset,
  onNavigateToML,
  onNavigateToData,
  onNavigateToAudit,
}) => {
  const [summary, setSummary] = useState<GrowthAnalysisSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Phase 5 Commerce Actions Store
  const [activeActions, setActiveActions] = useState<Map<string, CommerceAction>>(new Map());
  const [selectedCommerceAction, setSelectedCommerceAction] = useState<CommerceAction | null>(null);
  const [actionTimeline, setActionTimeline] = useState<AuditEvent[]>([]);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  // Filters & Sorting
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | OpportunityPriority>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | OpportunityCategory>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'impact' | 'confidence' | 'reach'>('score');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Panels
  const [selectedOpportunity, setSelectedOpportunity] = useState<GrowthOpportunityFull | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [whyModalOpen, setWhyModalOpen] = useState(false);

  // Interactive Assumption Sliders State
  const [activeAssumptions, setActiveAssumptions] = useState<Record<string, number>>({});

  const loadCommerceActions = async () => {
    try {
      const list = await razorpayService.getAllActions();
      const actionMap = new Map<string, CommerceAction>();
      list.forEach((act) => {
        actionMap.set(act.opportunityId, act);
      });
      setActiveActions(actionMap);
    } catch (err) {
      console.warn('Could not load commerce actions:', err);
    }
  };

  const loadGrowthAnalysis = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await GrowthService.analyzeGrowthOpportunities(dataset, force);
      setSummary(data);
      await loadCommerceActions();
    } catch (err) {
      console.error('Failed to load growth opportunities:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGrowthAnalysis(false);
  }, [dataset.datasetName]);

  // Synchronize assumptions when an opportunity is selected
  useEffect(() => {
    if (selectedOpportunity) {
      const assumpMap: Record<string, number> = {};
      selectedOpportunity.calculationAssumptions.forEach((a) => {
        assumpMap[a.key] = a.currentValue;
      });
      setActiveAssumptions(assumpMap);
    }
  }, [selectedOpportunity]);

  const handleSliderChange = (key: string, value: number) => {
    if (!selectedOpportunity) return;
    const updatedMap = { ...activeAssumptions, [key]: value };
    setActiveAssumptions(updatedMap);

    const updatedOpp = GrowthService.updateOpportunityAssumption(
      dataset,
      selectedOpportunity.id,
      key,
      value
    );

    if (updatedOpp) {
      setSelectedOpportunity({ ...updatedOpp });
      if (summary) {
        const opps = summary.opportunities.map((o) =>
          o.id === updatedOpp.id ? updatedOpp : o
        );
        setSummary({ ...summary, opportunities: opps });
      }
    }
  };

  /**
   * Phase 5 Action Gate: Opens Human Approval Modal or Drawer
   */
  const handleOpenActionGate = (opp: GrowthOpportunityFull) => {
    setSelectedOpportunity(opp);
    const existing = activeActions.get(opp.id);
    if (existing && (existing.status === 'LINK_CREATED' || existing.status === 'ACTION_COMPLETED' || existing.status === 'ACTION_FAILED')) {
      handleOpenActionDrawer(existing.id);
    } else {
      setIsApprovalModalOpen(true);
    }
  };

  /**
   * Phase 5 Action Approval & Execution Flow
   */
  const handleApproveAndExecute = async (params: {
    approvedAmount: number;
    approvedTargetCount: number;
    approvedBy: string;
    simulateFailure: boolean;
    notes?: string;
  }) => {
    if (!selectedOpportunity) return;
    setIsExecutingAction(true);

    try {
      // 1. Prepare Action Proposal on Server
      const preparedAction = await razorpayService.prepareAction({
        opportunityId: selectedOpportunity.id,
        opportunityType: selectedOpportunity.type,
        title: selectedOpportunity.title,
        description: selectedOpportunity.recommendedAction,
        actionType: selectedOpportunity.type === 'failed_payment_recovery' ? 'payment_recovery' : 'discount_voucher',
        target: selectedOpportunity.targetAudience,
        targetCount: params.approvedTargetCount,
        historicalValueRaw: selectedOpportunity.historicalValueRaw || selectedOpportunity.potentialImpactValue,
        estimatedImpactValue: selectedOpportunity.potentialImpactValue,
        maximumAmount: params.approvedAmount,
        reason: selectedOpportunity.businessImpact,
        evidence: selectedOpportunity.evidence,
        confidence: selectedOpportunity.confidence,
        whyTrace: {
          opportunityDiscovery: `Discovered by MerchantMind AI Growth Engine on ${dataset.datasetName} (${dataset.rowCount} transactions).`,
          evidenceDataPoints: [
            `Target: ${selectedOpportunity.targetAudience} (${selectedOpportunity.targetCount} records)`,
            `Calculated Bound: ₹${params.approvedAmount.toLocaleString()}`,
            `Evidence: ${selectedOpportunity.evidence}`,
          ],
          mlModelGrounded: selectedOpportunity.whyDetails.mlModel || 'RFM & Behavioral Segmentation Model',
          assumptions: selectedOpportunity.whyDetails.assumptions,
          boundedFormula: selectedOpportunity.calculationFormula,
          decisionSteps: [
            '1. Opportunity discovered via dataset anomaly & ML partitioning.',
            '2. Financial ceiling mathematically bounded.',
            `3. Human merchant approval signed by: ${params.approvedBy}.`,
            '4. 12 Safety policies validated (No live money, strict test mode).',
            '5. Razorpay TEST MODE payment link generated.',
            '6. Immutable audit log recorded.',
          ],
        },
      });

      // 2. Human Approval Gate
      const approvedAction = await razorpayService.approveAction({
        actionId: preparedAction.id,
        approvedBy: params.approvedBy,
        approvedAmount: params.approvedAmount,
        approvedTargetCount: params.approvedTargetCount,
        notes: params.notes,
      });

      // 3. Bounded Execution in Razorpay TEST MODE
      const execResult = await razorpayService.executeAction({
        actionId: approvedAction.id,
        simulateFailure: params.simulateFailure,
      });

      // Refresh actions and open execution drawer
      await loadCommerceActions();
      setIsApprovalModalOpen(false);
      await handleOpenActionDrawer(execResult.action.id);
    } catch (err: any) {
      alert(`Action Execution Policy Error: ${err.message}`);
    } finally {
      setIsExecutingAction(false);
    }
  };

  const handleRejectAction = async (reason: string) => {
    if (!selectedOpportunity) return;
    try {
      const existing = activeActions.get(selectedOpportunity.id);
      if (existing) {
        await razorpayService.rejectAction(existing.id, reason);
      }
      setIsApprovalModalOpen(false);
      await loadCommerceActions();
    } catch (err: any) {
      console.error('Error rejecting action:', err);
    }
  };

  const handleOpenActionDrawer = async (actionId: string) => {
    try {
      const res = await razorpayService.getActionById(actionId);
      if (res) {
        setSelectedCommerceAction(res.action);
        setActionTimeline(res.timeline);
        setIsDrawerOpen(true);
      }
    } catch (err) {
      console.error('Error fetching action details:', err);
    }
  };

  // Filtered and Sorted Opportunities
  const filteredOpportunities = useMemo(() => {
    if (!summary) return [];
    let list = [...summary.opportunities];

    if (priorityFilter !== 'ALL') {
      list = list.filter((o) => o.priority === priorityFilter);
    }

    if (categoryFilter !== 'ALL') {
      list = list.filter((o) => o.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.subtitle.toLowerCase().includes(q) ||
          o.targetAudience.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'score') return b.priorityScore - a.priorityScore;
      if (sortBy === 'impact') return b.potentialImpactValue - a.potentialImpactValue;
      if (sortBy === 'reach') return b.targetCount - a.targetCount;
      if (sortBy === 'confidence') {
        const rank = { High: 3, Medium: 2, Low: 1 };
        return rank[b.confidence] - rank[a.confidence];
      }
      return 0;
    });

    return list;
  }, [summary, priorityFilter, categoryFilter, sortBy, searchQuery]);

  const getPriorityBadge = (priority: OpportunityPriority) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
            LOW
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: OpportunityCategory) => {
    switch (cat) {
      case 'customer':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
            <Users className="w-3 h-3" /> Customer
          </span>
        );
      case 'product':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
            <ShoppingBag className="w-3 h-3" /> Product
          </span>
        );
      case 'payment':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CreditCard className="w-3 h-3" /> Payment
          </span>
        );
      case 'revenue':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
            <DollarSign className="w-3 h-3" /> Revenue
          </span>
        );
      case 'acquisition':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-100">
            <TrendingUp className="w-3 h-3" /> Acquisition
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO HEADER: AGENTIC COMMERCE + RAZORPAY TEST MODE */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Zap className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                RAZORPAY TEST MODE ACTIVE
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                Track 01 Agentic Commerce
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              AI Growth Opportunities & Action Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Transforming analytics into bounded, merchant-approved actions. Prepare proposals, sign off with safety bounds, and generate Razorpay Test Mode recovery links with full auditability.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onNavigateToAudit && (
              <button
                onClick={onNavigateToAudit}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-indigo-300 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Audit Trail Center</span>
              </button>
            )}

            <button
              onClick={() => loadGrowthAnalysis(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Re-analyzing...' : 'Refresh Engine'}</span>
            </button>
          </div>
        </div>

        {/* Pipeline Bar */}
        <div className="pt-6 mt-6 border-t border-slate-800">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Verified 8-Step Agentic Commerce Pipeline</span>
            <span className="text-emerald-400 font-mono">No real money moved • Bounded Test Actions</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-[11px]">
            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 font-medium text-slate-200">
              1. Data Ingest
            </div>
            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 font-medium text-slate-200">
              2. AI/ML Discovery
            </div>
            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 font-medium text-slate-200">
              3. Opportunity
            </div>
            <div className="bg-indigo-950 p-2 rounded-lg border border-indigo-700 font-bold text-indigo-300">
              4. Proposal
            </div>
            <div className="bg-amber-950/80 p-2 rounded-lg border border-amber-700 font-bold text-amber-300">
              5. Human Gate
            </div>
            <div className="bg-indigo-950 p-2 rounded-lg border border-indigo-700 font-bold text-indigo-200">
              6. Policy Check
            </div>
            <div className="bg-emerald-950/80 p-2 rounded-lg border border-emerald-700 font-bold text-emerald-300">
              7. Razorpay Test
            </div>
            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 font-bold text-slate-200">
              8. Audit Trail
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. "WHAT SHOULD I DO FIRST?" HERO CARD */}
      {/* ------------------------------------------------------------- */}
      {summary?.firstMoveRecommendation && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-indigo-800/60 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  First Agentic Action Recommended
                </span>
                <span className="text-xs text-indigo-300 font-medium">
                  Autonomous Failed Payment Recovery Agent
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {summary.firstMoveRecommendation.title}
              </h2>

              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                <strong>Opportunity Rationale:</strong> {summary.firstMoveRecommendation.why}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-indigo-200">
                <div className="bg-indigo-900/60 px-3 py-1 rounded-lg border border-indigo-700/60">
                  <span className="text-indigo-400">Potential Recovery:</span>{' '}
                  <strong className="text-emerald-300 font-bold font-mono">
                    {summary.firstMoveRecommendation.expectedImpact}
                  </strong>
                </div>
                <div className="bg-indigo-900/60 px-3 py-1 rounded-lg border border-indigo-700/60 text-slate-200">
                  {summary.firstMoveRecommendation.evidence}
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  const target = summary.opportunities.find((o) => o.id === summary.firstMoveRecommendation?.opportunityId) || summary.opportunities[0];
                  handleOpenActionGate(target);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Prepare & Execute Action</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. OPPORTUNITIES GRID */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Ranked Growth Opportunities ({filteredOpportunities.length})
            </h2>
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Multi-factor 0–100 Scoring
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="text-xs py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="text-xs py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="payment">Payment</option>
              <option value="customer">Customer</option>
              <option value="product">Product</option>
              <option value="revenue">Revenue</option>
              <option value="acquisition">Acquisition</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <span>Calculating growth opportunities across {dataset.rowCount} transactions...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOpportunities.map((opp) => {
              const activeAction = activeActions.get(opp.id);
              const hasActiveAction = Boolean(activeAction);

              return (
                <div
                  key={opp.id}
                  id={`opp-card-${opp.id}`}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {getCategoryBadge(opp.category)}
                        {getPriorityBadge(opp.priority)}
                      </div>

                      <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Score</span>
                        <strong className="text-xs font-bold text-slate-900 font-mono">
                          {opp.priorityScore}
                        </strong>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {opp.subtitle}
                      </p>
                    </div>

                    {/* Potential Recoverable Value Box */}
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3">
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                        <span>Recoverable Ceiling</span>
                        <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                          Bounded
                        </span>
                      </div>
                      <div className="text-xl font-bold text-emerald-700 font-mono mt-0.5">
                        {opp.potentialImpactFormatted}
                      </div>
                      <div className="mt-1 text-[11px] text-emerald-900 font-medium truncate">
                        Target: {opp.targetAudience} ({opp.targetCount} records)
                      </div>
                    </div>

                    {/* Evidence Grounding */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Calculated Evidence</span>
                        <span className="text-slate-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {opp.confidence}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2 font-medium">
                        {opp.evidence}
                      </p>
                    </div>

                    {/* Active Action Badge if already generated */}
                    {activeAction && (
                      <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-xs flex items-center justify-between">
                        <span className="font-mono text-indigo-700 font-bold text-[10px]">
                          {activeAction.id}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
                          {activeAction.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedOpportunity(opp);
                        setWhyModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Why am I seeing this?"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedOpportunity(opp);
                        setDetailModalOpen(true);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors text-center"
                    >
                      Inspect
                    </button>

                    <button
                      onClick={() => handleOpenActionGate(opp)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs ${
                        hasActiveAction
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{hasActiveAction ? 'View Action' : 'Prepare Action'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. HUMAN APPROVAL MODAL (PHASE 5 GATEWAY) */}
      {/* ------------------------------------------------------------- */}
      {selectedOpportunity && (
        <ActionApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          opportunity={selectedOpportunity}
          actionProposal={activeActions.get(selectedOpportunity.id)}
          onApproveAndExecute={handleApproveAndExecute}
          onReject={handleRejectAction}
          isExecuting={isExecutingAction}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. ACTION EXECUTION DECISION DRAWER (PHASE 5 TRACKER) */}
      {/* ------------------------------------------------------------- */}
      <ActionExecutionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        action={selectedCommerceAction}
        timeline={actionTimeline}
        onRefreshAction={() => {
          if (selectedCommerceAction) handleOpenActionDrawer(selectedCommerceAction.id);
          loadCommerceActions();
        }}
        onOpenAuditTab={onNavigateToAudit}
      />

      {/* ------------------------------------------------------------- */}
      {/* 6. DETAILED OPPORTUNITY INSPECTION MODAL */}
      {/* ------------------------------------------------------------- */}
      {detailModalOpen && selectedOpportunity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {getCategoryBadge(selectedOpportunity.category)}
                  {getPriorityBadge(selectedOpportunity.priority)}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedOpportunity.title}
                </h2>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Identified Finding:</span>
                <p className="leading-relaxed text-slate-600">{selectedOpportunity.subtitle}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Calculated Evidence:</span>
                <p className="p-3 bg-white border border-slate-200 rounded-xl leading-relaxed text-slate-700">
                  {selectedOpportunity.evidence}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Mathematical Formula:</span>
                <code className="block bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px]">
                  {selectedOpportunity.calculationFormula}
                </code>
              </div>

              {/* Assumption Sliders */}
              <div className="space-y-3">
                <span className="font-bold text-slate-900 block">Interactive Assumption Modeling:</span>
                {selectedOpportunity.calculationAssumptions.map((assump) => (
                  <div key={assump.key} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{assump.name}</span>
                      <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {activeAssumptions[assump.key] ?? assump.currentValue}{assump.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={assump.min}
                      max={assump.max}
                      step={assump.step}
                      value={activeAssumptions[assump.key] ?? assump.currentValue}
                      onChange={(e) => handleSliderChange(assump.key, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{assump.min}{assump.unit}</span>
                      <span>{assump.max}{assump.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  handleOpenActionGate(selectedOpportunity);
                }}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Prepare Action Proposal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. "WHY AM I SEEING THIS?" DIALOG */}
      {/* ------------------------------------------------------------- */}
      {whyModalOpen && selectedOpportunity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Why am I seeing this?</h3>
              </div>
              <button
                onClick={() => setWhyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <strong className="text-slate-800">Data Used:</strong>
                <p className="font-mono text-slate-600 text-[11px] mt-0.5">
                  {selectedOpportunity.whyDetails.dataUsed.join(', ')}
                </p>
              </div>

              {selectedOpportunity.whyDetails.mlModel && (
                <div>
                  <strong className="text-slate-800">ML Model Grounding:</strong>
                  <p className="text-slate-700 mt-0.5">{selectedOpportunity.whyDetails.mlModel}</p>
                </div>
              )}

              <div>
                <strong className="text-slate-800">Calculation Method:</strong>
                <p className="text-slate-700 mt-0.5">{selectedOpportunity.whyDetails.calculation}</p>
              </div>

              <div>
                <strong className="text-slate-800">Confidence Rationale:</strong>
                <p className="text-slate-700 mt-0.5">{selectedOpportunity.confidenceReason}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-right">
              <button
                onClick={() => setWhyModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
