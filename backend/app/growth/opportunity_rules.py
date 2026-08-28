from typing import List, Dict, Any, Optional
from collections import defaultdict
from .schemas import GrowthOpportunitySchema, CalculationAssumptionSchema, ScoreBreakdownSchema, EvidenceMetricItemSchema, OpportunityWhyDetailsSchema
from .scoring import calculate_priority_score, get_priority_tier
from .estimators import format_inr, estimate_churn_recovery, estimate_cross_sell, estimate_payment_recovery, estimate_vip_retention

class OpportunityRuleBook:
    @staticmethod
    def evaluate_churn_rule(dataset_kpis: Dict[str, Any], ml_churn: Optional[Dict[str, Any]], rows: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not ml_churn or not ml_churn.get("isAvailable") or ml_churn.get("highRiskCount", 0) <= 0:
            return None
        
        high_risk_count = ml_churn.get("highRiskCount", 0)
        total_rev = dataset_kpis.get("totalRevenue", 100000.0)
        total_cust = dataset_kpis.get("uniqueCustomers", 200)
        aov = dataset_kpis.get("averageOrderValue", 850.0)
        
        high_risk_custs = [c for c in ml_churn.get("customers", []) if c.get("riskLevel") == "High"]
        hist_rev = sum(c.get("totalRevenue", 0.0) for c in high_risk_custs)
        avg_aov = (sum(c.get("avgOrderValue", 0.0) for c in high_risk_custs) / len(high_risk_custs)) if high_risk_custs else aov
        
        est = estimate_churn_recovery(high_risk_count, avg_aov, 25.0)
        
        score_data = calculate_priority_score(
            impact_value=est["impactValue"],
            total_revenue=total_rev,
            evidence_strength=0.88,
            affected_count=high_risk_count,
            total_customers=total_cust,
            confidence="High",
            feasibility_score=9
        )
        
        return {
            "id": "opp-churn-recovery",
            "type": "churn_recovery",
            "category": "customer",
            "title": "Recover High-Risk Churning Customers",
            "subtitle": f"{high_risk_count} customers showing high inactivity and purchase cadence decay.",
            "priority": get_priority_tier(score_data["totalScore"]),
            "priorityScore": score_data["totalScore"],
            "scoreBreakdown": score_data,
            "targetAudience": f"{high_risk_count} High-Risk Customers",
            "targetCount": high_risk_count,
            "potentialImpactFormatted": est["impactFormatted"],
            "potentialImpactValue": est["impactValue"],
            "historicalValueFormatted": format_inr(hist_rev),
            "historicalValueRaw": hist_rev,
            "evidence": f"Supervised {ml_churn.get('selectedModel', 'Gradient Boosting')} flagged {high_risk_count} accounts with high churn probabilities based on RFM decay.",
            "evidenceMetrics": [
                {"label": "High Churn Risk Count", "value": high_risk_count},
                {"label": "Historical Spend at Risk", "value": format_inr(hist_rev)},
                {"label": "Inactivity Threshold", "value": f"{ml_churn.get('inactivityThresholdDays', 60)} days"}
            ],
            "businessImpact": "High churn accelerates customer acquisition drain. Re-engaging warm leads is significantly cheaper than paid cold acquisition.",
            "recommendedAction": "Deploy a timed 2-step win-back sequence offering a 12% re-order incentive on complementary replenishables.",
            "confidence": "High",
            "confidenceReason": "Calculated via 80/20 holdout cross-validation on leak-free customer transaction intervals.",
            "status": "new",
            "calculationFormula": est["formula"],
            "calculationAssumptions": [
                {
                    "key": "recovery_rate",
                    "name": "Win-back Conversion Rate",
                    "defaultValue": 25.0,
                    "currentValue": 25.0,
                    "min": 5.0,
                    "max": 60.0,
                    "step": 5.0,
                    "unit": "%",
                    "description": "Estimated percentage of at-risk customers who respond to reactivation incentives."
                }
            ],
            "whyDetails": {
                "dataUsed": ["customer_id", "order_date", "price", "quantity", "discount"],
                "metrics": [f"High Risk Count: {high_risk_count}"],
                "mlModel": ml_churn.get("selectedModel", "Gradient Boosting"),
                "evidence": f"Inactivity threshold: {ml_churn.get('inactivityThresholdDays', 60)} days.",
                "calculation": est["formula"],
                "assumptions": ["25% conservative win-back conversion assumption"],
                "limitations": "Model indicates statistical associations based on purchase history, not explicit customer dissatisfaction."
            }
        }
