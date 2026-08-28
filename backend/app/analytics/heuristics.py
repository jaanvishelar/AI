import re
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from ..schemas.models import ColumnProfileSchema, InferredRolesSchema

def infer_column_role(col_name: str, sample_values: List[Any], detected_type: str) -> str:
    lower = re.sub(r'[^a-z0-9]', '_', col_name.lower())
    
    if re.search(r'(^|_)(txn|transaction|invoice|order|receipt)_?(id|num|no)?$', lower) or (lower == 'id' and all(len(str(v)) > 3 for v in sample_values if v is not None)):
        return 'id'
    if re.search(r'(^|_)(customer|user|client|buyer|account)_?(id|num|name|code)?$', lower):
        return 'customer'
    if re.search(r'(^|_)(product|item|sku|merchandise|good)_?(id|name|title|code)?$', lower):
        return 'product'
    if re.search(r'(^|_)(category|dept|department|segment|vertical|genre)$', lower):
        return 'category'
    if re.search(r'(^|_)(date|time|timestamp|day|created_at|order_date|purchased_at)$', lower) or detected_type == 'date':
        return 'date'
    if re.search(r'(^|_)(price|amount|revenue|sales|total|gross|net|cost|mrp|unit_price|subtotal)$', lower):
        return 'monetary'
    if re.search(r'(^|_)(quantity|qty|units|items_count|volume|pieces)$', lower):
        return 'quantity'
    if re.search(r'(^|_)(discount|coupon|rebate|promo|pct_off)$', lower):
        return 'discount'
    if re.search(r'(^|_)(status|payment_status|order_status|state|outcome)$', lower):
        return 'status'
    if re.search(r'(^|_)(city|location|region|metro|state|country|zip|pincode)$', lower):
        return 'location'
    if re.search(r'(^|_)(channel|acquisition|source|utm_source|referrer|medium)$', lower):
        return 'channel'
    if re.search(r'(^|_)(returned|refunded|is_returned|is_refunded)$', lower) or detected_type == 'boolean':
        return 'boolean'
        
    return 'unknown'

def profile_dataset_columns(df: pd.DataFrame) -> Tuple[List[ColumnProfileSchema], InferredRolesSchema]:
    profiles: List[ColumnProfileSchema] = []
    roles = InferredRolesSchema()
    total_rows = len(df)

    for col in df.columns:
        series = df[col]
        missing_count = int(series.isna().sum())
        missing_pct = round((missing_count / max(1, total_rows)) * 100, 1)
        non_null = series.dropna()
        unique_count = int(non_null.nunique())
        
        sample_vals = []
        for val in non_null.head(5):
            if isinstance(val, (np.integer, int)):
                sample_vals.append(int(val))
            elif isinstance(val, (np.floating, float)):
                sample_vals.append(round(float(val), 2))
            else:
                sample_vals.append(str(val))
                
        # Type detection
        detected_type = 'categorical'
        if pd.api.types.is_numeric_dtype(series):
            detected_type = 'numerical'
        elif pd.api.types.is_bool_dtype(series):
            detected_type = 'boolean'
        elif pd.api.types.is_datetime64_any_dtype(series):
            detected_type = 'date'
        else:
            # Check if strings are parseable dates
            date_matches = 0
            if len(non_null) > 0:
                sample_checks = non_null.head(20).astype(str)
                for s in sample_checks:
                    if re.match(r'^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}', s) or re.match(r'^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}', s):
                        date_matches += 1
                if date_matches / len(sample_checks) > 0.8:
                    detected_type = 'date'

        role = infer_column_role(str(col), sample_vals, detected_type)

        # Map role
        if role == 'id' and not roles.idColumn: roles.idColumn = str(col)
        if role == 'customer' and not roles.customerColumn: roles.customerColumn = str(col)
        if role == 'product' and not roles.productColumn: roles.productColumn = str(col)
        if role == 'category' and not roles.categoryColumn: roles.categoryColumn = str(col)
        if role == 'date' and not roles.dateColumn: roles.dateColumn = str(col)
        if role == 'monetary' and not roles.revenueColumn: roles.revenueColumn = str(col)
        if role == 'quantity' and not roles.quantityColumn: roles.quantityColumn = str(col)
        if role == 'discount' and not roles.discountColumn: roles.discountColumn = str(col)
        if role == 'status' and not roles.paymentStatusColumn: roles.paymentStatusColumn = str(col)
        if role == 'location' and not roles.cityColumn: roles.cityColumn = str(col)
        if role == 'channel' and not roles.channelColumn: roles.channelColumn = str(col)
        if role == 'boolean' and not roles.returnedColumn: roles.returnedColumn = str(col)

        min_val = None
        max_val = None
        mean_val = None

        if detected_type == 'numerical' and len(non_null) > 0:
            min_val = round(float(non_null.min()), 2)
            max_val = round(float(non_null.max()), 2)
            mean_val = round(float(non_null.mean()), 2)

        profiles.append(ColumnProfileSchema(
            name=str(col),
            detectedType=detected_type,
            inferredRole=role,
            missingCount=missing_count,
            missingPercentage=missing_pct,
            uniqueCount=unique_count,
            sampleValues=sample_vals,
            min=min_val,
            max=max_val,
            mean=mean_val
        ))

    return profiles, roles
