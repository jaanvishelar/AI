export type CustomerType = 'New' | 'Returning' | 'VIP' | 'Wholesale';
export type PaymentStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded';
export type AcquisitionChannel = 'Organic' | 'Google Ads' | 'Instagram' | 'Email' | 'Referral' | 'Direct';

export interface MerchantTransaction {
  transaction_id: string;
  customer_id: string;
  order_date: string;
  product_id: string;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
  discount: number;
  payment_status: PaymentStatus;
  customer_type: CustomerType;
  city: string;
  acquisition_channel: AcquisitionChannel;
  returned: boolean | string;
  payment_method: string;
  [key: string]: any;
}

export type InferredRole = 
  | 'id'
  | 'customer'
  | 'product'
  | 'category'
  | 'date'
  | 'monetary'
  | 'quantity'
  | 'discount'
  | 'status'
  | 'location'
  | 'channel'
  | 'boolean'
  | 'unknown';

export interface ColumnProfile {
  name: string;
  detectedType: 'numerical' | 'categorical' | 'date' | 'boolean' | 'id';
  inferredRole: InferredRole;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  sampleValues: (string | number | null)[];
  min?: number | string;
  max?: number | string;
  mean?: number;
}

export interface InferredRoles {
  idColumn?: string;
  customerColumn?: string;
  productColumn?: string;
  categoryColumn?: string;
  dateColumn?: string;
  revenueColumn?: string;
  quantityColumn?: string;
  discountColumn?: string;
  paymentStatusColumn?: string;
  cityColumn?: string;
  channelColumn?: string;
  returnedColumn?: string;
}

export interface QualityBreakdown {
  missingValuesPct: number;
  duplicateRowsPct: number;
  invalidValuesPct: number;
  completeValuesPct: number;
  totalCells: number;
  missingCells: number;
  duplicateRowCount: number;
  invalidCellsCount: number;
}

export interface QualityScore {
  score: number; // 0 to 100
  grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  breakdown: QualityBreakdown;
}

export interface CleaningSuggestion {
  id: string;
  type: 'missing_values' | 'duplicate_rows' | 'date_inconsistency' | 'invalid_prices' | 'empty_column' | 'outlier';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedColumns?: string[];
  affectedCount: number;
  recommendedAction: string;
}

export interface RevenueKPIs {
  totalRevenue: number | null;
  totalOrders: number | null;
  averageOrderValue: number | null;
  totalQuantity: number | null;
  uniqueCustomers: number | null;
  returningCustomerPercentage: number | null;
  returnRatePercentage: number | null;
  totalDiscounts: number | null;
  availableMetrics: string[];
  missingMetrics: string[];
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  orders: number;
  avgPrice: number;
}

export interface CityBreakdown {
  city: string;
  revenue: number;
  orders: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface ChannelPerformance {
  channel: string;
  revenue: number;
  customers: number;
}

export interface DatasetAnalysisResult {
  datasetName: string;
  isDemo: boolean;
  uploadedAt: string;
  fileSizeBytes?: number;
  rowCount: number;
  columnCount: number;
  columns: ColumnProfile[];
  inferredRoles: InferredRoles;
  qualityScore: QualityScore;
  cleaningSuggestions: CleaningSuggestion[];
  kpis: RevenueKPIs;
  charts: {
    revenueOverTime: RevenueTrendPoint[];
    revenueByCategory: CategoryBreakdown[];
    ordersByCategory: CategoryBreakdown[];
    revenueByCity: CityBreakdown[];
    paymentStatusDistribution: StatusDistribution[];
    acquisitionChannels?: ChannelPerformance[];
  };
  sampleRows: Record<string, any>[];
  allRows?: Record<string, any>[];
}

export type DashboardTab = 
  | 'overview'
  | 'data'
  | 'ai_analyst'
  | 'revenue'
  | 'customers'
  | 'products'
  | 'predictions'
  | 'growth_actions'
  | 'audit_trail';

export type AIConfidence = 'High' | 'Medium' | 'Low';

export interface AIInsightWhyDetails {
  dataUsed: string[];
  evidenceStats: string[];
  method: string;
  limitations: string;
}

export interface AIInsightItem {
  id: string;
  title: string;
  category: 'revenue' | 'customer' | 'product' | 'channel' | 'payment' | 'risk';
  finding: string;
  evidence: string;
  businessImpact: string;
  recommendation: string;
  confidence: AIConfidence;
  confidenceReason?: string;
  whyDetails: AIInsightWhyDetails;
}

export interface GrowthOpportunity {
  id: string;
  title: string;
  targetSegment: string;
  evidence: string;
  estimatedImpact?: string;
  calculationFormula?: string;
  confidence: AIConfidence;
  recommendedNextStep: string;
  whyDetails?: {
    dataUsed: string[];
    method: string;
    limitations: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  timestamp: string;
  structuredInsight?: {
    finding: string;
    evidence: string;
    businessImpact: string;
    recommendation: string;
    confidence: AIConfidence;
    confidenceReason?: string;
    whyDetails?: AIInsightWhyDetails;
  };
  isError?: boolean;
}

export * from './ml';
export * from './growth';
export * from './commerce';

