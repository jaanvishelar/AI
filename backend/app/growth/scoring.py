from typing import Dict, Any

def calculate_priority_score(
    impact_value: float,
    total_revenue: float,
    evidence_strength: float,
    affected_count: int,
    total_customers: int,
    confidence: str,
    feasibility_score: int
) -> Dict[str, Any]:
    """
    Computes a multi-factor priority score from 0 to 100.
    """
    safe_rev = max(10000.0, total_revenue)
    impact_ratio = min(1.0, impact_value / (safe_rev * 0.15))
    impact_score = int(round(impact_ratio * 30))

    evidence_score = int(round(min(1.0, max(0.2, evidence_strength)) * 25))

    safe_cust = max(1, total_customers)
    reach_ratio = min(1.0, affected_count / safe_cust)
    reach_score = int(round(max(0.1, reach_ratio) * 20))

    confidence_map = {"High": 15, "Medium": 10, "Low": 5}
    confidence_score = confidence_map.get(confidence, 10)

    safe_feasibility = min(10, max(1, feasibility_score))

    total_score = min(100, max(10, impact_score + evidence_score + reach_score + confidence_score + safe_feasibility))

    explanation = (
        f"Score {total_score}/100 combines Impact ({impact_score}/30), "
        f"Evidence ({evidence_score}/25), Reach ({reach_score}/20), "
        f"Confidence ({confidence_score}/15), and Feasibility ({safe_feasibility}/10)."
    )

    return {
        "impactScore": impact_score,
        "evidenceScore": evidence_score,
        "reachScore": reach_score,
        "confidenceScore": confidence_score,
        "feasibilityScore": safe_feasibility,
        "totalScore": total_score,
        "explanation": explanation
    }

def get_priority_tier(score: int) -> str:
    if score >= 80:
        return "HIGH"
    elif score >= 60:
        return "MEDIUM"
    return "LOW"
