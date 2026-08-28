import { Request, Response } from 'express';
import { razorpayClientService } from './client';
import { auditService } from './auditService';
import { commerceStore } from './store';
import { RazorpayWebhookPayload } from './types';

export async function handleRazorpayWebhook(req: Request, res: Response) {
  const signature = req.headers['x-razorpay-signature'] as string;
  const eventId = (req.headers['x-razorpay-event-id'] as string) || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  // Use raw request body buffer / string for signature verification
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);

  // 1. Audit Webhook Received
  auditService.recordEvent({
    eventType: 'WEBHOOK_RECEIVED',
    actor: 'RAZORPAY',
    actorType: 'RAZORPAY',
    status: 'INFO',
    reason: `Webhook payload received with event ID: ${eventId}`,
    environment: 'test',
    metadata: {
      eventId,
      hasSignature: Boolean(signature),
      contentType: req.headers['content-type'],
    },
  });

  // 2. Webhook Signature Verification
  // In development / demo sandbox, if a special test signature or simulation flag is sent, handle it
  const isSignatureValid = signature
    ? razorpayClientService.verifyWebhookSignature(rawBody, signature)
    : false;

  // If signature is invalid and not a simulated demo event
  if (!isSignatureValid && req.headers['x-simulated-event'] !== 'true') {
    auditService.recordEvent({
      eventType: 'WEBHOOK_REJECTED',
      actor: 'RAZORPAY',
      actorType: 'RAZORPAY',
      status: 'ERROR',
      reason: 'Invalid webhook signature: Payload HMAC did not match RAZORPAY_WEBHOOK_SECRET.',
      environment: 'test',
      metadata: { eventId },
    });

    return res.status(400).json({
      status: 'error',
      message: 'Invalid webhook signature',
      eventId,
    });
  }

  // 3. Webhook Deduplication / Idempotency Check
  if (commerceStore.isWebhookEventProcessed(eventId)) {
    console.log(`[Webhook] Duplicate event ignored: ${eventId}`);
    return res.status(200).json({
      status: 'ignored',
      message: 'Duplicate event already processed',
      eventId,
    });
  }

  // Mark as processed
  commerceStore.markWebhookEventProcessed(eventId);

  // 4. Parse Payload
  let payload: RazorpayWebhookPayload;
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (err) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }

  const eventType = payload.event;
  const paymentLinkEntity = payload.payload?.payment_link?.entity;
  const paymentEntity = payload.payload?.payment?.entity;
  const orderEntity = payload.payload?.order?.entity;

  // Extract action ID from reference_id or notes
  const referenceId = 
    paymentLinkEntity?.reference_id || 
    paymentLinkEntity?.notes?.actionId ||
    paymentEntity?.notes?.actionId ||
    orderEntity?.receipt ||
    '';

  const action = referenceId ? commerceStore.getAction(referenceId) : undefined;

  auditService.recordEvent({
    actionId: action?.id,
    eventType: 'WEBHOOK_VERIFIED',
    actor: 'RAZORPAY',
    actorType: 'RAZORPAY',
    status: 'SUCCESS',
    reason: `Webhook verified for event: ${eventType}. Target Action: ${action?.id || 'Unknown'}`,
    environment: 'test',
    metadata: {
      event: eventType,
      eventId,
      referenceId,
    },
  });

  // 5. Handle Event Types State Machine
  if (action) {
    if (
      eventType === 'payment_link.paid' ||
      eventType === 'payment.captured' ||
      eventType === 'order.paid'
    ) {
      const amountPaid = paymentEntity?.amount
        ? paymentEntity.amount / 100
        : paymentLinkEntity?.amount
        ? paymentLinkEntity.amount / 100
        : action.maximumAmount;

      action.status = 'ACTION_COMPLETED';
      action.paymentDetails = {
        paymentId: paymentEntity?.id || `pay_test_${Date.now()}`,
        amountPaid,
        paidAt: new Date().toISOString(),
        method: paymentEntity?.method || 'UPI / Card (Test Mode)',
        bank: paymentEntity?.bank || 'HDFC (Test Gateway)',
        vpa: paymentEntity?.vpa || 'testuser@razorpay',
      };

      commerceStore.updateAction(action);

      // Audit Payment Succeeded & Action Completed
      auditService.recordEvent({
        actionId: action.id,
        eventType: 'PAYMENT_SUCCEEDED',
        actor: 'RAZORPAY',
        actorType: 'RAZORPAY',
        status: 'SUCCESS',
        amount: amountPaid,
        razorpayResourceId: action.razorpayResourceId,
        reason: `Test payment received via ${action.paymentDetails.method}. Transaction simulated successfully.`,
        environment: 'test',
        metadata: {
          paymentId: action.paymentDetails.paymentId,
          method: action.paymentDetails.method,
          eventId,
        },
      });

      auditService.recordEvent({
        actionId: action.id,
        eventType: 'ACTION_COMPLETED',
        actor: 'SYSTEM',
        actorType: 'SYSTEM',
        status: 'SUCCESS',
        amount: amountPaid,
        targetCount: action.targetCount,
        reason: `Agentic Growth Action ${action.id} finalized with verified Razorpay Test payment.`,
        environment: 'test',
      });
    } else if (eventType === 'payment.failed') {
      action.status = 'PAYMENT_FAILED';
      commerceStore.updateAction(action);

      auditService.recordEvent({
        actionId: action.id,
        eventType: 'PAYMENT_FAILED',
        actor: 'RAZORPAY',
        actorType: 'RAZORPAY',
        status: 'ERROR',
        razorpayResourceId: action.razorpayResourceId,
        reason: 'Customer test checkout attempt failed in gateway simulator.',
        environment: 'test',
        metadata: { eventId },
      });
    } else if (eventType === 'payment_link.cancelled') {
      action.status = 'CANCELLED';
      commerceStore.updateAction(action);

      auditService.recordEvent({
        actionId: action.id,
        eventType: 'ACTION_CANCELLED',
        actor: 'MERCHANT',
        actorType: 'MERCHANT',
        status: 'INFO',
        reason: 'Payment Link cancelled by merchant.',
        environment: 'test',
      });
    } else if (eventType === 'payment_link.expired') {
      action.status = 'EXPIRED';
      commerceStore.updateAction(action);

      auditService.recordEvent({
        actionId: action.id,
        eventType: 'POLICY_VALIDATION_FAILED',
        actor: 'SYSTEM',
        actorType: 'SYSTEM',
        status: 'WARNING',
        reason: 'Payment Link reached expiry threshold without completion.',
        environment: 'test',
      });
    }
  }

  return res.status(200).json({
    status: 'ok',
    processed: true,
    eventId,
    eventType,
    actionId: action?.id,
  });
}
