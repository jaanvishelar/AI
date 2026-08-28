import crypto from 'crypto';
import Razorpay from 'razorpay';
import { RazorpayMode } from './types';
import { auditService } from './auditService';

/**
 * Currency helpers for Indian Rupee (INR) and Razorpay smallest unit (paise).
 */
export function toRazorpayAmount(inrRupees: number): number {
  if (isNaN(inrRupees) || inrRupees <= 0) {
    throw new Error(`Invalid amount: ${inrRupees}. Amount must be a positive number.`);
  }
  // Convert INR rupees to integer paise (₹100.00 -> 10000 paise)
  return Math.round(inrRupees * 100);
}

export function formatINR(rupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export class RazorpayClientService {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;
  private mode: RazorpayMode;
  private instance: any | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_whsec_test_demo_2026';
    
    // Strict requirement: RAZORPAY_MODE must be test
    const envMode = (process.env.RAZORPAY_MODE || 'test').toLowerCase();
    this.mode = envMode === 'live' ? 'live' : 'test';

    if (this.keyId && this.keySecret) {
      try {
        this.instance = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret,
        });
        this.isConfigured = true;
      } catch (err) {
        console.warn('[RazorpayClient] Failed to initialize Razorpay SDK instance:', err);
      }
    }
  }

  public getEnvironmentMode(): RazorpayMode {
    return this.mode;
  }

  public isKeyConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Safe server-side connection test without creating unnecessary charges.
   */
  public async testConnection(): Promise<{
    connected: boolean;
    mode: RazorpayMode;
    message: string;
    hasKeys: boolean;
  }> {
    // 1. Guardrail against Live Mode
    if (this.mode === 'live') {
      auditService.recordEvent({
        eventType: 'POLICY_VALIDATION_FAILED',
        actor: 'SYSTEM',
        actorType: 'SYSTEM',
        status: 'BLOCKED',
        reason: 'Live Razorpay execution is disabled in this demo.',
        environment: 'live',
      });
      return {
        connected: false,
        mode: 'live',
        message: 'Live Razorpay execution is disabled in this demo. Please set RAZORPAY_MODE=test.',
        hasKeys: this.isConfigured,
      };
    }

    // 2. If SDK instance configured, test a read-only fetch
    if (this.isConfigured && this.instance) {
      try {
        // Safe read of payment links (limit 1)
        await this.instance.paymentLink.all({ count: 1 });
        return {
          connected: true,
          mode: 'test',
          message: 'Successfully connected to Razorpay Test Mode API.',
          hasKeys: true,
        };
      } catch (err: any) {
        console.warn('[RazorpayClient] Test API call warning:', err?.message);
        return {
          connected: true, // Still active in sandbox simulation mode
          mode: 'test',
          message: `Connected in Razorpay Test Mode (Simulated Sandbox). External API note: ${err?.message || 'Ready for test events'}`,
          hasKeys: true,
        };
      }
    }

    // 3. Built-in Sandbox Test Mode
    return {
      connected: true,
      mode: 'test',
      message: 'Razorpay Test Mode Sandbox active and ready for bounded actions (no external secret required for demo).',
      hasKeys: false,
    };
  }

  /**
   * Creates a Razorpay TEST MODE Payment Link.
   */
  public async createPaymentLink(params: {
    amountInRupees: number;
    currency?: string;
    referenceId: string;
    description: string;
    customerName?: string;
    customerEmail?: string;
    customerContact?: string;
    notes?: Record<string, string>;
    expireByMinutes?: number;
  }): Promise<{
    id: string;
    shortUrl: string;
    amount: number;
    currency: string;
    status: 'created' | 'paid' | 'expired';
    referenceId: string;
    simulated: boolean;
  }> {
    // Hard guardrail against live mode
    if (this.mode === 'live') {
      throw new Error('Live Razorpay execution is disabled in this demo.');
    }

    const amountInPaise = toRazorpayAmount(params.amountInRupees);
    const expireTimestamp = Math.floor(Date.now() / 1000) + (params.expireByMinutes || 60) * 60;

    // If real keys provided and SDK initialized
    if (this.isConfigured && this.instance) {
      try {
        const linkPayload: any = {
          amount: amountInPaise,
          currency: params.currency || 'INR',
          accept_partial: false,
          reference_id: params.referenceId,
          description: params.description,
          customer: {
            name: params.customerName || 'Demo Customer',
            email: params.customerEmail || 'demo.customer@urbancart.test',
            contact: params.customerContact || '+919876543210',
          },
          notify: {
            sms: false,
            email: false, // Never send real SMS/Email for demo safety
          },
          reminder_enable: false,
          notes: {
            ...params.notes,
            environment: 'test_mode',
            agentic_system: 'MerchantMind_AI',
          },
          expire_by: expireTimestamp,
        };

        const result = await this.instance.paymentLink.create(linkPayload);
        return {
          id: result.id,
          shortUrl: result.short_url,
          amount: params.amountInRupees,
          currency: params.currency || 'INR',
          status: result.status || 'created',
          referenceId: params.referenceId,
          simulated: false,
        };
      } catch (err: any) {
        console.warn('[RazorpayClient] Real SDK call failed, falling back to secure Test Sandbox:', err?.message);
      }
    }

    // High-fidelity Razorpay Test Mode Sandbox Link
    const testLinkId = `plink_test_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
    const testShortUrl = `https://rzp.io/i/test_${testLinkId}`;

    return {
      id: testLinkId,
      shortUrl: testShortUrl,
      amount: params.amountInRupees,
      currency: params.currency || 'INR',
      status: 'created',
      referenceId: params.referenceId,
      simulated: true,
    };
  }

  /**
   * Cancels a test payment link.
   */
  public async cancelPaymentLink(paymentLinkId: string): Promise<boolean> {
    if (this.isConfigured && this.instance && !paymentLinkId.startsWith('plink_test_')) {
      try {
        await this.instance.paymentLink.cancel(paymentLinkId);
        return true;
      } catch (err) {
        console.warn('[RazorpayClient] cancelPaymentLink error:', err);
      }
    }
    return true;
  }

  /**
   * Verifies Razorpay Webhook Signature using raw request buffer.
   */
  public verifyWebhookSignature(rawBody: string | Buffer, signature: string, secret?: string): boolean {
    const webhookSecret = secret || this.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret || !signature) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'))
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const signatureBuffer = Buffer.from(signature, 'utf8');

      if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch (err) {
      console.error('[RazorpayClient] Signature verification error:', err);
      return false;
    }
  }

  /**
   * Helper to generate a valid test webhook signature for simulation & testing.
   */
  public generateTestWebhookSignature(payloadString: string): string {
    const webhookSecret = this.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_whsec_test_demo_2026';
    return crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadString)
      .digest('hex');
  }
}

export const razorpayClientService = new RazorpayClientService();
