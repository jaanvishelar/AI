import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  BrainCircuit, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Zap, 
  ShieldAlert,
  Sparkles,
  Lock,
  X
} from 'lucide-react';
import { DashboardTab } from '../../types';

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: DashboardTab;
  label: string;
  icon: React.ElementType;
  isActiveModule: boolean;
  badge?: string;
  phaseLabel?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    isActiveModule: true,
  },
  {
    id: 'data',
    label: 'Data & Schema',
    icon: Database,
    isActiveModule: true,
  },
  {
    id: 'ai_analyst',
    label: 'AI Analyst',
    icon: BrainCircuit,
    isActiveModule: true,
    badge: 'Gemini AI',
  },
  {
    id: 'predictions',
    label: 'Predictions & ML',
    icon: TrendingUp,
    isActiveModule: true,
    badge: 'ML Models',
  },
  {
    id: 'growth_actions',
    label: 'Growth Actions',
    icon: Zap,
    isActiveModule: true,
    badge: 'AI Engine',
  },
  {
    id: 'audit_trail',
    label: 'Audit Trail',
    icon: ShieldAlert,
    isActiveModule: true,
    badge: 'Track 01',
  },
  {
    id: 'revenue',
    label: 'Revenue Analytics',
    icon: DollarSign,
    isActiveModule: false,
  },
  {
    id: 'customers',
    label: 'Customer Intelligence',
    icon: Users,
    isActiveModule: false,
  },
  {
    id: 'products',
    label: 'Product Intelligence',
    icon: ShoppingBag,
    isActiveModule: false,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="dashboard-sidebar"
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-10 h-screen md:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Mobile Header in Drawer */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="font-bold text-slate-900 text-sm">MerchantMind AI</span>
            </div>
            <button
              id="sidebar-close-mobile"
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section: Active Modules */}
          <div className="p-4 flex-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Active Intelligence
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.filter((item) => item.isActiveModule).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
              <span>Merchant Intelligence</span>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.filter((item) => !item.isActiveModule).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Card: Geometric Slate Status Panel */}
          <div className="p-4">
            <div className="bg-slate-900 rounded-xl p-4 text-white shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Agentic Commerce</span>
                </div>
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">Track 01</span>
              </div>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 mt-1 mb-1">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>RAZORPAY TEST MODE ACTIVE</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                Razorpay Test Mode with 12 safety policies, human approval gates, idempotent execution, and tamper-evident audit trails.
              </p>
              <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
