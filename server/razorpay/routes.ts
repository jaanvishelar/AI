import express, { Request, Response } from 'express';
import { commerceStore } from './store';
import { actionExecutor } from './actionExecutor';
import { auditService } from './auditService';
import { razorpayClientService } from './client';
import { handleRazorpayWebhook } from './webhookHandler';

export const commerceRouter = express.Router();

/**
 * GET /api/razorpay/status & POST /api/razorpay/test-connection
 */
commerceRouter.get('/razorpay/status', async (req: Request, res: Response) => {
  const result = await razorpayClientService.testConnection();
  res.json({
    ...result,
    isKeyConfigured: razorpayClientService.isKeyConfigured(),
    timestamp: new Date().toISOString(),
  });
});

commerceRouter.post('/razorpay/test-connection', async (req: Request, res: Response) => {
  const result = await razorpayClientService.testConnection();
  res.json(result);
});

/**
 * POST /api/commerce/actions/prepare
 * Prepares a structured, bounded action proposal grounded in dataset opportunity metrics.
 */
commerceRouter.post('/commerce/actions/prepare', (req: Request, res: Response) => {
  try {
    const {
      opportunityId,
      opportunityType,
      title,
      description,
      actionType,
      target,
      targetCount,
      historicalValueRaw,
      estimatedImpactValue,
      maximumAmount,
      reason,
      evidence,
      confidence,
      whyTrace,
    } = req.body;

    if (!opportunityId || !title || !targetCount || !maximumAmount) {
      return res.status(400).json({ error: 'Missing mandatory action proposal fields.' });
    }

    const action = commerceStore.prepareAction({
      opportunityId,
      opportunityType: opportunityType || 'failed_payment_recovery',
      title,
      description: description || 'Evidence-backed agentic growth action proposal.',
      actionType: actionType || 'payment_recovery',
      target: target || `${targetCount} eligible transactions`,
      targetCount: Number(targetCount),
      historicalValueRaw: Number(historicalValueRaw || 0),
      estimatedImpactValue: Number(estimatedImpactValue || maximumAmount),
      maximumAmount: Number(maximumAmount),
      reason: reason || 'Identified by AI Growth Engine.',
      evidence: evidence || 'Calculated from historical transaction data.',
      confidence: confidence || 'Medium',
      whyTrace: whyTrace || {
        opportunityDiscovery: 'Autonomous ML & Statistical Opportunity Engine',
        evidenceDataPoints: [`Target count: ${targetCount}`, `Max bound: ₹${maximumAmount}`],
        mlModelGrounded: 'RFM, Churn & Payment Failure Diagnostics',
        assumptions: ['Assumes conservative recovery rate applied to verified failed checkout basket sizes.'],
        boundedFormula: 'Target Volume × Avg Basket Size × Assumed Conversion Rate',
        decisionSteps: [
          '1. Dataset analyzed for payment drop-offs and revenue leakage.',
          '2. Exact failed transaction count and recoverable revenue calculated.',
          '3. Action proposal generated with explicit bounded ceiling.',
          '4. Human approval gate established.',
        ],
      },
    });

    // Record Audit Event: Action Prepared
    auditService.recordEvent({
      actionId: action.id,
      eventType: 'ACTION_PREPARED',
      actor: 'AI',
      actorType: 'AI',
      status: 'INFO',
      amount: action.maximumAmount,
      targetCount: action.targetCount,
      reason: `AI prepared bounded action proposal: "${action.title}". Maximum limit ₹${action.maximumAmount}. Awaiting merchant approval.`,
      environment: 'test',
    });

    auditService.recordEvent({
      actionId: action.id,
      eventType: 'ACTION_APPROVAL_REQUESTED',
      actor: 'SYSTEM',
      actorType: 'SYSTEM',
      status: 'INFO',
      amount: action.maximumAmount,
      targetCount: action.targetCount,
      reason: 'Human approval modal presented to merchant. Zero automatic execution permitted.',
      environment: 'test',
    });

    res.json({
      success: true,
      action,
      message: 'Action proposal prepared. Awaiting merchant approval.',
    });
  } catch (err: any) {
    console.error('Error preparing action:', err);
    res.status(500).json({ error: err?.message || 'Failed to prepare action proposal.' });
  }
});

/**
 * POST /api/commerce/actions/:id/approve
 * Human Merchant Approval Gate.
 */
commerceRouter.post('/commerce/actions/:id/approve', (req: Request, res: Response) => {
  try {
    const actionId = req.params.id;
    const { approvedBy, approvedAmount, approvedTargetCount, notes } = req.body;

    const action = commerceStore.getAction(actionId);
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }

    const amount = Number(approvedAmount || action.maximumAmount);
    const targets = Number(approvedTargetCount || action.targetCount);

    const approvedAction = commerceStore.recordApproval({
      actionId,
      approvedBy: approvedBy || 'Merchant Admin',
      approvedAmount: amount,
      approvedTargetCount: targets,
      notes,
    });

    // Record Audit Event: Action Approved by Human
    auditService.recordEvent({
      actionId: approvedAction.id,
      eventType: 'ACTION_APPROVED',
      actor: approvedBy || 'Merchant Admin',
      actorType: 'MERCHANT',
      status: 'SUCCESS',
      amount,
      targetCount: targets,
      policyVersion: approvedAction.policy.policyVersion,
      reason: `Merchant explicitly approved test action. Maximum bounded amount: ₹${amount}.`,
      environment: 'test',
    });

    res.json({
      success: true,
      action: approvedAction,
      message: 'Action approved by merchant. Ready for bounded execution.',
    });
  } catch (err: any) {
    console.error('Error approving action:', err);
    res.status(400).json({ error: err?.message || 'Failed to approve action.' });
  }
});

/**
 * POST /api/commerce/actions/:id/reject
 * Human Merchant Rejection.
 */
commerceRouter.post('/commerce/actions/:id/reject', (req: Request, res: Response) => {
  try {
    const actionId = req.params.id;
    const { rejectedBy, reason } = req.body;

    const rejectedAction = commerceStore.recordRejection(
      actionId,
      rejectedBy || 'Merchant Admin',
      reason || 'Rejected by merchant in review modal'
    );

    auditService.recordEvent({
      actionId,
      eventType: 'ACTION_REJECTED',
      actor: rejectedBy || 'Merchant Admin',
      actorType: 'MERCHANT',
      status: 'WARNING',
      reason: `Merchant cancelled/rejected action: ${reason || 'Declined during review.'}`,
      environment: 'test',
    });

    res.json({
      success: true,
      action: rejectedAction,
      message: 'Action rejected by merchant. No Razorpay call made.',
    });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to reject action.' });
  }
});

/**
 * POST /api/commerce/actions/:id/execute
 * Executes an approved action strictly in Razorpay TEST MODE.
 */
commerceRouter.post('/commerce/actions/:id/execute', async (req: Request, res: Response) => {
  try {
    const actionId = req.params.id;
    const { simulateFailure, idempotencyKey, merchantIdentifier } = req.body;

    const result = await actionExecutor.executeAction({
      actionId,
      simulateFailure: Boolean(simulateFailure),
      idempotencyKey,
      merchantIdentifier,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Error executing action:', err);
    res.status(400).json({
      success: false,
      error: err?.message || 'Action execution blocked by safety policy.',
    });
  }
});

/**
 * POST /api/commerce/actions/:id/retry
 * Retries a failed action with fresh idempotency key and attempt tracking.
 */
commerceRouter.post('/commerce/actions/:id/retry', async (req: Request, res: Response) => {
  try {
    const actionId = req.params.id;
    const { simulateFailure } = req.body;

    const result = await actionExecutor.retryAction(actionId, Boolean(simulateFailure));
    res.json(result);
  } catch (err: any) {
    console.error('Error retrying action:', err);
    res.status(400).json({
      success: false,
      error: err?.message || 'Failed to retry action.',
    });
  }
});

/**
 * POST /api/commerce/actions/:id/simulate-payment
 * Safe Demo Feature: Simulates customer clicking the Razorpay Test link and completing or failing test payment.
 * Automatically dispatches and verifies the webhook payload.
 */
commerceRouter.post('/commerce/actions/:id/simulate-payment', async (req: Request, res: Response) => {
  try {
    const actionId = req.params.id;
    const { outcome = 'success', method = 'upi' } = req.body;

    const action = commerceStore.getAction(actionId);
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }

    if (!action.razorpayPaymentLinkId && action.status !== 'LINK_CREATED') {
      return res.status(400).json({ error: 'Action does not have an active Razorpay test link.' });
    }

    const eventId = `evt_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const paymentId = `pay_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Build standard Razorpay Webhook Payload
    const webhookPayload = {
      entity: 'event',
      account_id: 'acc_test_merchantmind',
      event: outcome === 'success' ? 'payment_link.paid' : 'payment.failed',
      contains: ['payment_link', 'payment'],
      payload: {
        payment_link: {
          entity: {
            id: action.razorpayPaymentLinkId || `plink_test_${action.id}`,
            amount: Math.round(action.maximumAmount * 100),
            currency: 'INR',
            status: outcome === 'success' ? 'paid' : 'failed',
            reference_id: action.id,
            notes: {
              actionId: action.id,
              opportunityId: action.opportunityId,
            },
          },
        },
        payment: {
          entity: {
            id: paymentId,
            amount: Math.round(action.maximumAmount * 100),
            currency: 'INR',
            status: outcome === 'success' ? 'captured' : 'failed',
            method: method === 'upi' ? 'UPI (Google Pay / PhonePe Test)' : 'Card (Visa Test 4111...)',
            bank: 'HDFC (Test Gateway)',
            vpa: 'merchant.test@razorpay',
            notes: {
              actionId: action.id,
            },
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    };

    const payloadString = JSON.stringify(webhookPayload);
    const validSignature = razorpayClientService.generateTestWebhookSignature(payloadString);

    // Call the webhook handler through simulated express request
    const mockReq: any = {
      headers: {
        'x-razorpay-signature': validSignature,
        'x-razorpay-event-id': eventId,
        'content-type': 'application/json',
      },
      rawBody: payloadString,
      body: webhookPayload,
    };

    let responseData: any = null;
    const mockRes: any = {
      status: (code: number) => ({
        json: (data: any) => {
          responseData = { code, data };
          return mockRes;
        },
      }),
    };

    await handleRazorpayWebhook(mockReq, mockRes);

    const updatedAction = commerceStore.getAction(actionId);

    res.json({
      success: true,
      outcome,
      action: updatedAction,
      eventId,
      paymentId,
      message: `Simulated test payment ${outcome} processed via verified webhook.`,
    });
  } catch (err: any) {
    console.error('Error simulating payment:', err);
    res.status(500).json({ error: err?.message || 'Payment simulation failed.' });
  }
});

/**
 * GET /api/commerce/actions
 * Lists all actions.
 */
commerceRouter.get('/commerce/actions', (req: Request, res: Response) => {
  const actions = commerceStore.getAllActions();
  res.json({
    actions,
    count: actions.length,
    environment: razorpayClientService.getEnvironmentMode(),
  });
});

/**
 * GET /api/commerce/actions/:id
 * Get single action with full timeline and whyTrace.
 */
commerceRouter.get('/commerce/actions/:id', (req: Request, res: Response) => {
  const action = commerceStore.getAction(req.params.id);
  if (!action) {
    return res.status(404).json({ error: 'Action not found' });
  }

  const timeline = auditService.getActionTimeline(action.id);

  res.json({
    action,
    timeline,
  });
});

/**
 * GET /api/commerce/stats
 * Aggregated stats for the Commerce Control Center.
 */
commerceRouter.get('/commerce/stats', (req: Request, res: Response) => {
  const actions = commerceStore.getAllActions();
  const events = auditService.getEvents();

  const totalActions = actions.length;
  const completedActions = actions.filter((a) => a.status === 'ACTION_COMPLETED').length;
  const failedActions = actions.filter((a) => a.status === 'ACTION_FAILED' || a.status === 'PAYMENT_FAILED').length;
  const awaitingApproval = actions.filter((a) => a.status === 'AWAITING_APPROVAL').length;
  const blockedActions = actions.filter((a) => a.status === 'BLOCKED' || a.status === 'EXPIRED').length;
  const activeLinks = actions.filter((a) => a.status === 'LINK_CREATED').length;

  const totalRecoveredVolume = actions
    .filter((a) => a.status === 'ACTION_COMPLETED')
    .reduce((sum, a) => sum + (a.paymentDetails?.amountPaid || a.maximumAmount), 0);

  res.json({
    totalActions,
    completedActions,
    failedActions,
    awaitingApproval,
    blockedActions,
    activeLinks,
    totalRecoveredVolume,
    totalAuditEvents: events.length,
    environment: razorpayClientService.getEnvironmentMode(),
    isKeyConfigured: razorpayClientService.isKeyConfigured(),
  });
});

/**
 * GET /api/audit
 * Returns structured audit log events with optional filters.
 */
commerceRouter.get('/audit', (req: Request, res: Response) => {
  const { actionId, actorType, eventType } = req.query;
  const events = auditService.getEvents({
    actionId: actionId as string,
    actorType: actorType as any,
    eventType: eventType as string,
  });

  res.json({
    events,
    totalCount: events.length,
    environment: 'test',
  });
});

/**
 * POST /api/commerce/reset
 * Safe Demo Reset: Clears transient action attempts & initializes clean audit trail
 * for repeatable judge demos (Success vs. Failure).
 */
commerceRouter.post('/commerce/reset', (req: Request, res: Response) => {
  try {
    commerceStore.resetDemoState();
    auditService.resetDemoAudit();
    res.json({
      success: true,
      message: 'Demo state reset successfully. Ready for clean judge evaluation.',
      environment: 'test',
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to reset demo state' });
  }
});

/**
 * POST /api/webhooks/razorpay
 * Official Razorpay Webhook listener with HMAC verification and deduplication.
 */
commerceRouter.post('/webhooks/razorpay', handleRazorpayWebhook);
