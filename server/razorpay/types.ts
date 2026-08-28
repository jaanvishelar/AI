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
  maxAmount: number; // in INR
  maxTargets: number;
  environment: RazorpayMode;
  expiresAt: string; // ISO date string (e.g., 30 mins)
  requiresApproval: boolean;
  policyVersion: string;
  policyHash: string;
}

export interface MerchantApproval {
  id: string;
  actionId: string;
  approvedBy: string; // 'Merchant (jaanvishelar3@gmail.com)' or session user
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

export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment_link?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        reference_id: string;
        short_url?: string;
        notes?: Record<string, any>;
        [key: string]: any;
      };
    };
    payment?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        order_id?: string;
        invoice_id?: string;
        method?: string;
        vpa?: string;
        bank?: string;
        wallet?: string;
        notes?: Record<string, any>;
        [key: string]: any;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        receipt?: string;
        notes?: Record<string, any>;
        [key: string]: any;
      };
    };
  };
  created_at: number;
}
