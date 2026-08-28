import pandas as pd
import numpy as np
from typing import List
from ..schemas.models import QualityScoreSchema, QualityBreakdownSchema, ColumnProfileSchema

def calculate_dataset_quality_score(df: pd.DataFrame, profiles: List[ColumnProfileSchema]) -> QualityScoreSchema:
    total_rows = len(df)
    total_cols = len(df.columns)
    total_cells = max(1, total_rows * total_cols)

    if total_rows == 0 or total_cols == 0:
        return QualityScoreSchema(
            score=0,
            grade="Needs Attention",
            breakdown=QualityBreakdownSchema(
                missingValuesPct=0,
                duplicateRowsPct=0,
                invalidValuesPct=0,
                completeValuesPct=0,
                totalCells=0,
                missingCells=0,
                duplicateRowCount=0,
                invalidCellsCount=0
            )
        )

    # 1. Missing cells
    missing_cells = int(df.isna().sum().sum())

    # 2. Duplicate rows
    duplicate_rows_count = int(df.duplicated().sum())

    # 3. Invalid cells (negative prices or corrupt values)
    invalid_cells_count = 0
    for p in profiles:
        if p.detectedType == 'numerical' and p.inferredRole in ('monetary', 'quantity'):
            series = pd.to_numeric(df[p.name], errors='coerce')
            invalid_cells_count += int((series < 0).sum())

    missing_pct = round((missing_cells / total_cells) * 100, 1)
    dup_pct = round((duplicate_rows_count / max(1, total_rows)) * 100, 1)
    invalid_pct = round((invalid_cells_count / total_cells) * 100, 1)
    complete_pct = max(0.0, round(100.0 - missing_pct - dup_pct - invalid_pct, 1))

    # Weight deductions
    missing_penalty = min(35.0, (missing_cells / total_cells) * 100 * 1.5)
    dup_penalty = min(30.0, (duplicate_rows_count / max(1, total_rows)) * 100 * 1.8)
    invalid_penalty = min(25.0, (invalid_cells_count / total_cells) * 100 * 3.0)

    raw_score = int(round(100.0 - missing_penalty - dup_penalty - invalid_penalty))
    raw_score = max(0, min(100, raw_score))

    grade = "Needs Attention"
    if raw_score >= 90:
        grade = "Excellent"
    elif raw_score >= 75:
        grade = "Good"
    elif raw_score >= 60:
        grade = "Fair"

    return QualityScoreSchema(
        score=raw_score,
        grade=grade,
        breakdown=QualityBreakdownSchema(
            missingValuesPct=missing_pct,
            duplicateRowsPct=dup_pct,
            invalidValuesPct=invalid_pct,
            completeValuesPct=complete_pct,
            totalCells=total_cells,
            missingCells=missing_cells,
            duplicateRowCount=duplicate_rows_count,
            invalidCellsCount=invalid_cells_count
        )
    )
