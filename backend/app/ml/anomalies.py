import numpy as np
import pandas as pd
from typing import Dict, Any, List

def detect_isolation_anomalies(df: pd.DataFrame, rev_col: str, cust_col: str, date_col: str) -> Dict[str, Any]:
    """
    Multivariate Isolation Forest anomaly detection on order features.
    """
    if rev_col not in df.columns or len(df) < 10:
        return {
            "is_available": False,
            "unavailability_reason": "Insufficient transaction records to compute anomaly isolation."
        }
        
    try:
        from sklearn.ensemble import IsolationForest
        
        df_clean = df.copy()
        df_clean['amt'] = pd.to_numeric(df_clean[rev_col], errors='coerce').fillna(0)
        
        X = df_clean[['amt']].values
        iso = IsolationForest(contamination=0.03, random_state=42)
        preds = iso.fit_predict(X)
        scores = iso.decision_function(X)
        
        # Normalize score to 0..1 (higher = more anomalous)
        min_s, max_s = scores.min(), scores.max()
        norm_scores = 1.0 - (scores - min_s) / max(1e-4, max_s - min_s)
        
        anomalies = []
        for idx, row in df_clean.iterrows():
            is_anom = preds[idx] == -1
            score = float(norm_scores[idx])
            
            if is_anom or score > 0.7:
                amt = float(row['amt'])
                anomalies.append({
                    "transaction_id": str(row.get('transaction_id', f"TXN-{idx+1}")),
                    "customer_id": str(row.get(cust_col, 'N/A')),
                    "amount": round(amt, 2),
                    "date": str(row.get(date_col, 'N/A'))[:10],
                    "anomaly_score": round(score, 2),
                    "is_anomaly": bool(is_anom),
                    "contributing_signals": [f"Order amount ₹{amt:,.2f} is an outlier relative to typical basket size."]
                })
                
        anomalies_sorted = sorted(anomalies, key=lambda x: x['anomaly_score'], reverse=True)
        unusual_count = sum(1 for a in anomalies if a['is_anomaly'])
        
        return {
            "is_available": True,
            "total_transactions": len(df),
            "unusual_transactions_count": unusual_count,
            "anomaly_rate_pct": round((unusual_count / len(df)) * 100, 2),
            "model_used": "Scikit-Learn Isolation Forest (0.03 Contamination)",
            "anomalies": anomalies_sorted[:30]
        }
    except Exception as e:
        return {
            "is_available": False,
            "unavailability_reason": f"Anomaly detection encountered an error: {str(e)}"
        }
