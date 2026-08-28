from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class MLReadinessResponse(BaseModel):
    overall_score: int
    is_ready: bool
    status: str
    total_rows: int
    unique_customers: int
    checks: List[Dict[str, Any]]
    unsupported_tasks: List[Dict[str, str]]

class ModelMetricComparisonSchema(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    is_selected: bool
    selection_rationale: str

class CustomerChurnItem(BaseModel):
    customer_id: str
    total_orders: int
    total_revenue: float
    avg_order_value: float
    last_purchase_date: str
    days_inactive: int
    churn_probability: float
    risk_level: str
    contributing_signals: List[str]

class ChurnResultSchema(BaseModel):
    is_available: bool
    unavailability_reason: Optional[str] = None
    selected_model: str
    inactivity_threshold_days: int
    total_customers_analyzed: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    avg_churn_probability: float
    model_comparison: List[ModelMetricComparisonSchema]
    customers: List[CustomerChurnItem]

class SegmentItem(BaseModel):
    id: str
    name: str
    customer_count: int
    customer_percentage: float
    total_revenue: float
    revenue_share_pct: float
    avg_order_value: float
    avg_purchase_frequency: float
    avg_recency_days: int
    characteristics: List[str]
    recommended_strategy: str

class SegmentationResultSchema(BaseModel):
    is_available: bool
    unavailability_reason: Optional[str] = None
    optimal_k: int
    silhouette_score: float
    total_customers: int
    segments: List[SegmentItem]

class ForecastPoint(BaseModel):
    date: str
    actual_revenue: Optional[float] = None
    predicted_revenue: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    is_forecast: bool

class ForecastResultSchema(BaseModel):
    is_available: bool
    unavailability_reason: Optional[str] = None
    horizon_days: int
    total_historical_revenue: float
    forecasted_revenue: float
    forecast_growth_rate_pct: float
    model_name: str
    mae: float
    rmse: float
    mape: float
    daily_points: List[ForecastPoint]

class AnomalyItem(BaseModel):
    transaction_id: str
    customer_id: str
    amount: float
    date: str
    anomaly_score: float
    is_anomaly: bool
    contributing_signals: List[str]

class AnomalyResultSchema(BaseModel):
    is_available: bool
    unavailability_reason: Optional[str] = None
    total_transactions: int
    unusual_transactions_count: int
    anomaly_rate_pct: float
    model_used: str
    anomalies: List[AnomalyItem]
