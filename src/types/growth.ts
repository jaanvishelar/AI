import { AIConfidence } from './index';

export type OpportunityType =
  | 'churn_recovery'
  | 'cross_sell'
  | 'failed_payment_recovery'
  | 'high_value_retention'
  | 'product_growth'
  | 'acquisition_channel'
  | 'aov_increase';

export type OpportunityCategory =
  | 'customer'
  | 'product'
  | 'payment'
  | 'revenue'
  | 'acquisition';

export type OpportunityPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type OpportunityStatus =
  | 'new'
  | 'reviewed'
  | 'prepared'
  | 'approved'
  | 'executed'
  | 'rejected'
  | 'failed';

export interface CalculationAssumption {
  key: string;
  name: string;
  defaultValue: number;
  currentValue: number;
  min: number;
  max: number;
  step: number;
  unit: string; // '%', 'days', '₹', etc.
  description: string;
}

export interface OpportunityWhyDetails {
  dataUsed: string[];
  metrics: string[];
  mlModel?: string;
  evidence: string;
  calculation: string;
  assumptions: string[];
  limitations: string;
}

export interface ScoreBreakdown {
  impactScore: number;     // 0-30
  evidenceScore: number;   // 0-25
  reachScore: number;      // 0-20
  confidenceScore: number; // 0-15
  feasibilityScore: number;// 0-10
  totalScore: number;      // 0-100
  explanation: string;
}

export interface ActionProposal {
  id: string;
  opportunityId: string;
  opportunityType: OpportunityType;
  title: string;
  target: string;
  targetCount: number;
  estimatedImpact: string;
  estimatedImpactValue: number;
  maximumProposedValue?: string;
  proposedIncentive?: string;
  channel?: string;
  reason: string;
  evidence: string;
  confidence: AIConfidence;
  assumptions: string[];
  status: 'awaiting_approval' | 'approved' | 'rejected';
  createdAt: string;
  preparedBy: string;
  notes?: string;
  guardrails: string[];
}

export interface EvidenceMetricItem {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}

export interface GrowthOpportunityFull {
  id: string;
  type: OpportunityType;
  category: OpportunityCategory;
  title: string;
  subtitle: string;
  priority: OpportunityPriority;
  priorityScore: number; // 0 - 100
  scoreBreakdown: ScoreBreakdown;
  targetAudience: string;
  targetCount: number;
  potentialImpactFormatted: string;
  potentialImpactValue: number;
  historicalValueFormatted?: string;
  historicalValueRaw?: number;
  evidence: string;
  evidenceMetrics: EvidenceMetricItem[];
  businessImpact: string;
  recommendedAction: string;
  confidence: AIConfidence;
  confidenceReason: string;
  status: OpportunityStatus;
  actionProposal?: ActionProposal;
  calculationFormula: string;
  calculationAssumptions: CalculationAssumption[];
  whyDetails: OpportunityWhyDetails;
  eligibleItemIds?: string[];
}

export interface GrowthAnalysisSummary {
  datasetName: string;
  customerCount: number;
  transactionCount: number;
  totalRevenue: number;
  mlResultsSummary: string;
  analyzedAt: string;
  firstMoveRecommendation: {
    opportunityId: string;
    title: string;
    why: string;
    evidence: string;
    expectedImpact: string;
    confidence: AIConfidence;
  } | null;
  opportunities: GrowthOpportunityFull[];
  filterCounts: {
    all: number;
    high: number;
    medium: number;
    low: number;
    customer: number;
    product: number;
    payment: number;
    revenue: number;
    acquisition: number;
  };
}
