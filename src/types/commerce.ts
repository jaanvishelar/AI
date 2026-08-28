export type RazorpayMode = 'test' | 'live';

export type CommerceActionType = 
  | 'payment_recovery'
  | 'cross_sell_bundle'
  | 'vip_replenishment'
  | 'churn_winback'
  | 'discount_voucher';

export type CommerceActionStatus =
  | 'ACTION_PROPOSED'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'EXECUTING'
  | 'LINK_CREATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'ACTION_COMPLETED'
  | 'ACTION_FAILED'
  | 'CANCELLED'
  | 'BLOCKED'
  | 'EXPIRED'
  | 'REJECTED';

export type ActorType = 'AI' | 'MERCHANT' | 'SYSTEM' | 'RAZORPAY';

export interface ActionPolicy {
  actionType: CommerceActionType;
  maxAmount: number;
  maxTargets: number;
  environment: RazorpayMode;
  expiresAt: string;
  requiresApproval: boolean;
  policyVersion: string;
  policyHash: string;
}

export interface MerchantApproval {
  id: string;
  actionId: string;
  approvedBy: string;
  approvedAt: string;
  approvedAmount: number;
  approvedTargetCount: number;
  policyVersion: string;
  policyHash: string;
  notes?: string;
}

export interface ExecutionAttempt {
  id: string;
  actionId: string;
  attemptNumber: number;
  idempotencyKey: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  razorpayResourceId?: string;
  razorpayPaymentLinkId?: string;
  razorpayShortUrl?: string;
  amount: number;
  currency: string;
  errorCode?: string;
  errorMessage?: string;
  simulatedFailure?: boolean;
}

export interface CommerceAction {
  id: string;
  opportunityId: string;
  opportunityType: string;
  title: string;
  description: string;
  actionType: CommerceActionType;
  status: CommerceActionStatus;
  target: string;
  targetCount: number;
  historicalValueRaw: number;
  estimatedImpactValue: number;
  maximumAmount: number;
  currency: string;
  environment: RazorpayMode;
  reason: string;
  evidence: string;
  confidence: 'High' | 'Medium' | 'Low';
  policy: ActionPolicy;
  approval?: MerchantApproval;
  attempts: ExecutionAttempt[];
  currentAttemptId?: string;
  razorpayResourceId?: string;
  razorpayPaymentLinkId?: string;
  razorpayShortUrl?: string;
  paymentDetails?: {
    paymentId?: string;
    amountPaid?: number;
    paidAt?: string;
    method?: string;
    bank?: string;
    wallet?: string;
    vpa?: string;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  whyTrace: {
    opportunityDiscovery: string;
    evidenceDataPoints: string[];
    mlModelGrounded: string;
    assumptions: string[];
    boundedFormula: string;
    decisionSteps: string[];
  };
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actionId?: string;
  eventType: 
    | 'DATA_ANALYSIS_COMPLETED'
    | 'OPPORTUNITY_CREATED'
    | 'ACTION_PREPARED'
    | 'ACTION_APPROVAL_REQUESTED'
    | 'ACTION_APPROVED'
    | 'ACTION_REJECTED'
    | 'POLICY_VALIDATION_PASSED'
    | 'POLICY_VALIDATION_FAILED'
    | 'RAZORPAY_REQUEST_STARTED'
    | 'RAZORPAY_RESOURCE_CREATED'
    | 'WEBHOOK_RECEIVED'
    | 'WEBHOOK_VERIFIED'
    | 'WEBHOOK_REJECTED'
    | 'PAYMENT_SUCCEEDED'
    | 'PAYMENT_FAILED'
    | 'ACTION_COMPLETED'
    | 'ACTION_FAILED'
    | 'ACTION_RETRIED'
    | 'ACTION_CANCELLED';
  actor: string;
  actorType: ActorType;
  status: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'BLOCKED';
  reason?: string;
  amount?: number;
  currency?: string;
  targetCount?: number;
  environment: RazorpayMode;
  razorpayResourceId?: string;
  idempotencyKey?: string;
  policyVersion?: string;
  metadata?: Record<string, any>;
}

export interface CommerceStats {
  totalActions: number;
  completedActions: number;
  failedActions: number;
  awaitingApproval: number;
  blockedActions: number;
  activeLinks: number;
  totalRecoveredVolume: number;
  totalAuditEvents: number;
  environment: RazorpayMode;
  isKeyConfigured: boolean;
}
