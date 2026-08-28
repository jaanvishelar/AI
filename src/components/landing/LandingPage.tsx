import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Database, 
  LineChart, 
  Lightbulb, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Cpu,
  Zap,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onStartAnalyzing: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAnalyzing, onTryDemo }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-lg tracking-tight">
              M
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">MerchantMind</span>
              <span className="text-indigo-600 font-semibold text-lg ml-1">AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="landing-try-demo-nav"
              onClick={onTryDemo}
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Try Demo Dataset
            </button>
            <button
              id="landing-start-analyzing-nav"
              onClick={onStartAnalyzing}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              Start Analyzing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              AI-Powered Merchant Intelligence
            </div>

            {/* Hero Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Turn Your Data Into Your Next <span className="text-indigo-600">Revenue Opportunity</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
              Upload your merchant data and let MerchantMind AI uncover revenue patterns, customer insights, and growth opportunities.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                id="landing-primary-start-analyzing"
                onClick={onStartAnalyzing}
                className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                Start Analyzing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                id="landing-secondary-try-demo"
                onClick={onTryDemo}
                className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                Try Demo Dataset
              </button>
            </div>

            {/* Hero Simplified Flow Visual */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4">
                Core Merchant Intelligence Architecture
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase">Step 1</span>
                  <h2 className="text-sm font-bold text-slate-900 mt-0.5">DATA</h2>
                  <p className="text-xs text-slate-600 mt-1">Ingest CSV or Excel transactional files</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase">Step 2</span>
                  <h2 className="text-sm font-bold text-slate-900 mt-0.5">ANALYZE</h2>
                  <p className="text-xs text-slate-600 mt-1">Automatic profiling & quality scoring</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase">Step 3</span>
                  <h2 className="text-sm font-bold text-slate-900 mt-0.5">INSIGHTS</h2>
                  <p className="text-xs text-slate-600 mt-1">Revenue KPIs & customer cohorts</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase">Step 4</span>
                  <h2 className="text-sm font-bold text-slate-900 mt-0.5">GROW</h2>
                  <p className="text-xs text-slate-600 mt-1">Actionable plays & agentic execution</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              RAZORPAY TEST MODE • ZERO REAL MONEY INVOLVED
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              End-to-End Merchant Intelligence & Agentic Commerce
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              From merchant data to AI-discovered opportunity to bounded, human-approved commerce action — with every decision explainable and auditable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Heuristic Profiling</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Smart semantic engine detects customer IDs, monetary amounts, order dates, quantities, and payment channels without hardcoded schemas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Objective Data Quality Scoring</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Calculates mathematical health scores (0-100) evaluating missing cells, duplicate orders, and price anomalies from your actual uploaded data.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Financial Insights</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Compute true Average Order Value (AOV), total net revenue, repeat buyer loyalty, and category sales breakdowns instantly with interactive visualizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Architecture Blueprint (6 Modules) */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  Track 01 — AI Growth & Agentic Commerce
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Built for AI-Powered Merchant Growth & Agentic Commerce
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                  MerchantMind AI is an end-to-end merchant intelligence and agentic commerce platform that transforms transactional data into explainable, bounded and human-approved revenue actions.
                </p>
              </div>
              <button
                id="landing-cta-start-analyzing"
                onClick={onStartAnalyzing}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                Launch Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
              {/* 1 — DATA */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-2 mb-3 font-semibold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                  DATA
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>CSV & Excel transaction ingestion</li>
                  <li>Automated schema understanding</li>
                  <li>Data quality scoring</li>
                  <li>Missing-value and duplicate detection</li>
                </ul>
              </div>

              {/* 2 — ANALYZE */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-2 mb-3 font-semibold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                  ANALYZE
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Revenue KPIs</li>
                  <li>Customer cohorts</li>
                  <li>Product performance</li>
                  <li>Payment analysis</li>
                  <li>Geographic and acquisition analysis</li>
                  <li>Interactive visualizations</li>
                </ul>
              </div>

              {/* 3 — AI INSIGHTS */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-2 mb-3 font-semibold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                  AI INSIGHTS
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Gemini-powered merchant analysis</li>
                  <li>Evidence-backed recommendations</li>
                  <li>Customer retention opportunities</li>
                  <li>Product revenue opportunities</li>
                  <li>Payment leakage detection</li>
                  <li>Explainable calculations and confidence levels</li>
                </ul>
              </div>

              {/* 4 — GROWTH ENGINE */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-2 mb-3 font-semibold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                  GROWTH ENGINE
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Ranked revenue opportunities</li>
                  <li>Customer churn recovery</li>
                  <li>Failed payment recovery</li>
                  <li>AOV improvement opportunities</li>
                  <li>Product cross-sell opportunities</li>
                  <li>Bounded revenue opportunity estimation</li>
                </ul>
              </div>

              {/* 5 — AGENTIC COMMERCE */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-2 mb-3 font-semibold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">5</span>
                  AGENTIC COMMERCE
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Human-in-the-loop approval</li>
                  <li>Strict execution ceilings</li>
                  <li>Safety policy validation</li>
                  <li>Razorpay TEST MODE payment actions</li>
                  <li>Idempotent execution</li>
                  <li>Controlled failure simulation</li>
                  <li>Safe retry handling</li>
                  <li>Webhook verification</li>
                  <li>Tamper-evident audit trail</li>
                </ul>
              </div>

              {/* 6 — GOVERNANCE */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-2 mb-3 font-semibold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">6</span>
                  GOVERNANCE
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Zero automatic execution</li>
                  <li>Live mode blocked</li>
                  <li>Amount limits enforced</li>
                  <li>Secrets protected</li>
                  <li>Complete decision trace</li>
                  <li>Every commerce action explainable and auditable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">MerchantMind AI</span>
            <span>•</span>
            <span>Your AI Data Scientist for Smarter Merchant Growth</span>
          </div>
          <div>
            <span>Hackathon Track: AI Growth & Agentic Commerce</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
