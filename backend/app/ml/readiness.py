import pandas as pd
from typing import Dict, Any, List

def check_dataset_readiness(df: pd.DataFrame, roles: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates dataset schema and volume to verify ML readiness.
    """
    total_rows = len(df)
    cust_col = roles.get('customerColumn')
    date_col = roles.get('dateColumn')
    rev_col = roles.get('revenueColumn')
    
    unique_custs = df[cust_col].nunique() if cust_col and cust_col in df.columns else 0
    
    score = 0
    checks = []
    unsupported = []
    
    # 1. Volume
    if total_rows >= 100:
        score += 25
        checks.append({"id": "rows", "title": "Dataset Volume", "passed": True, "details": f"{total_rows} records detected."})
    elif total_rows >= 20:
        score += 15
        checks.append({"id": "rows", "title": "Dataset Volume", "passed": True, "details": f"{total_rows} records detected (minimal)."})
    else:
        checks.append({"id": "rows", "title": "Dataset Volume", "passed": False, "details": f"Only {total_rows} records (need >= 20)."})
        
    # 2. Customer
    if cust_col and unique_custs >= 10:
        score += 25
        checks.append({"id": "cust", "title": "Customer Identifiers", "passed": True, "details": f"{unique_custs} unique customers."})
    else:
        checks.append({"id": "cust", "title": "Customer Identifiers", "passed": False, "details": "No customer identifier detected."})
        unsupported.append({"task": "Customer Churn Risk", "reason": "No customer identifier detected."})
        unsupported.append({"task": "Customer Segmentation", "reason": "No customer identifier detected."})
        
    # 3. Dates
    if date_col and date_col in df.columns:
        score += 25
        checks.append({"id": "dates", "title": "Transaction Dates", "passed": True, "details": f"Date column '{date_col}' detected."})
    else:
        checks.append({"id": "dates", "title": "Transaction Dates", "passed": False, "details": "No date column detected."})
        unsupported.append({"task": "Revenue Forecasting", "reason": "No date column detected."})
        
    # 4. Revenue
    if rev_col and rev_col in df.columns:
        score += 25
        checks.append({"id": "rev", "title": "Revenue Attributes", "passed": True, "details": f"Monetary column '{rev_col}' detected."})
    else:
        checks.append({"id": "rev", "title": "Revenue Attributes", "passed": False, "details": "No monetary column detected."})
        
    status = "Ready" if score >= 75 else "Partial" if score >= 40 else "Insufficient Data"
    
    return {
        "overall_score": score,
        "is_ready": score >= 40,
        "status": status,
        "total_rows": total_rows,
        "unique_customers": unique_custs,
        "checks": checks,
        "unsupported_tasks": unsupported
    }
