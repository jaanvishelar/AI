import numpy as np
import pandas as pd
from typing import Dict, Any, List
from .preprocessing import prepare_rfm_features

def perform_rfm_segmentation(df: pd.DataFrame, cust_col: str, date_col: str, rev_col: str) -> Dict[str, Any]:
    """
    Unsupervised K-Means clustering with Silhouette score optimization.
    """
    if cust_col not in df.columns or len(df) < 10:
        return {
            "is_available": False,
            "unavailability_reason": "Insufficient customer data to perform K-Means clustering."
        }
        
    rfm = prepare_rfm_features(df, cust_col, date_col, rev_col)
    
    try:
        from sklearn.cluster import KMeans
        from sklearn.metrics import silhouette_score
        from sklearn.preprocessing import StandardScaler
        
        # Log transformation on RFM
        X = np.log1p(rfm[['recency', 'frequency', 'monetary']].fillna(0))
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        best_k = 4
        best_score = -1.0
        best_kmeans = None
        
        for k in [3, 4, 5]:
            if len(rfm) > k:
                km = KMeans(n_clusters=k, random_state=42, n_init=10)
                labels = km.fit_predict(X_scaled)
                score = silhouette_score(X_scaled, labels)
                if score > best_score:
                    best_score = score
                    best_k = k
                    best_kmeans = km
                    
        rfm['cluster'] = best_kmeans.predict(X_scaled)
        
        segments = []
        total_rev = rfm['monetary'].sum()
        
        for c_id in range(best_k):
            sub = rfm[rfm['cluster'] == c_id]
            c_rev = float(sub['monetary'].sum())
            c_count = len(sub)
            avg_aov = float(sub['avg_order_value'].mean())
            avg_freq = float(sub['frequency'].mean())
            avg_rec = int(sub['recency'].mean())
            
            name = "Loyal Customers" if avg_freq >= 2 else "New & Low Activity"
            segments.append({
                "id": f"seg-{c_id+1}",
                "name": name,
                "customer_count": c_count,
                "customer_percentage": round((c_count / len(rfm)) * 100, 1),
                "total_revenue": round(c_rev, 2),
                "revenue_share_pct": round((c_rev / max(1, total_rev)) * 100, 1),
                "avg_order_value": round(avg_aov, 2),
                "avg_purchase_frequency": round(avg_freq, 1),
                "avg_recency_days": avg_rec,
                "characteristics": ["Computed from RFM standardized feature distributions."],
                "recommended_strategy": "Tailor marketing automation to this cluster's frequency."
            })
            
        return {
            "is_available": True,
            "optimal_k": best_k,
            "silhouette_score": round(float(best_score), 3),
            "total_customers": len(rfm),
            "segments": sorted(segments, key=lambda x: x['total_revenue'], reverse=True)
        }
    except Exception as e:
        return {
            "is_available": False,
            "unavailability_reason": f"Segmentation encountered an issue: {str(e)}"
        }
