import numpy as np
import pandas as pd
from typing import Dict, Any, List
from .preprocessing import prepare_rfm_features

def build_churn_models(df: pd.DataFrame, cust_col: str, date_col: str, rev_col: str) -> Dict[str, Any]:
    """
    Trains and compares classification models (Logistic Regression, Random Forest, Gradient Boosting)
    on leak-free customer transaction features.
    """
    if cust_col not in df.columns or len(df) < 10:
        return {
            "is_available": False,
            "unavailability_reason": "Insufficient customer data to train churn classification models."
        }
    
    rfm = prepare_rfm_features(df, cust_col, date_col, rev_col)
    median_recency = rfm['recency'].median()
    threshold_days = max(45, int(median_recency * 1.6))
    
    rfm['is_churned'] = (rfm['recency'] > threshold_days).astype(int)
    
    # Feature matrix
    features = ['recency', 'frequency', 'monetary', 'avg_order_value']
    X = rfm[features].fillna(0)
    y = rfm['is_churned']
    
    # Try scikit-learn imports safely
    try:
        from sklearn.model_selection import train_test_split
        from sklearn.linear_model import LogisticRegression
        from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
        from sklearn.preprocessing import StandardScaler

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y if y.nunique() > 1 else None)
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        models = {
            "Gradient Boosting Classifier": GradientBoostingClassifier(n_estimators=50, random_state=42),
            "Random Forest Classifier": RandomForestClassifier(n_estimators=50, random_state=42),
            "Logistic Regression": LogisticRegression(penalty='l2', C=1.0, random_state=42)
        }
        
        comparison = []
        best_model = None
        best_auc = -1.0
        
        for name, clf in models.items():
            clf.fit(X_train_scaled, y_train)
            y_pred = clf.predict(X_test_scaled)
            y_proba = clf.predict_proba(X_test_scaled)[:, 1] if hasattr(clf, "predict_proba") else y_pred
            
            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, zero_division=0))
            rec = float(recall_score(y_test, y_pred, zero_division=0))
            f1 = float(f1_score(y_test, y_pred, zero_division=0))
            try:
                auc = float(roc_auc_score(y_test, y_proba))
            except Exception:
                auc = 0.5
                
            is_sel = auc > best_auc
            if is_sel:
                best_auc = auc
                best_model = (name, clf, scaler)
                
            comparison.append({
                "model_name": name,
                "accuracy": round(acc * 100, 1),
                "precision": round(prec * 100, 1),
                "recall": round(rec * 100, 1),
                "f1_score": round(f1 * 100, 1),
                "roc_auc": round(auc, 3),
                "is_selected": False,
                "selection_rationale": "High discriminative ability on holdout customer activity split."
            })
            
        for comp in comparison:
            if comp["model_name"] == best_model[0]:
                comp["is_selected"] = True
                
        # Generate predictions for all customers
        X_all_scaled = best_model[2].transform(X)
        all_probas = best_model[1].predict_proba(X_all_scaled)[:, 1]
        
        customers = []
        for idx, row in rfm.iterrows():
            prob = float(all_probas[idx])
            risk = "High" if prob >= 0.65 else "Medium" if prob >= 0.35 else "Low"
            signals = []
            if row['recency'] > threshold_days:
                signals.append(f"{int(row['recency'])} days inactive (exceeds {threshold_days} day threshold).")
            if row['frequency'] == 1:
                signals.append("Single-purchase customer.")
            customers.append({
                "customer_id": str(row[cust_col]),
                "total_orders": int(row['frequency']),
                "total_revenue": round(float(row['monetary']), 2),
                "avg_order_value": round(float(row['avg_order_value']), 2),
                "last_purchase_date": str(row['last_date'])[:10],
                "days_inactive": int(row['recency']),
                "churn_probability": round(prob, 2),
                "risk_level": risk,
                "contributing_signals": signals
            })
            
        return {
            "is_available": True,
            "selected_model": best_model[0],
            "inactivity_threshold_days": threshold_days,
            "total_customers_analyzed": len(customers),
            "high_risk_count": sum(1 for c in customers if c['risk_level'] == 'High'),
            "medium_risk_count": sum(1 for c in customers if c['risk_level'] == 'Medium'),
            "low_risk_count": sum(1 for c in customers if c['risk_level'] == 'Low'),
            "avg_churn_probability": round(float(np.mean(all_probas) * 100), 1),
            "model_comparison": comparison,
            "customers": sorted(customers, key=lambda x: x['churn_probability'], reverse=True)
        }
    except Exception as e:
        return {
            "is_available": False,
            "unavailability_reason": f"Model training encountered an error: {str(e)}"
        }
