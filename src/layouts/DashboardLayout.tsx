import React, { useState } from 'react';
import { Header } from '../components/dashboard/Header';
import { Sidebar } from '../components/dashboard/Sidebar';
import { EmptyState } from '../components/dashboard/EmptyState';
import { LoadingAnalysis } from '../components/dashboard/LoadingAnalysis';
import { OverviewView } from '../components/dashboard/OverviewView';
import { DataView } from '../components/dashboard/DataView';
import { AIDataScientistView } from '../components/dashboard/AIDataScientistView';
import { PredictionsView } from '../components/dashboard/PredictionsView';
import { GrowthOpportunitiesView } from '../components/dashboard/GrowthOpportunitiesView';
import { AuditTrailView } from '../components/dashboard/AuditTrailView';
import { ComingSoonView } from '../components/dashboard/ComingSoonView';
import { UploadModal } from '../components/dashboard/UploadModal';
import { CleaningModal } from '../components/dashboard/CleaningModal';
import { DatasetAnalysisResult, DashboardTab } from '../types';
import { LoadingStage } from '../hooks/useMerchantData';

interface DashboardLayoutProps {
  dataset: DatasetAnalysisResult | null;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isLoading: boolean;
  loadingStage: LoadingStage;
  error: string | null;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isCleaningModalOpen: boolean;
  setIsCleaningModalOpen: (open: boolean) => void;
  onLoadDemo: () => void;
  onUploadFile: (file: File) => void;
  onClearDataset: () => void;
  onBackToLanding: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  dataset,
  activeTab,
  setActiveTab,
  isLoading,
  loadingStage,
  error,
  isUploadModalOpen,
  setIsUploadModalOpen,
  isCleaningModalOpen,
  setIsCleaningModalOpen,
  onLoadDemo,
  onUploadFile,
  onClearDataset,
  onBackToLanding,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Header
        dataset={dataset}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onTryDemo={onLoadDemo}
        onClearDataset={onClearDataset}
        onBackToLanding={onBackToLanding}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {isLoading ? (
            <LoadingAnalysis stage={loadingStage} />
          ) : !dataset ? (
            <EmptyState
              onUploadFile={onUploadFile}
              onLoadDemo={onLoadDemo}
              error={error}
            />
          ) : (
            <>
              {(activeTab === 'overview' || activeTab === 'revenue' || activeTab === 'customers' || activeTab === 'products') && (
                <OverviewView
                  dataset={dataset}
                  onOpenCleaning={() => setIsCleaningModalOpen(true)}
                  onNavigateToData={() => setActiveTab('data')}
                  onNavigateToAnalyst={() => setActiveTab('ai_analyst')}
                  onNavigateToGrowth={() => setActiveTab('growth_actions')}
                />
              )}

              {activeTab === 'data' && (
                <DataView
                  dataset={dataset}
                  onOpenCleaning={() => setIsCleaningModalOpen(true)}
                />
              )}

              {activeTab === 'ai_analyst' && (
                <AIDataScientistView
                  dataset={dataset}
                />
              )}

              {activeTab === 'predictions' && (
                <PredictionsView
                  dataset={dataset}
                  onNavigateToGrowth={() => setActiveTab('growth_actions')}
                />
              )}

              {activeTab === 'growth_actions' && (
                <GrowthOpportunitiesView
                  dataset={dataset}
                  onNavigateToML={() => setActiveTab('predictions')}
                  onNavigateToData={() => setActiveTab('data')}
                  onNavigateToAudit={() => setActiveTab('audit_trail')}
                />
              )}

              {activeTab === 'audit_trail' && (
                <AuditTrailView
                  onNavigateToGrowth={() => setActiveTab('growth_actions')}
                />
              )}

              {activeTab !== 'overview' && activeTab !== 'data' && activeTab !== 'ai_analyst' && activeTab !== 'predictions' && activeTab !== 'growth_actions' && activeTab !== 'audit_trail' && (
                <ComingSoonView
                  tab={activeTab}
                  onNavigateToOverview={() => setActiveTab('overview')}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadFile={onUploadFile}
        onLoadDemo={onLoadDemo}
      />

      {dataset && (
        <CleaningModal
          isOpen={isCleaningModalOpen}
          onClose={() => setIsCleaningModalOpen(false)}
          dataset={dataset}
        />
      )}
    </div>
  );
};
