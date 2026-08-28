import React from 'react';
import { useMerchantData } from './hooks/useMerchantData';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardLayout } from './layouts/DashboardLayout';

export default function App() {
  const {
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
    isLandingPage,
    navigateToDashboard,
    navigateToLanding,
    loadDemo,
    uploadFile,
    clearDataset,
  } = useMerchantData();

  if (isLandingPage) {
    return (
      <LandingPage
        onStartAnalyzing={navigateToDashboard}
        onTryDemo={loadDemo}
      />
    );
  }

  return (
    <DashboardLayout
      dataset={dataset}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isLoading={isLoading}
      loadingStage={loadingStage}
      error={error}
      isUploadModalOpen={isUploadModalOpen}
      setIsUploadModalOpen={setIsUploadModalOpen}
      isCleaningModalOpen={isCleaningModalOpen}
      setIsCleaningModalOpen={setIsCleaningModalOpen}
      onLoadDemo={loadDemo}
      onUploadFile={uploadFile}
      onClearDataset={clearDataset}
      onBackToLanding={navigateToLanding}
    />
  );
}
