import { 
  CommerceAction, 
  AuditEvent, 
  CommerceStats, 
  CommerceActionType,
  RazorpayMode 
} from '../types/commerce';

class RazorpayClientApiService {
  /**
   * Tests or gets status of Razorpay connection (Test Mode only).
   */
  async getStatus(): Promise<{
    connected: boolean;
    mode: RazorpayMode;
    message: string;
    hasKeys: boolean;
    isKeyConfigured: boolean;
  }> {
    try {
      const res = await fetch('/api/razorpay/status');
      if (!res.ok) throw new Error('Status request failed');
      return await res.json();
    } catch (err) {
      return {
        connected: true,
        mode: 'test',
        message: 'Razorpay Test Mode Sandbox active (no real money moved).',
        hasKeys: false,
        isKeyConfigured: false,
      };
    }
  }

  /**
   * Prepares a bounded Commerce Action Proposal from an identified Growth Opportunity.
   */
  async prepareAction(params: {
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
    reason: string;
    evidence: string;
    confidence: 'High' | 'Medium' | 'Low';
    whyTrace?: CommerceAction['whyTrace'];
  }): Promise<CommerceAction> {
    const res = await fetch('/api/commerce/actions/prepare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to prepare action proposal');
    }
    return data.action;
  }

  /**
   * Human Merchant Approval Gate.
   */
  async approveAction(params: {
    actionId: string;
    approvedBy?: string;
    approvedAmount?: number;
    approvedTargetCount?: number;
    notes?: string;
  }): Promise<CommerceAction> {
    const res = await fetch(`/api/commerce/actions/${params.actionId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to record merchant approval');
    }
    return data.action;
  }

  /**
   * Human Merchant Rejection.
   */
  async rejectAction(actionId: string, reason?: string, rejectedBy?: string): Promise<CommerceAction> {
    const res = await fetch(`/api/commerce/actions/${actionId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, rejectedBy }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to reject action');
    }
    return data.action;
  }

  /**
   * Executes an approved action strictly in Razorpay TEST MODE.
   */
  async executeAction(params: {
    actionId: string;
    simulateFailure?: boolean;
    idempotencyKey?: string;
  }): Promise<{
    success: boolean;
    action: CommerceAction;
    message: string;
  }> {
    const res = await fetch(`/api/commerce/actions/${params.actionId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok && !data.action) {
      throw new Error(data.error || 'Action execution blocked by safety policy');
    }
    return data;
  }

  /**
   * Retries a failed action.
   */
  async retryAction(actionId: string, simulateFailure = false): Promise<{
    success: boolean;
    action: CommerceAction;
    message: string;
  }> {
    const res = await fetch(`/api/commerce/actions/${actionId}/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulateFailure }),
    });

    const data = await res.json();
    if (!res.ok && !data.action) {
      throw new Error(data.error || 'Failed to retry action');
    }
    return data;
  }

  /**
   * Simulates customer paying or failing test link (triggers verified webhook).
   */
  async simulatePayment(actionId: string, outcome: 'success' | 'failed' = 'success', method = 'upi'): Promise<{
    success: boolean;
    action: CommerceAction;
    message: string;
  }> {
    const res = await fetch(`/api/commerce/actions/${actionId}/simulate-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome, method }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to simulate test payment');
    }
    return data;
  }

  /**
   * Retrieves all prepared/executed actions.
   */
  async getAllActions(): Promise<CommerceAction[]> {
    const res = await fetch('/api/commerce/actions');
    if (!res.ok) return [];
    const data = await res.json();
    return data.actions || [];
  }

  /**
   * Retrieves action by ID.
   */
  async getActionById(id: string): Promise<{ action: CommerceAction; timeline: AuditEvent[] } | null> {
    const res = await fetch(`/api/commerce/actions/${id}`);
    if (!res.ok) return null;
    return await res.json();
  }

  /**
   * Retrieves summary statistics for Commerce Control Center.
   */
  async getCommerceStats(): Promise<CommerceStats | null> {
    try {
      const res = await fetch('/api/commerce/stats');
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  }

  /**
   * Retrieves all Audit Trail events.
   */
  async getAuditTrail(filter?: { actionId?: string; actorType?: string; eventType?: string }): Promise<AuditEvent[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.actionId) params.append('actionId', filter.actionId);
      if (filter?.actorType) params.append('actorType', filter.actorType);
      if (filter?.eventType) params.append('eventType', filter.eventType);

      const res = await fetch(`/api/audit?${params.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.events || [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Safe Demo Reset: Clears transient action state & initializes clean audit trail.
   */
  async resetDemoState(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/commerce/reset', { method: 'POST' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to reset demo state');
    }
    return await res.json();
  }
}

export const razorpayService = new RazorpayClientApiService();
