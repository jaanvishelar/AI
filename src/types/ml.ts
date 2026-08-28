import { AIConfidence } from './index';

export type MLModelStatus = 'idle' | 'checking' | 'training' | 'complete' | 'insufficient_data' | 'error';

export interface MLReadinessCheck {
  overallScore: number; // 0 to 100
  isReady: boolean;
  status: 'Ready' | 'Partial' | 'Insufficient Data';
  totalRows: number;
  uniqueCustomers: number;
  dateRange: {
    hasDates: boolean;
    startDate?: string;
    endDate?: string;
    daysSpan?: number;
  };
  detectedFeatures: {
    numericalCount: number;
    categoricalCount: number;
    hasCustomerId: boolean;
    hasOrderDate: boolean;
    hasRevenue: boolean;
    hasQuantity: boolean;
    hasProduct: boolean;
    hasPaymentStatus: boolean;
  };
  missingValuesRatePct: number;
  checks: {
    id: string;
    title: string;
    passed: boolean;
    severity: 'success' | 'warning' | 'error';
    details: string;
  }[];
  unsupportedTasks: {
    task: string;
    reason: string;
  }[];
}

export interface ModelMetricComparison {
  modelName: string;
  modelType: 'logistic_regression' | 'random_forest' | 'gradient_boosting' | 'time_series_ridge' | 'isolation_forest' | 'kmeans';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc?: number;
  isSelected: boolean;
  selectionRationale: string;
  hyperparameters?: Record<string, any>;
  trainSize: number;
  testSize: number;
}

export type ChurnRiskLevel = 'High' | 'Medium' | 'Low';

export interface CustomerChurnProfile {
  customerId: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  lastPurchaseDate: string;
  daysInactive: number;
  orderFrequencyPerMonth: number;
  avgDiscountUsedPct: number;
  returnRatePct: number;
  churnProbability: number; // 0.00 to 1.00
  riskLevel: ChurnRiskLevel;
  contributingSignals: string[];
  featureImportance: { feature: string; weight: number; impact: 'positive' | 'negative' }[];
  predictedStatus: 'Churned' | 'Active';
}

export interface ChurnPredictionResult {
  isAvailable: boolean;
  unavailabilityReason?: string;
  selectedModel: string;
  inactivityThresholdDays: number;
  totalCustomersAnalyzed: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  avgChurnProbability: number;
  modelComparison: ModelMetricComparison[];
  featureRankings: { feature: string; importancePct: number; description: string }[];
  customers: CustomerChurnProfile[];
  validationMethod: string;
  trainTestSplitRatio: string;
  dataLeakageMitigation: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  badgeColor: string;
  customerCount: number;
  customerPercentage: number;
  totalRevenue: number;
  revenueSharePct: number;
  avgOrderValue: number;
  avgPurchaseFrequency: number;
  avgRecencyDays: number;
  characteristics: string[];
  recommendedStrategy: string;
  sampleCustomerIds: string[];
}

export interface CustomerSegmentationResult {
  isAvailable: boolean;
  unavailabilityReason?: string;
  optimalK: number;
  silhouetteScore: number;
  evaluationMethod: string;
  totalCustomers: number;
  segments: CustomerSegment[];
  clusterCentroids: Record<string, number>[];
}

export interface ForecastDataPoint {
  date: string;
  actualRevenue?: number;
  predictedRevenue?: number;
  lowerBound?: number;
  upperBound?: number;
  isForecast: boolean;
  orders?: number;
}

export interface ForecastMetrics {
  mae: number;
  rmse: number;
  mape: number;
  rSquared: number;
  validationPeriodDays: number;
  maeExplanation: string;
}

export interface RevenueForecastResult {
  isAvailable: boolean;
  unavailabilityReason?: string;
  horizonDays: 7 | 30 | 90;
  totalHistoricalRevenue: number;
  forecastedRevenue: number;
  forecastGrowthRatePct: number;
  modelName: string;
  metrics: ForecastMetrics;
  dailyPoints: ForecastDataPoint[];
  weeklyAggregates: ForecastDataPoint[];
  methodology: string;
}

export interface AnomalyTransaction {
  transactionId: string;
  customerId: string;
  productName: string;
  amount: number;
  date: string;
  anomalyScore: number; // 0.00 to 1.00 (higher = more unusual)
  isAnomaly: boolean;
  category: string;
  contributingSignals: string[];
  zScores: {
    amountZ: number;
    quantityZ: number;
    discountZ: number;
  };
}

export interface AnomalyDetectionResult {
  isAvailable: boolean;
  unavailabilityReason?: string;
  totalTransactions: number;
  unusualTransactionsCount: number;
  anomalyRatePct: number;
  modelUsed: string;
  contaminationThreshold: number;
  anomalies: AnomalyTransaction[];
  topAnomalies: AnomalyTransaction[];
}

export interface ProductVelocityProfile {
  productId: string;
  productName: string;
  category: string;
  totalRevenue: number;
  revenueSharePct: number;
  unitsSold: number;
  orderCount: number;
  avgSellingPrice: number;
  growthRatePct: number; // calculated over time
  velocityStatus: 'Fast Growing' | 'Steady Performer' | 'Declining' | 'Low Sample';
  observationCount: number;
}

export interface ProductIntelligenceResult {
  isAvailable: boolean;
  topProducts: ProductVelocityProfile[];
  fastGrowingProducts: ProductVelocityProfile[];
  decliningProducts: ProductVelocityProfile[];
  allProducts: ProductVelocityProfile[];
}

export interface StructuredGrowthOpportunityML {
  opportunity_type: 'churn_recovery' | 'vip_expansion' | 'cross_sell' | 'anomaly_mitigation' | 'forecast_cashflow';
  target_segment: string;
  supporting_metrics: {
    affectedCustomers?: number;
    currentRevenue?: number;
    riskRate?: number;
    avgOrderValue?: number;
  };
  estimated_impact: number; // in INR / primary currency
  estimated_impact_formatted: string;
  confidence: AIConfidence;
  recommended_action: string;
  reason: string;
  calculation_formula: string;
}

export interface FullMLAnalysisResult {
  datasetName: string;
  timestamp: string;
  readiness: MLReadinessCheck;
  churn: ChurnPredictionResult;
  segmentation: CustomerSegmentationResult;
  forecast: RevenueForecastResult;
  anomalies: AnomalyDetectionResult;
  products: ProductIntelligenceResult;
  growthOpportunities: StructuredGrowthOpportunityML[];
  isCached: boolean;
}
