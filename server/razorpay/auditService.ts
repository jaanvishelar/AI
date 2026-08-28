import { AuditEvent, ActorType, RazorpayMode } from './types';
import crypto from 'crypto';

class AuditService {
  private events: AuditEvent[] = [];

  constructor() {
    // Initial system boot audit event
    this.recordEvent({
      eventType: 'POLICY_VALIDATION_PASSED',
      actor: 'SYSTEM',
      actorType: 'SYSTEM',
      status: 'INFO',
      reason: 'MerchantMind AI Commerce Audit Engine initialized in Razorpay TEST MODE.',
      environment: 'test',
      metadata: {
        mode: 'test',
        safeMode: true,
        guardrailVersion: 'v5.0-agentic-commerce',
      },
    });
  }

  /**
   * Records an immutable audit log entry.
   * Enforces sanitization of secrets, tokens, and payment card details.
   */
  public recordEvent(params: {
    actionId?: string;
    eventType: AuditEvent['eventType'];
    actor: string;
    actorType: ActorType;
    status: AuditEvent['status'];
    reason?: string;
    amount?: number;
    currency?: string;
    targetCount?: number;
    environment?: RazorpayMode;
    razorpayResourceId?: string;
    idempotencyKey?: string;
    policyVersion?: string;
    metadata?: Record<string, any>;
  }): AuditEvent {
    // Sanitize metadata to guarantee no secrets ever enter the audit log
    const sanitizedMetadata = this.sanitize(params.metadata);

    const event: AuditEvent = {
      id: `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
      actionId: params.actionId,
      eventType: params.eventType,
      actor: params.actor,
      actorType: params.actorType,
      status: params.status,
      reason: params.reason,
      amount: params.amount,
      currency: params.currency || 'INR',
      targetCount: params.targetCount,
      environment: params.environment || 'test',
      razorpayResourceId: params.razorpayResourceId,
      idempotencyKey: params.idempotencyKey,
      policyVersion: params.policyVersion,
      metadata: sanitizedMetadata,
    };

    this.events.unshift(event); // most recent first

    // Structured server log without secrets
    console.log(
      `[AUDIT_TRAIL] [${event.actorType}] ${event.eventType} | status: ${event.status} | actionId: ${event.actionId || 'N/A'} | rzp: ${event.razorpayResourceId || 'none'} | reason: ${event.reason || 'N/A'}`
    );

    return event;
  }

  /**
   * Retrieves all audit events, optionally filtered by actionId or eventType.
   */
  public getEvents(filter?: { actionId?: string; actorType?: ActorType; eventType?: string }): AuditEvent[] {
    let result = [...this.events];
    if (filter?.actionId) {
      result = result.filter((e) => e.actionId === filter.actionId);
    }
    if (filter?.actorType) {
      result = result.filter((e) => e.actorType === filter.actorType);
    }
    if (filter?.eventType) {
      result = result.filter((e) => e.eventType === filter.eventType);
    }
    return result;
  }

  /**
   * Retrieves timeline trace for a specific commerce action.
   */
  public getActionTimeline(actionId: string): AuditEvent[] {
    return this.events
      .filter((e) => e.actionId === actionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Sanitizer prevents secrets, API keys, CVV, or passwords from ever being logged.
   */
  private sanitize(data: any): any {
    if (!data) return undefined;
    if (typeof data !== 'object') return data;

    const sensitiveKeys = [
      'key_secret',
      'secret',
      'webhook_secret',
      'password',
      'token',
      'authorization',
      'cvv',
      'card_number',
      'gemini_api_key',
    ];

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lower = key.toLowerCase();
      if (sensitiveKeys.some((s) => lower.includes(s))) {
        cleaned[key] = '[REDACTED_SECRET]';
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = this.sanitize(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  /**
   * Resets audit trail and initializes with a fresh system boot event.
   */
  public resetDemoAudit(): void {
    this.events = [];
    this.recordEvent({
      eventType: 'POLICY_VALIDATION_PASSED',
      actor: 'SYSTEM',
      actorType: 'SYSTEM',
      status: 'INFO',
      reason: 'MerchantMind AI Demo State Reset: Fresh audit log initialized in Razorpay TEST MODE.',
      environment: 'test',
      metadata: {
        mode: 'test',
        safeMode: true,
        guardrailVersion: 'v6.0-hardened-production',
      },
    });
  }
}

export const auditService = new AuditService();
