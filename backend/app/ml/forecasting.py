import numpy as np
import pandas as pd
from typing import Dict, Any

def forecast_revenue_series(df: pd.DataFrame, date_col: str, rev_col: str, horizon_days: int = 30) -> Dict[str, Any]:
    """
    Time-series revenue autoregression with rolling window lag features.
    """
    if date_col not in df.columns or rev_col not in df.columns:
        return {
            "is_available": False,
            "unavailability_reason": "Date and revenue columns are required for time-series forecasting."
        }
        
    try:
        from sklearn.linear_model import Ridge
        from sklearn.metrics import mean_absolute_error, mean_squared_error
        
        df_clean = df.dropna(subset=[date_col, rev_col]).copy()
        df_clean['date_parsed'] = pd.to_datetime(df_clean[date_col], errors='coerce')
        df_clean = df_clean.dropna(subset=['date_parsed'])
        
        # Aggregate daily
        daily = df_clean.groupby(df_clean['date_parsed'].dt.date)[rev_col].sum().reset_index()
        daily.columns = ['date', 'revenue']
        daily = daily.sort_values(by='date')
        
        if len(daily) < 14:
            return {
                "is_available": False,
                "unavailability_reason": f"Insufficient days ({len(daily)} days). Need at least 14 days."
            }
            
        # Create lag features
        daily['lag1'] = daily['revenue'].shift(1)
        daily['lag7'] = daily['revenue'].shift(7)
        daily['roll7'] = daily['revenue'].rolling(7).mean()
        daily['day_of_week'] = pd.to_datetime(daily['date']).dt.dayofweek
        daily['is_weekend'] = daily['day_of_week'].isin([5, 6]).astype(int)
        
        features_df = daily.dropna().copy()
        X = features_df[['lag1', 'lag7', 'roll7', 'is_weekend']]
        y = features_df['revenue']
        
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
        
        model = Ridge(alpha=1.0)
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        mape = float(np.mean(np.abs((y_test - y_pred) / np.maximum(y_test, 1))) * 100)
        
        # Extrapolate future points
        last_date = pd.to_datetime(daily['date'].max())
        rolling_revs = list(daily['revenue'].tail(7))
        daily_points = []
        
        for _, row in daily.tail(30).iterrows():
            daily_points.append({
                "date": str(row['date']),
                "actual_revenue": round(float(row['revenue']), 2),
                "is_forecast": False
            })
            
        future_rev_sum = 0
        for i in range(1, horizon_days + 1):
            next_date = last_date + pd.Timedelta(days=i)
            is_wknd = 1 if next_date.dayofweek in [5, 6] else 0
            x_future = np.array([[rolling_revs[-1], rolling_revs[0], np.mean(rolling_revs), is_wknd]])
            pred_rev = max(0.0, float(model.predict(x_future)[0]))
            
            lower = max(0.0, pred_rev - rmse * 1.28)
            upper = pred_rev + rmse * 1.28
            
            future_rev_sum += pred_rev
            rolling_revs.append(pred_rev)
            rolling_revs.pop(0)
            
            daily_points.append({
                "date": str(next_date.date()),
                "predicted_revenue": round(pred_rev, 2),
                "lower_bound": round(lower, 2),
                "upper_bound": round(upper, 2),
                "is_forecast": True
            })
            
        prior_sum = float(daily['revenue'].tail(horizon_days).sum()) or 1.0
        growth_pct = round(((future_rev_sum - prior_sum) / prior_sum) * 100, 1)
        
        return {
            "is_available": True,
            "horizon_days": horizon_days,
            "total_historical_revenue": round(float(daily['revenue'].sum()), 2),
            "forecasted_revenue": round(future_rev_sum, 2),
            "forecast_growth_rate_pct": growth_pct,
            "model_name": "Ridge Autoregression with Rolling Windows",
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape, 1),
            "daily_points": daily_points
        }
    except Exception as e:
        return {
            "is_available": False,
            "unavailability_reason": f"Forecasting encountered an issue: {str(e)}"
        }
