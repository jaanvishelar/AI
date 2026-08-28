import pandas as pd
from typing import List
from ..schemas.models import CleaningSuggestionSchema, ColumnProfileSchema, QualityScoreSchema

def generate_cleaning_recommendations(
    df: pd.DataFrame, 
    profiles: List[ColumnProfileSchema], 
    quality: QualityScoreSchema
) -> List[CleaningSuggestionSchema]:
    suggestions: List[CleaningSuggestionSchema] = []

    # 1. Missing Values
    missing_cols = [p for p in profiles if p.missingCount > 0]
    if missing_cols:
        total_missing = sum(p.missingCount for p in missing_cols)
        suggestions.append(CleaningSuggestionSchema(
            id="missing_values_rule",
            type="missing_values",
            title="Missing Values in Dataset",
            description=f"Detected missing values in {len(missing_cols)} column(s): {', '.join([f'{c.name} ({c.missingCount})' for c in missing_cols])}.",
            severity="high" if any(c.missingPercentage > 15 for c in missing_cols) else "medium",
            affectedColumns=[c.name for c in missing_cols],
            affectedCount=total_missing,
            recommendedAction="Impute missing numeric values with median/mean or label categorical fields as 'Unspecified'. Original source files remain untouched."
        ))

    # 2. Duplicate Records
    if quality.breakdown.duplicateRowCount > 0:
        suggestions.append(CleaningSuggestionSchema(
            id="duplicate_records_rule",
            type="duplicate_rows",
            title="Duplicate Transaction Rows",
            description=f"Found {quality.breakdown.duplicateRowCount} duplicate transaction rows matching existing identifiers.",
            severity="high" if quality.breakdown.duplicateRowCount > 20 else "medium",
            affectedCount=quality.breakdown.duplicateRowCount,
            recommendedAction="Flag duplicate transactions to prevent revenue over-counting during downstream ML modeling."
        ))

    # 3. Invalid / Negative Prices
    monetary_cols = [p for p in profiles if p.inferredRole == 'monetary']
    invalid_prices = 0
    for p in monetary_cols:
        series = pd.to_numeric(df[p.name], errors='coerce')
        invalid_prices += int((series <= 0).sum())

    if invalid_prices > 0:
        suggestions.append(CleaningSuggestionSchema(
            id="invalid_price_rule",
            type="invalid_prices",
            title="Potentially Invalid Prices or Zero Values",
            description=f"Found {invalid_prices} record(s) where transaction price is zero or negative.",
            severity="medium",
            affectedColumns=[p.name for p in monetary_cols],
            affectedCount=invalid_prices,
            recommendedAction="Isolate zero or negative values as special returns/adjustments."
        ))

    return suggestions
