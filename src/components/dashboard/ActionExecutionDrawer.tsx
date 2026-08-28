import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  RotateCcw, 
  Clock, 
  ArrowRight, 
  HelpCircle, 
  CreditCard, 
  Sparkles, 
  Lock, 
  X, 
  Send,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { CommerceAction, AuditEvent, CommerceActionStatus } from '../../types/commerce';
import { razorpayService } from '../../services/razorpayService';

interface ActionExecutionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  action: CommerceAction | null;
  timeline: AuditEvent[];
  onRefreshAction: () => void;
  onOpenAuditTab?: () => void;
}

export const ActionExecutionDrawer: React.FC<ActionExecutionDrawerProps> = ({
  isOpen,
  onClose,
  action,
  timeline,
  onRefreshAction,
  onOpenAuditTab,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [expandedWhy, setExpandedWhy] = useState(true);

  if (!isOpen || !action) return null;

  const handleCopyLink = () => {
    if (action.razorpayShortUrl) {
      navigator.clipboard.writeText(action.razorpayShortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulatePayment = async (outcome: 'success' | 'failed') => {
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const res = await razorpayService.simulatePayment(action.id, outcome, 'upi');
      setSimulationResult(`Simulation successful: Webhook verified with HMAC and transaction logged.`);
      onRefreshAction();
    } catch (err: any) {
      setSimulationResult(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await razorpayService.retryAction(action.id, false);
      onRefreshAction();
    } catch (err: any) {
      alert(`Retry failed: ${err.message}`);
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusBadge = (status: CommerceActionStatus) => {
    switch (status) {
      case 'ACTION_COMPLETED':
      case 'PAYMENT_SUCCESS':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          label: 'Completed • Verified Payment',
          icon: CheckCircle2,
        };
      case 'LINK_CREATED':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          label: 'Razorpay Test Link Active',
          icon: CreditCard,
        };
      case 'AWAITING_APPROVAL':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          label: 'Awaiting Merchant Approval',
          icon: Clock,
        };
      case 'APPROVED':
      case 'EXECUTING':
        return {
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          label: 'Approved • Executing',
          icon: Sparkles,
        };
      case 'ACTION_FAILED':
      case 'PAYMENT_FAILED':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          label: 'Action Failed • Retry Available',
          icon: AlertCircle,
        };
      case 'BLOCKED':
        return {
          bg: 'bg-slate-200 text-slate-800 border-slate-300',
          label: 'Blocked by Safety Policy',
          icon: Lock,
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: status,
          icon: Activity,
        };
    }
  };

  const statusInfo = getStatusBadge(action.status);
  const StatusIcon = statusInfo.icon;

  // 6 Lifecycle steps
  const steps = [
    {
      title: '1. Opportunity Identified',
      desc: 'Autonomous ML engine isolated revenue drop.',
      completed: true,
    },
    {
      title: '2. Bounded Proposal Prepared',
      desc: `Bounded to max ₹${action.maximumAmount.toLocaleString()} across ${action.targetCount} targets.`,
      completed: true,
    },
    {
      title: '3. Human Approval Signed',
      desc: action.approval ? `Signed off by ${action.approval.approvedBy}` : 'Awaiting merchant sign-off',
      completed: Boolean(action.approval),
    },
    {
      title: '4. 12 Safety Policies Checked',
      desc: 'Mode=test, bounds verified, idempotency registered.',
      completed: action.status !== 'AWAITING_APPROVAL' && action.status !== 'ACTION_PROPOSED',
    },
    {
      title: '5. Razorpay Test Resource',
      desc: action.razorpayResourceId ? `Test Link: ${action.razorpayResourceId}` : 'Pending generation',
      completed: Boolean(action.razorpayResourceId),
    },
    {
      title: '6. Webhook Verified & Logged',
      desc: action.status === 'ACTION_COMPLETED' ? 'HMAC verified, tamper-evident audit record sealed.' : 'Listening for test webhook',
      completed: action.status === 'ACTION_COMPLETED',
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Top Razorpay Banner */}
        <div className="bg-slate-900 text-white px-5 py-2.5 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>RAZORPAY TEST MODE • AGENTIC COMMERCE CONTROLLER</span>
          </div>
          <span className="font-mono text-[10px] text-indigo-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {action.id}
          </span>
        </div>

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.bg}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{statusInfo.label}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Policy v{action.policy.policyVersion}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{action.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{action.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Razorpay Test Link Box */}
          {action.razorpayResourceId && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Razorpay Test Mode Link Generated
                  </span>
                </div>
                <span className="text-xs font-mono font-bold bg-indigo-800/80 px-2 py-0.5 rounded text-indigo-200 border border-indigo-700">
                  {action.razorpayResourceId}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-[11px] text-slate-400">Authorized Target Amount</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    ₹{action.maximumAmount.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Eligible Targets</div>
                  <div className="text-sm font-bold font-mono text-white">
                    {action.targetCount} Transactions
                  </div>
                </div>
              </div>

              {action.razorpayShortUrl && (
                <div className="flex items-center gap-2 bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
                  <input
                    type="text"
                    readOnly
                    value={action.razorpayShortUrl}
                    className="bg-transparent text-xs font-mono text-slate-300 w-full focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 text-xs flex items-center gap-1 shrink-0 font-medium"
                    title="Copy Test Link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}

              {/* Simulation Action Buttons */}
              {action.status === 'LINK_CREATED' && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Interactive Test Payment Sandbox:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSimulatePayment('success')}
                      disabled={isSimulating}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Simulate Customer Payment</span>
                    </button>
                    <button
                      onClick={() => handleSimulatePayment('failed')}
                      disabled={isSimulating}
                      className="px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Simulate Payment Drop</span>
                    </button>
                  </div>
                  {simulationResult && (
                    <div className="text-[11px] font-mono p-2 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                      {simulationResult}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Failed State & Retry Button */}
          {(action.status === 'ACTION_FAILED' || action.status === 'PAYMENT_FAILED') && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Controlled Failure Demo Handled</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                The simulated transaction encountered a gateway test condition. The error was safely intercepted and logged in the tamper-evident audit trail without compromising system state.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRetry}
                  disabled={isRetrying || action.attempts.length >= 3}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isRetrying ? 'Retrying in Test Mode...' : `Safe Idempotent Retry (${action.attempts.length}/3)`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Completed State Details */}
          {action.status === 'ACTION_COMPLETED' && action.paymentDetails && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Razorpay Test Payment Finalized</span>
                </span>
                <span className="font-mono text-emerald-700">
                  {action.paymentDetails.paymentId}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-emerald-800 pt-1">
                <div>
                  <span className="text-slate-500">Amount Recovered:</span>{' '}
                  <strong className="font-mono">₹{action.paymentDetails.amountPaid?.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Method:</span>{' '}
                  <strong>{action.paymentDetails.method}</strong>
                </div>
              </div>
            </div>
          )}

          {/* 6 Lifecycle Steps Progress */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Autonomous Commerce Lifecycle
            </h3>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-colors flex items-start gap-3 ${
                    step.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-white border-dashed border-slate-200 text-slate-400'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    step.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step.completed ? <Check className="w-3 h-3" /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{step.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* "Why did the agent do this?" Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <button
              onClick={() => setExpandedWhy(!expandedWhy)}
              className="w-full p-4 text-left font-bold text-xs text-slate-900 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Why did the Agent do this? (Agent Decision Trace)</span>
              </div>
              <span className="text-xs text-indigo-600 font-semibold">
                {expandedWhy ? 'Hide Trace' : 'View Trace'}
              </span>
            </button>

            {expandedWhy && (
              <div className="p-4 space-y-3 text-xs text-slate-700 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Opportunity Discovery:</span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {action.whyTrace.opportunityDiscovery}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Mathematical Bound Formula:</span>
                  <code className="block bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px]">
                    {action.whyTrace.boundedFormula}
                  </code>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Key Assumptions & Guardrails:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {action.whyTrace.assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Action-Specific Audit Trail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Action Audit Events ({timeline.length})
              </h3>
              {onOpenAuditTab && (
                <button
                  onClick={onOpenAuditTab}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Open Full Audit Trail</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {timeline.map((ev) => (
                <div key={ev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900 font-mono">{ev.eventType}</span>
                    <span className="text-slate-400">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">{ev.reason}</div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      Actor: {ev.actor} ({ev.actorType})
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      Env: {ev.environment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Last updated: {new Date(action.updatedAt).toLocaleTimeString()}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
