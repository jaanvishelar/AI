import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, Optional

def prepare_rfm_features(df: pd.DataFrame, cust_col: str, date_col: str, rev_col: str) -> pd.DataFrame:
    """
    Extracts Recency, Frequency, Monetary value per customer without future data leakage.
    """
    df_clean = df.dropna(subset=[cust_col]).copy()
    if date_col in df_clean.columns:
        df_clean['parsed_date'] = pd.to_datetime(df_clean[date_col], errors='coerce')
    else:
        df_clean['parsed_date'] = pd.Timestamp.now()
    
    max_date = df_clean['parsed_date'].max()
    
    rfm = df_clean.groupby(cust_col).agg(
        recency=(
            'parsed_date',
            lambda x: (max_date - x.max()).days if pd.notnull(x.max()) else 0
        ),
        frequency=(cust_col, 'count'),
        monetary=(rev_col, 'sum') if rev_col in df_clean.columns else (cust_col, lambda x: 1.0),
        first_date=('parsed_date', 'min'),
        last_date=('parsed_date', 'max')
    ).reset_index()
    
    rfm['avg_order_value'] = rfm['monetary'] / rfm['frequency'].clip(lower=1)
    return rfm

def train_test_split_temporal(
    df: pd.DataFrame,
    date_col: str,
    test_ratio: float = 0.2
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Chronological train/test split to prevent temporal data leakage.
    """
    df_sorted = df.sort_values(by=date_col)
    split_idx = int(len(df_sorted) * (1 - test_ratio))
    return df_sorted.iloc[:split_idx], df_sorted.iloc[split_idx:]
