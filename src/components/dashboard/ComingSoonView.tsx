import React from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Zap, 
  ShieldAlert, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { DashboardTab } from '../../types';

interface ComingSoonViewProps {
  tab: DashboardTab;
  onNavigateToOverview: () => void;
}

const TAB_METADATA: Record<string, { title: string; phase: string; icon: React.ElementType; description: string; plannedFeatures: string[] }> = {
  ai_analyst: {
    title: 'AI Analyst & Copilot',
    phase: 'Phase 2 (Gemini Integration)',
    icon: BrainCircuit,
    description: 'Ask open-ended natural language questions about your transactions and receive grounded, multi-step commercial data science reasoning.',
    plannedFeatures: [
      'Gemini 2.5 Flash / Pro contextual dataset ingestion',
      'Autonomous anomaly detection & margin shift explanations',
      'Conversational query interface with auto-generated charts',
      'Executive performance summarization for merchant stakeholders',
    ],
  },
  revenue: {
    title: 'Deep Revenue Analytics',
    phase: 'Phase 2',
    icon: DollarSign,
    description: 'Multi-dimensional gross vs net margin modeling, discount elasticity tracking, and payment failure cost attribution.',
    plannedFeatures: [
      'Discount coupon impact & margin cannibalization analysis',
      'Payment method fee attribution & success rate tracking',
      'Seasonal cohort and month-over-month retention decay curves',
      'Gross margin vs operating revenue breakdown',
    ],
  },
  customers: {
    title: 'Customer Intelligence & Cohorts',
    phase: 'Phase 2',
    icon: Users,
    description: 'RFM (Recency, Frequency, Monetary) segmentation and high-value customer churn risk modeling.',
    plannedFeatures: [
      'Automated RFM behavioral clustering',
      'High-LTV customer churn hazard score',
      'Acquisition channel CAC vs payback velocity',
      'Repeat buyer lifecycle transition probabilities',
    ],
  },
  products: {
    title: 'Product Catalog & Basket Affinity',
    phase: 'Phase 2',
    icon: ShoppingBag,
    description: 'Market basket analysis, product co-purchase affinity rules, and cross-sell recommendation engines.',
    plannedFeatures: [
      'Apriori association rule mining for bundle opportunities',
      'Slow-moving SKU liquidation recommendations',
      'Return rate correlation with product categories',
      'Price elasticity & dynamic price boundary suggestions',
    ],
  },
  predictions: {
    title: 'Predictive Merchant Modeling',
    phase: 'Phase 2 (Machine Learning)',
    icon: TrendingUp,
    description: 'Time-series demand forecasting and inventory stockout risk projections powered by predictive models.',
    plannedFeatures: [
      'Next 30/60/90-day revenue and order volume forecasting',
      'Stockout probability alerts based on current sales velocity',
      'Customer churn propensity scoring',
      'Marketing ROAS predictive multiplier estimation',
    ],
  },
  growth_actions: {
    title: 'Agentic Growth Actions & Razorpay',
    phase: 'Phase 3 (Agentic Commerce)',
    icon: Zap,
    description: 'Autonomous AI growth plays with Human-in-the-Loop approval triggers and test-mode payment link dispatch.',
    plannedFeatures: [
      'AI-generated targeted win-back campaigns',
      'Razorpay Test-Mode payment link generation & dispatch',
      'Personalized dynamic coupon creation',
      'Mandatory Human-in-the-Loop review before execution',
    ],
  },
  audit_trail: {
    title: 'Action Audit Trail & Governance',
    phase: 'Phase 3 (Agentic Commerce)',
    icon: ShieldAlert,
    description: 'Tamper-evident logs of every AI recommendation, human approval decision, and executed payment action.',
    plannedFeatures: [
      'Cryptographically verified event timestamping',
      'Human approver attribution & modification history',
      'Razorpay API webhook delivery tracking',
      'Rollback and cancellation management',
    ],
  },
};

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ tab, onNavigateToOverview }) => {
  const meta = TAB_METADATA[tab] || {
    title: 'Coming Soon',
    phase: 'Next Phase',
    icon: Sparkles,
    description: 'This feature will be available in subsequent phases of MerchantMind AI.',
    plannedFeatures: [],
  };

  const Icon = meta.icon;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-5">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>{meta.phase}</span>
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {meta.title}
        </h2>

        {/* Highlighted text as requested by prompt */}
        <p className="text-sm font-semibold text-indigo-600 mb-4">
          Coming in the next phase
        </p>

        {/* Description */}
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mb-8">
          {meta.description}
        </p>

        {/* Planned Features List */}
        {meta.plannedFeatures.length > 0 && (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left mb-8 max-w-lg mx-auto">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
              Planned Architecture & Capabilities:
            </span>
            <ul className="space-y-2 text-xs text-slate-600">
              {meta.plannedFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Back to overview button */}
        <button
          id="coming-soon-back-btn"
          onClick={onNavigateToOverview}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-2"
        >
          <span>Return to Active Overview</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
