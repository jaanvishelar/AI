import { DatasetAnalysisResult } from '../types';
import {
  FullMLAnalysisResult,
  MLReadinessCheck,
  ChurnPredictionResult,
  CustomerSegmentationResult,
  RevenueForecastResult,
  AnomalyDetectionResult,
  ProductIntelligenceResult,
  StructuredGrowthOpportunityML,
} from '../types/ml';
import {
  evaluateMLReadiness,
  trainAndEvaluateChurnModels,
  performCustomerSegmentation,
  generateRevenueForecast,
  detectUnusualTransactions,
  computeProductIntelligence,
  generateStructuredGrowthOpportunities,
} from '../utils/mlEngine';

// In-memory cache for ML execution results to prevent redundant runs on tab switches
const mlCache = new Map<string, FullMLAnalysisResult>();

export interface MLPipelineProgressCallback {
  (step: number, totalSteps: number, stageName: string, detail: string): void;
}

export class MLService {
  /**
   * Retrieves cached analysis if available for the given dataset
   */
  static getCachedResult(datasetName: string, recordCount: number): FullMLAnalysisResult | null {
    const cacheKey = `${datasetName}_${recordCount}`;
    return mlCache.get(cacheKey) || null;
  }

  /**
   * Clears cache for a dataset
   */
  static clearCache(datasetName?: string): void {
    if (datasetName) {
      for (const key of mlCache.keys()) {
        if (key.startsWith(datasetName)) mlCache.delete(key);
      }
    } else {
      mlCache.clear();
    }
  }

  /**
   * Performs real ML readiness check
   */
  static checkReadiness(
    records: Record<string, any>[],
    dataset: DatasetAnalysisResult
  ): MLReadinessCheck {
    return evaluateMLReadiness(records, dataset);
  }

  /**
   * Executes the full ML pipeline with progressive visual feedback
   */
  static async runPipeline(
    records: Record<string, any>[],
    dataset: DatasetAnalysisResult,
    forecastHorizon: 7 | 30 | 90 = 30,
    onProgress?: MLPipelineProgressCallback,
    forceRefresh: boolean = false
  ): Promise<FullMLAnalysisResult> {
    const cacheKey = `${dataset.datasetName}_${records.length}`;

    if (!forceRefresh && mlCache.has(cacheKey)) {
      const cached = mlCache.get(cacheKey)!;
      // If forecast horizon changed, re-run forecast component
      if (cached.forecast.horizonDays !== forecastHorizon) {
        cached.forecast = generateRevenueForecast(records, dataset, forecastHorizon);
      }
      return cached;
    }

    const totalSteps = 6;

    // Step 1: Data Preparation & ML Readiness
    onProgress?.(1, totalSteps, 'Preparing Data', 'Analyzing column roles, feature distributions, and evaluating dataset readiness...');
    await new Promise((r) => setTimeout(r, 220));
    const readiness = evaluateMLReadiness(records, dataset);

    // Step 2: Customer Churn Classification & Model Comparison
    onProgress?.(2, totalSteps, 'Training Churn Models', 'Extracting RFM features, splitting holdouts, and comparing Gradient Boosting, Random Forest, & Logistic Regression...');
    await new Promise((r) => setTimeout(r, 280));
    const churn = trainAndEvaluateChurnModels(records, dataset);

    // Step 3: Customer Segmentation (K-Means & Silhouette Optimization)
    onProgress?.(3, totalSteps, 'Performing Segmentation', 'Running K-Means++ clustering and computing Silhouette coefficients across candidate clusters...');
    await new Promise((r) => setTimeout(r, 240));
    const segmentation = performCustomerSegmentation(records, dataset);

    // Step 4: Time-Series Revenue Forecasting
    onProgress?.(4, totalSteps, 'Preparing Forecast', 'Decomposing historical series, fitting Autoregressive Ridge model, and estimating confidence intervals...');
    await new Promise((r) => setTimeout(r, 240));
    const forecast = generateRevenueForecast(records, dataset, forecastHorizon);

    // Step 5: Anomaly Detection & Product Intelligence
    onProgress?.(5, totalSteps, 'Detecting Anomalies', 'Computing multivariate Isolation Forest scores and analyzing product growth velocity...');
    await new Promise((r) => setTimeout(r, 220));
    const anomalies = detectUnusualTransactions(records, dataset);
    const products = computeProductIntelligence(records, dataset);

    // Step 6: Opportunity Sizing & Assembly
    onProgress?.(6, totalSteps, 'Generating Intelligence', 'Sizing machine-readable growth opportunities and finalizing evaluation metrics...');
    await new Promise((r) => setTimeout(r, 160));
    const growthOpportunities = generateStructuredGrowthOpportunities(
      churn,
      segmentation,
      forecast,
      anomalies,
      products
    );

    const result: FullMLAnalysisResult = {
      datasetName: dataset.datasetName,
      timestamp: new Date().toISOString(),
      readiness,
      churn,
      segmentation,
      forecast,
      anomalies,
      products,
      growthOpportunities,
      isCached: true,
    };

    mlCache.set(cacheKey, result);
    return result;
  }

  /**
   * Re-evaluates forecast for a new horizon (7, 30, 90 days)
   */
  static updateForecastHorizon(
    records: Record<string, any>[],
    dataset: DatasetAnalysisResult,
    currentResult: FullMLAnalysisResult,
    horizonDays: 7 | 30 | 90
  ): FullMLAnalysisResult {
    const updatedForecast = generateRevenueForecast(records, dataset, horizonDays);
    const updatedResult: FullMLAnalysisResult = {
      ...currentResult,
      forecast: updatedForecast,
    };
    const cacheKey = `${dataset.datasetName}_${records.length}`;
    mlCache.set(cacheKey, updatedResult);
    return updatedResult;
  }

  /**
   * Shorthand runner for full ML analysis
   */
  static async runFullMLPipeline(
    records: Record<string, any>[],
    dataset: DatasetAnalysisResult
  ): Promise<FullMLAnalysisResult> {
    return this.runPipeline(records, dataset, 30);
  }
}

