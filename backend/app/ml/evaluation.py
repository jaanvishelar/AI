from typing import Dict, Any

def format_evaluation_summary(metrics: Dict[str, float]) -> Dict[str, Any]:
    """
    Standardizes ML metric reporting across classification and regression tasks.
    """
    return {
        "accuracy": round(metrics.get("accuracy", 0.0) * 100, 1),
        "precision": round(metrics.get("precision", 0.0) * 100, 1),
        "recall": round(metrics.get("recall", 0.0) * 100, 1),
        "f1": round(metrics.get("f1", 0.0) * 100, 1),
        "roc_auc": round(metrics.get("roc_auc", 0.5), 3)
    }
