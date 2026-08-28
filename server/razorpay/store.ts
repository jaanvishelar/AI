import crypto from 'crypto';
import { 
  CommerceAction, 
  ActionPolicy, 
  MerchantApproval, 
  ExecutionAttempt, 
  CommerceActionStatus,
  CommerceActionType,
  RazorpayMode 
} from './types';

class CommerceStore {
  private actions: Map<string, CommerceAction> = new Map();
  private processedWebhookEventIds: Set<string> = new Set();
  private idempotencyKeys: Map<string, ExecutionAttempt> = new Map();

  /**
   * Generates a cryptographic hash of the action policy for tamper detection.
   */
  public generatePolicyHash(policy: Omit<ActionPolicy, 'policyHash'>): string {
    const dataString = `${policy.actionType}:${policy.maxAmount}:${policy.maxTargets}:${policy.environment}:${policy.expiresAt}:${policy.policyVersion}`;
    return crypto.createHash('sha256').update(dataString).digest('hex').substring(0, 16);
  }

  /**
   * Prepares a new Commerce Action Proposal from an opportunity.
   */
  public prepareAction(params: {
    opportunityId: string;
    opportunityType: string;
    title: string;
    description: string;
    actionType: CommerceActionType;
    target: string;
    targetCount: number;
    historicalValueRaw: number;
    estimatedImpactValue: number;
    maximumAmount: number;
    currency?: string;
    environment?: RazorpayMode;
    reason: string;
    evidence: string;
    confidence: 'High' | 'Medium' | 'Low';
    expireMinutes?: number;
    whyTrace: CommerceAction['whyTrace'];
  }): CommerceAction {
    const actionId = `MM-ACT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const expiresAt = new Date(Date.now() + (params.expireMinutes || 30) * 60 * 1000).toISOString();
    
    // Strict bounded policy definition
    const policyDraft: Omit<ActionPolicy, 'policyHash'> = {
      actionType: params.actionType,
      maxAmount: Math.round(params.maximumAmount),
      maxTargets: params.targetCount,
      environment: params.environment || 'test',
      expiresAt,
      requiresApproval: true,
      policyVersion: '1.0.0',
    };

    const policyHash = this.generatePolicyHash(policyDraft);

    const action: CommerceAction = {
      id: actionId,
      opportunityId: params.opportunityId,
      opportunityType: params.opportunityType,
      title: params.title,
      description: params.description,
      actionType: params.actionType,
      status: 'AWAITING_APPROVAL',
      target: params.target,
      targetCount: params.targetCount,
      historicalValueRaw: params.historicalValueRaw,
      estimatedImpactValue: Math.round(params.estimatedImpactValue),
      maximumAmount: Math.round(params.maximumAmount),
      currency: params.currency || 'INR',
      environment: params.environment || 'test',
      reason: params.reason,
      evidence: params.evidence,
      confidence: params.confidence,
      policy: {
        ...policyDraft,
        policyHash,
      },
      attempts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt,
      whyTrace: params.whyTrace,
    };

    this.actions.set(actionId, action);
    return action;
  }

  public getAction(id: string): CommerceAction | undefined {
    return this.actions.get(id);
  }

  public getAllActions(): CommerceAction[] {
    return Array.from(this.actions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Merchant Human Approval Gate.
   */
  public recordApproval(params: {
    actionId: string;
    approvedBy: string;
    approvedAmount: number;
    approvedTargetCount: number;
    notes?: string;
  }): CommerceAction {
    const action = this.actions.get(params.actionId);
    if (!action) {
      throw new Error(`Action not found: ${params.actionId}`);
    }

    if (action.status !== 'AWAITING_APPROVAL' && action.status !== 'ACTION_PROPOSED') {
      throw new Error(`Cannot approve action in status '${action.status}'. Must be AWAITING_APPROVAL.`);
    }

    // Check expiration
    if (new Date(action.expiresAt).getTime() <= Date.now()) {
      action.status = 'EXPIRED';
      action.updatedAt = new Date().toISOString();
      throw new Error(`Action ${params.actionId} has expired. Please prepare a fresh action proposal.`);
    }

    // Check amount bounds
    if (params.approvedAmount > action.policy.maxAmount) {
      throw new Error(
        `Approval amount ₹${params.approvedAmount} exceeds policy maximum limit of ₹${action.policy.maxAmount}.`
      );
    }

    const approval: MerchantApproval = {
      id: `appr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      actionId: action.id,
      approvedBy: params.approvedBy,
      approvedAt: new Date().toISOString(),
      approvedAmount: params.approvedAmount,
      approvedTargetCount: params.approvedTargetCount,
      policyVersion: action.policy.policyVersion,
      policyHash: action.policy.policyHash,
      notes: params.notes,
    };

    action.approval = approval;
    action.status = 'APPROVED';
    action.updatedAt = new Date().toISOString();

    this.actions.set(action.id, action);
    return action;
  }

  /**
   * Merchant Rejection Gate.
   */
  public recordRejection(actionId: string, rejectedBy: string, reason?: string): CommerceAction {
    const action = this.actions.get(actionId);
    if (!action) {
      throw new Error(`Action not found: ${actionId}`);
    }

    action.status = 'REJECTED';
    action.updatedAt = new Date().toISOString();
    this.actions.set(actionId, action);
    return action;
  }

  /**
   * Update action status and fields.
   */
  public updateAction(action: CommerceAction): void {
    action.updatedAt = new Date().toISOString();
    this.actions.set(action.id, action);
  }

  /**
   * Register processed webhook event ID for deduplication.
   */
  public isWebhookEventProcessed(eventId: string): boolean {
    return this.processedWebhookEventIds.has(eventId);
  }

  public markWebhookEventProcessed(eventId: string): void {
    this.processedWebhookEventIds.add(eventId);
  }

  /**
   * Idempotency check for action execution.
   */
  public getExecutionAttempt(idempotencyKey: string): ExecutionAttempt | undefined {
    return this.idempotencyKeys.get(idempotencyKey);
  }

  public recordExecutionAttempt(attempt: ExecutionAttempt): void {
    this.idempotencyKeys.set(attempt.idempotencyKey, attempt);
  }
  /**
   * Safe Demo Reset: Clears transient action attempts, idempotency keys, and action records
   * without deleting credentials or server configurations.
   */
  public resetDemoState(): void {
    this.actions.clear();
    this.processedWebhookEventIds.clear();
    this.idempotencyKeys.clear();
  }
}

export const commerceStore = new CommerceStore();
