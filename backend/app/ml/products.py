import pandas as pd
from typing import Dict, Any, List

def analyze_product_trends(df: pd.DataFrame, prod_col: str, rev_col: str, date_col: str) -> Dict[str, Any]:
    """
    Evaluates product velocities and trends over historical periods.
    """
    if prod_col not in df.columns or rev_col not in df.columns:
        return {"is_available": False, "products": []}
        
    df_clean = df.copy()
    grouped = df_clean.groupby(prod_col).agg(
        total_revenue=(rev_col, 'sum'),
        orders=(prod_col, 'count')
    ).reset_index()
    
    total_rev = grouped['total_revenue'].sum() or 1.0
    products = []
    
    for _, row in grouped.iterrows():
        p_name = str(row[prod_col])
        rev = float(row['total_revenue'])
        orders = int(row['orders'])
        
        products.append({
            "product_name": p_name,
            "total_revenue": round(rev, 2),
            "revenue_share_pct": round((rev / total_rev) * 100, 1),
            "order_count": orders,
            "velocity_status": "Steady Performer" if orders >= 5 else "Low Sample"
        })
        
    return {
        "is_available": True,
        "products": sorted(products, key=lambda x: x['total_revenue'], reverse=True)
    }
