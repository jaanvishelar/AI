from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union

class ColumnProfileSchema(BaseModel):
    name: str
    detectedType: str # numerical, categorical, date, boolean, id
    inferredRole: str # id, customer, product, category, date, monetary, quantity, discount, status, location, channel, boolean, unknown
    missingCount: int
    missingPercentage: float
    uniqueCount: int
    sampleValues: List[Any] = []
    min: Optional[Union[float, str]] = None
    max: Optional[Union[float, str]] = None
    mean: Optional[float] = None

class InferredRolesSchema(BaseModel):
    idColumn: Optional[str] = None
    customerColumn: Optional[str] = None
    productColumn: Optional[str] = None
    categoryColumn: Optional[str] = None
    dateColumn: Optional[str] = None
    revenueColumn: Optional[str] = None
    quantityColumn: Optional[str] = None
    discountColumn: Optional[str] = None
    paymentStatusColumn: Optional[str] = None
    cityColumn: Optional[str] = None
    channelColumn: Optional[str] = None
    returnedColumn: Optional[str] = None

class QualityBreakdownSchema(BaseModel):
    missingValuesPct: float
    duplicateRowsPct: float
    invalidValuesPct: float
    completeValuesPct: float
    totalCells: int
    missingCells: int
    duplicateRowCount: int
    invalidCellsCount: int

class QualityScoreSchema(BaseModel):
    score: int
    grade: str # Excellent, Good, Fair, Needs Attention
    breakdown: QualityBreakdownSchema

class CleaningSuggestionSchema(BaseModel):
    id: str
    type: str
    title: str
    description: str
    severity: str # low, medium, high
    affectedColumns: Optional[List[str]] = None
    affectedCount: int
    recommendedAction: str

class RevenueKPIsSchema(BaseModel):
    totalRevenue: Optional[float] = None
    totalOrders: Optional[int] = None
    averageOrderValue: Optional[float] = None
    totalQuantity: Optional[float] = None
    uniqueCustomers: Optional[int] = None
    returningCustomerPercentage: Optional[float] = None
    returnRatePercentage: Optional[float] = None
    totalDiscounts: Optional[float] = None
    availableMetrics: List[str] = []
    missingMetrics: List[str] = []

class RevenueTrendPointSchema(BaseModel):
    date: str
    revenue: float
    orders: int

class CategoryBreakdownSchema(BaseModel):
    category: str
    revenue: float
    orders: int
    avgPrice: float

class CityBreakdownSchema(BaseModel):
    city: str
    revenue: float
    orders: int

class StatusDistributionSchema(BaseModel):
    status: str
    count: int
    percentage: float

class ChannelPerformanceSchema(BaseModel):
    channel: str
    revenue: float
    customers: int

class ChartsSchema(BaseModel):
    revenueOverTime: List[RevenueTrendPointSchema] = []
    revenueByCategory: List[CategoryBreakdownSchema] = []
    ordersByCategory: List[CategoryBreakdownSchema] = []
    revenueByCity: List[CityBreakdownSchema] = []
    paymentStatusDistribution: List[StatusDistributionSchema] = []
    acquisitionChannels: Optional[List[ChannelPerformanceSchema]] = []

class DatasetAnalysisResultSchema(BaseModel):
    datasetName: str
    isDemo: bool
    uploadedAt: str
    fileSizeBytes: Optional[int] = None
    rowCount: int
    columnCount: int
    columns: List[ColumnProfileSchema]
    inferredRoles: InferredRolesSchema
    qualityScore: QualityScoreSchema
    cleaningSuggestions: List[CleaningSuggestionSchema]
    kpis: RevenueKPIsSchema
    charts: ChartsSchema
    sampleRows: List[Dict[str, Any]] = []

class HealthResponse(BaseModel):
    status: str
    service: str
    phase: str
    version: str
