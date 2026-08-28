from typing import List, Dict, Any, Optional
from .schemas import GrowthSummaryResponse, GrowthOpportunitySchema
from .opportunity_rules import OpportunityRuleBook

class GrowthEngine:
    def __init__(self, dataset_name: str, kpis: Dict[str, Any], rows: List[Dict[str, Any]], ml_results: Optional[Dict[str, Any]] = None):
        self.dataset_name = dataset_name
        self.kpis = kpis
        self.rows = rows
        self.ml_results = ml_results or {}

    def run(self) -> Dict[str, Any]:
        opportunities = []
        
        # 1. Churn recovery
        churn_opp = OpportunityRuleBook.evaluate_churn_rule(self.kpis, self.ml_results.get("churn"), self.rows)
        if churn_opp:
            opportunities.append(churn_opp)

        opportunities.sort(key=lambda o: o.get("priorityScore", 0), reverse=True)
        
        return {
            "datasetName": self.dataset_name,
            "opportunities": opportunities,
            "totalOpportunities": len(opportunities)
        }
