import { DatasetAnalysisResult } from '../types';
import {
  GrowthOpportunityFull,
  GrowthAnalysisSummary,
  ActionProposal,
  CalculationAssumption,
} from '../types/growth';
import { FullMLAnalysisResult } from '../types/ml';
import { MLService } from './mlService';
import {
  discoverGrowthOpportunities,
  buildGrowthAnalysisSummary,
  recalculateOpportunityImpact,
} from '../utils/growthEngine';

// In-memory cache for Growth Analysis summaries
const growthCache = new Map<string, GrowthAnalysisSummary>();
// Store prepared action proposals in localStorage/memory
const PROPOSALS_STORAGE_KEY = 'merchantmind_growth_proposals';

function loadStoredProposals(): Map<string, ActionProposal> {
  const map = new Map<string, ActionProposal>();
  try {
    const raw = localStorage.getItem(PROPOSALS_STORAGE_KEY);
    if (raw) {
      const arr: ActionProposal[] = JSON.parse(raw);
      arr.forEach((p) => map.set(p.opportunityId, p));
    }
  } catch (e) {
    console.warn('Could not load stored action proposals from localStorage:', e);
  }
  return map;
}

function saveStoredProposals(proposalsMap: Map<string, ActionProposal>) {
  try {
    const arr = Array.from(proposalsMap.values());
    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn('Could not save action proposals to localStorage:', e);
  }
}

export class GrowthService {
  private static proposals: Map<string, ActionProposal> = loadStoredProposals();

  /**
   * Clears cache
   */
  static clearCache(datasetName?: string): void {
    if (datasetName) {
      for (const key of growthCache.keys()) {
        if (key.startsWith(datasetName)) growthCache.delete(key);
      }
    } else {
      growthCache.clear();
    }
  }

  /**
   * Analyzes the dataset & ML outputs to discover, score, and rank growth opportunities
   */
  static async analyzeGrowthOpportunities(
    dataset: DatasetAnalysisResult,
    forceRefresh: boolean = false
  ): Promise<GrowthAnalysisSummary> {
    const cacheKey = `${dataset.datasetName}_${dataset.rowCount}`;

    if (!forceRefresh && growthCache.has(cacheKey)) {
      const cached = growthCache.get(cacheKey)!;
      // Re-hydrate stored proposals
      cached.opportunities = cached.opportunities.map((opp) => {
        const storedProp = this.proposals.get(opp.id);
        if (storedProp) {
          return {
            ...opp,
            status: storedProp.status === 'approved' ? 'approved' : 'prepared',
            actionProposal: storedProp,
          };
        }
        return opp;
      });
      return cached;
    }

    // 1. Fetch or compute ML predictions if available
    let mlResult: FullMLAnalysisResult | null = null;
    try {
      const records = dataset.allRows || dataset.sampleRows || [];
      if (records.length > 0) {
        mlResult = MLService.getCachedResult(dataset.datasetName, records.length);
        if (!mlResult) {
          mlResult = await MLService.runFullMLPipeline(records, dataset);
        }
      }
    } catch (mlErr) {
      console.warn('ML analysis skipped for growth engine:', mlErr);
    }

    // 2. Discover deterministic candidates strictly grounded in data & ML
    const baseOpportunities = discoverGrowthOpportunities(dataset, mlResult);

    // 3. Attach any previously prepared action proposals
    const hydratedOpportunities: GrowthOpportunityFull[] = baseOpportunities.map((opp) => {
      const storedProp = this.proposals.get(opp.id);
      if (storedProp) {
        return {
          ...opp,
          status: (storedProp.status === 'approved' ? 'approved' : 'prepared') as GrowthOpportunityFull['status'],
          actionProposal: storedProp,
        };
      }
      return opp;
    });

    // 4. Request Gemini prioritization & executive explanation if available
    let finalSummary = buildGrowthAnalysisSummary(dataset, hydratedOpportunities, mlResult);

    try {
      const response = await fetch('/api/gemini/growth-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetName: dataset.datasetName,
          summary: {
            kpis: dataset.kpis,
            rowCount: dataset.rowCount,
            isDemo: dataset.isDemo,
          },
          mlSummary: mlResult ? {
            churn: {
              selectedModel: mlResult.churn?.selectedModel,
              highRiskCount: mlResult.churn?.highRiskCount,
              rocAuc: mlResult.churn?.modelComparison?.[0]?.rocAuc,
            },
            segmentation: {
              optimalK: mlResult.segmentation?.optimalK,
              segments: mlResult.segmentation?.segments?.map((s) => ({ name: s.name, count: s.customerCount, share: s.revenueSharePct })),
            },
            forecast: {
              projectedRevenue: mlResult.forecast?.forecastedRevenue,
              horizon: mlResult.forecast?.horizonDays,
            },
          } : null,
          candidateOpportunities: baseOpportunities.map((o) => ({
            id: o.id,
            type: o.type,
            title: o.title,
            targetAudience: o.targetAudience,
            targetCount: o.targetCount,
            potentialImpact: o.potentialImpactFormatted,
            potentialImpactValue: o.potentialImpactValue,
            priorityScore: o.priorityScore,
            priority: o.priority,
            evidence: o.evidence,
            recommendedAction: o.recommendedAction,
            confidence: o.confidence,
          })),
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json?.firstMoveRecommendation) {
          finalSummary.firstMoveRecommendation = json.firstMoveRecommendation;
        }
      }
    } catch (e) {
      console.info('Using deterministic First Move recommendation (Gemini endpoint offline or bypassed)');
    }

    growthCache.set(cacheKey, finalSummary);
    return finalSummary;
  }

  /**
   * Prepares a structured Action Proposal for an opportunity (Awaiting Human Approval)
   */
  static prepareActionProposal(
    dataset: DatasetAnalysisResult,
    opportunity: GrowthOpportunityFull,
    proposalInput: {
      proposedIncentive?: string;
      maximumProposedValue?: string;
      channel?: string;
      notes?: string;
      customAudienceCount?: number;
    }
  ): ActionProposal {
    const proposalId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const targetCount = proposalInput.customAudienceCount || opportunity.targetCount;

    const guardrails = [
      'HUMAN APPROVAL REQUIRED: No automated messages or payments are sent without merchant sign-off.',
      'Bounded Action: Execution will only target the verified eligible segment.',
      'Safety Guardrail: Maximum incentive cap strictly bounded.',
      'Zero Direct Charges: No customer cards are billed without checkout authentication.',
    ];

    const newProposal: ActionProposal = {
      id: proposalId,
      opportunityId: opportunity.id,
      opportunityType: opportunity.type,
      title: `Action Proposal: ${opportunity.title}`,
      target: opportunity.targetAudience,
      targetCount,
      estimatedImpact: opportunity.potentialImpactFormatted,
      estimatedImpactValue: opportunity.potentialImpactValue,
      maximumProposedValue: proposalInput.maximumProposedValue || opportunity.potentialImpactFormatted,
      proposedIncentive: proposalInput.proposedIncentive || '10% Win-back Discount',
      channel: proposalInput.channel || 'Email & WhatsApp Trigger',
      reason: opportunity.subtitle || opportunity.businessImpact,
      evidence: opportunity.evidence,
      confidence: opportunity.confidence,
      assumptions: opportunity.calculationAssumptions.map((a) => `${a.name}: ${a.currentValue}${a.unit}`),
      status: 'awaiting_approval',
      createdAt: new Date().toLocaleString(),
      preparedBy: 'MerchantMind AI Growth Engine (Phase 4)',
      notes: proposalInput.notes || 'Proposal prepared for review. Merchant manual approval required before Phase 5 test execution.',
      guardrails,
    };

    this.proposals.set(opportunity.id, newProposal);
    saveStoredProposals(this.proposals);

    // Update opportunity in cache if exists
    const cacheKey = `${dataset.datasetName}_${dataset.rowCount}`;
    if (growthCache.has(cacheKey)) {
      const summary = growthCache.get(cacheKey)!;
      const targetOpp = summary.opportunities.find((o) => o.id === opportunity.id);
      if (targetOpp) {
        targetOpp.status = 'prepared';
        targetOpp.actionProposal = newProposal;
      }
    }

    return newProposal;
  }

  /**
   * Approves an Action Proposal (Merchant Human Decision)
   */
  static approveActionProposal(dataset: DatasetAnalysisResult, opportunityId: string): void {
    const proposal = this.proposals.get(opportunityId);
    if (proposal) {
      proposal.status = 'approved';
      saveStoredProposals(this.proposals);

      const cacheKey = `${dataset.datasetName}_${dataset.rowCount}`;
      if (growthCache.has(cacheKey)) {
        const summary = growthCache.get(cacheKey)!;
        const targetOpp = summary.opportunities.find((o) => o.id === opportunityId);
        if (targetOpp) {
          targetOpp.status = 'approved';
          targetOpp.actionProposal = proposal;
        }
      }
    }
  }

  /**
   * Rejects an Action Proposal
   */
  static rejectActionProposal(dataset: DatasetAnalysisResult, opportunityId: string): void {
    const proposal = this.proposals.get(opportunityId);
    if (proposal) {
      proposal.status = 'rejected';
      this.proposals.delete(opportunityId);
      saveStoredProposals(this.proposals);

      const cacheKey = `${dataset.datasetName}_${dataset.rowCount}`;
      if (growthCache.has(cacheKey)) {
        const summary = growthCache.get(cacheKey)!;
        const targetOpp = summary.opportunities.find((o) => o.id === opportunityId);
        if (targetOpp) {
          targetOpp.status = 'rejected';
          targetOpp.actionProposal = undefined;
        }
      }
    }
  }

  /**
   * Recomputes opportunity impact on custom assumption changes
   */
  static updateOpportunityAssumption(
    dataset: DatasetAnalysisResult,
    opportunityId: string,
    assumptionKey: string,
    newValue: number
  ): GrowthOpportunityFull | null {
    const cacheKey = `${dataset.datasetName}_${dataset.rowCount}`;
    if (!growthCache.has(cacheKey)) return null;

    const summary = growthCache.get(cacheKey)!;
    const opp = summary.opportunities.find((o) => o.id === opportunityId);
    if (!opp) return null;

    // Update assumption value
    const targetAssump = opp.calculationAssumptions.find((a) => a.key === assumptionKey);
    if (targetAssump) {
      targetAssump.currentValue = newValue;
    }

    const currentAssumptions: Record<string, number> = {};
    opp.calculationAssumptions.forEach((a) => {
      currentAssumptions[a.key] = a.currentValue;
    });

    const recalculated = recalculateOpportunityImpact(opp, currentAssumptions);
    opp.potentialImpactValue = recalculated.potentialImpactValue;
    opp.potentialImpactFormatted = recalculated.potentialImpactFormatted;
    opp.calculationFormula = recalculated.calculationFormula;

    return opp;
  }
}
