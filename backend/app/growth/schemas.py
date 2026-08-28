from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CalculationAssumptionSchema(BaseModel):
    key: str
    name: str
    defaultValue: float
    currentValue: float
    min: float
    max: float
    step: float
    unit: str
    description: str

class ScoreBreakdownSchema(BaseModel):
    impactScore: int
    evidenceScore: int
    reachScore: int
    confidenceScore: int
    feasibilityScore: int
    totalScore: int
    explanation: str

class ActionProposalSchema(BaseModel):
    id: str
    opportunityId: str
    opportunityType: str
    title: str
    target: str
    targetCount: int
    estimatedImpact: str
    estimatedImpactValue: float
    maximumProposedValue: Optional[str] = None
    proposedIncentive: Optional[str] = None
    channel: Optional[str] = None
    reason: str
    evidence: str
    confidence: str
    assumptions: List[str] = []
    status: str = "awaiting_approval"
    createdAt: str
    preparedBy: str
    notes: Optional[str] = None
    guardrails: List[str] = []

class EvidenceMetricItemSchema(BaseModel):
    label: str
    value: Any
    change: Optional[str] = None
    isPositive: Optional[bool] = None

class OpportunityWhyDetailsSchema(BaseModel):
    dataUsed: List[str]
    metrics: List[str]
    mlModel: Optional[str] = None
    evidence: str
    calculation: str
    assumptions: List[str]
    limitations: str

class GrowthOpportunitySchema(BaseModel):
    id: str
    type: str
    category: str
    title: str
    subtitle: str
    priority: str # HIGH, MEDIUM, LOW
    priorityScore: int
    scoreBreakdown: ScoreBreakdownSchema
    targetAudience: str
    targetCount: int
    potentialImpactFormatted: str
    potentialImpactValue: float
    historicalValueFormatted: Optional[str] = None
    historicalValueRaw: Optional[float] = None
    evidence: str
    evidenceMetrics: List[EvidenceMetricItemSchema]
    businessImpact: str
    recommendedAction: str
    confidence: str # High, Medium, Low
    confidenceReason: str
    status: str # new, reviewed, prepared, approved, rejected
    actionProposal: Optional[ActionProposalSchema] = None
    calculationFormula: str
    calculationAssumptions: List[CalculationAssumptionSchema]
    whyDetails: OpportunityWhyDetailsSchema
    eligibleItemIds: Optional[List[str]] = None

class GrowthSummaryResponse(BaseModel):
    datasetName: str
    customerCount: int
    transactionCount: int
    totalRevenue: float
    mlResultsSummary: str
    analyzedAt: str
    firstMoveRecommendation: Optional[Dict[str, Any]] = None
    opportunities: List[GrowthOpportunitySchema]
    filterCounts: Dict[str, int]
