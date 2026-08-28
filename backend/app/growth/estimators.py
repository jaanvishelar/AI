from typing import Dict, Any

def format_inr(val: float) -> str:
    return f"₹{int(round(val)):,}"

def estimate_churn_recovery(high_risk_count: int, avg_aov: float, win_back_rate: float) -> Dict[str, Any]:
    impact = int(round(high_risk_count * avg_aov * (win_back_rate / 100.0)))
    formula = f"{high_risk_count} at-risk customers × ₹{int(round(avg_aov)):,} historical AOV × {int(round(win_back_rate))}% assumed win-back rate"
    return {
        "impactValue": impact,
        "impactFormatted": format_inr(impact),
        "formula": formula
    }

def estimate_cross_sell(eligible_count: int, product_b_price: float, adoption_rate: float) -> Dict[str, Any]:
    impact = int(round(eligible_count * product_b_price * (adoption_rate / 100.0)))
    formula = f"{eligible_count} eligible buyers × ₹{int(round(product_b_price)):,} unit price × {int(round(adoption_rate))}% adoption rate"
    return {
        "impactValue": impact,
        "impactFormatted": format_inr(impact),
        "formula": formula
    }

def estimate_payment_recovery(failed_value: float, recovery_rate: float) -> Dict[str, Any]:
    impact = int(round(failed_value * (recovery_rate / 100.0)))
    formula = f"₹{int(round(failed_value)):,} failed order value × {int(round(recovery_rate))}% retry recovery assumption"
    return {
        "impactValue": impact,
        "impactFormatted": format_inr(impact),
        "formula": formula
    }

def estimate_vip_retention(vip_count: int, vip_aov: float, save_rate: float) -> Dict[str, Any]:
    impact = int(round(vip_count * vip_aov * (save_rate / 100.0)))
    formula = f"{vip_count} VIP customers × ₹{int(round(vip_aov)):,} segment AOV × {int(round(save_rate))}% retention assumption"
    return {
        "impactValue": impact,
        "impactFormatted": format_inr(impact),
        "formula": formula
    }
