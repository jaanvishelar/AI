import { useState, useCallback } from 'react';
import { DatasetAnalysisResult, DashboardTab } from '../types';
import { apiService } from '../services/apiService';

export type LoadingStage = 'idle' | 'understanding' | 'metrics' | 'trends' | 'reasoning' | 'insights' | 'ready';

export function useMerchantData() {
  const [dataset, setDataset] = useState<DatasetAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
  const [isLandingPage, setIsLandingPage] = useState(true);

  const simulateProgress = async (finalData: DatasetAnalysisResult) => {
    setIsLoading(true);
    setError(null);
    setLoadingStage('understanding');
    await new Promise(r => setTimeout(r, 350));
    
    setLoadingStage('metrics');
    await new Promise(r => setTimeout(r, 350));

    setLoadingStage('trends');
    await new Promise(r => setTimeout(r, 350));

    setLoadingStage('reasoning');
    await new Promise(r => setTimeout(r, 350));

    setLoadingStage('insights');
    await new Promise(r => setTimeout(r, 350));

    setLoadingStage('ready');
    setDataset(finalData);
    setIsLoading(false);
    setIsLandingPage(false);
  };

  const loadDemo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingStage('understanding');

      const data = await apiService.loadDemoDataset();
      await simulateProgress(data);
    } catch (err: any) {
      setIsLoading(false);
      setLoadingStage('idle');
      setError(err.message || 'Failed to load demo dataset. Please try again.');
    }
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingStage('understanding');
      setIsUploadModalOpen(false);

      const data = await apiService.uploadDataset(file);
      await simulateProgress(data);
    } catch (err: any) {
      setIsLoading(false);
      setLoadingStage('idle');
      setError(err.message || 'Error processing uploaded dataset. Please check file format.');
    }
  }, []);

  const clearDataset = useCallback(() => {
    setDataset(null);
    setActiveTab('overview');
    setError(null);
  }, []);

  const navigateToDashboard = useCallback(() => {
    setIsLandingPage(false);
  }, []);

  const navigateToLanding = useCallback(() => {
    setIsLandingPage(true);
  }, []);

  return {
    dataset,
    activeTab,
    setActiveTab,
    isLoading,
    loadingStage,
    error,
    setError,
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
  };
}
