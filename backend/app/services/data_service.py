import io
from datetime import datetime
import pandas as pd
import numpy as np
from typing import Optional
from fastapi import UploadFile, HTTPException

from ..schemas.models import DatasetAnalysisResultSchema
from ..analytics.heuristics import profile_dataset_columns
from ..analytics.quality import calculate_dataset_quality_score
from ..analytics.cleaning import generate_cleaning_recommendations
from ..analytics.metrics import calculate_kpis_and_charts
from ..utils.synthetic_generator import generate_urbancart_dataframe

class DataService:
    @staticmethod
    def analyze_dataframe(df: pd.DataFrame, dataset_name: str, is_demo: bool = False, file_size: Optional[int] = None) -> DatasetAnalysisResultSchema:
        if len(df) == 0:
            raise HTTPException(status_code=400, detail="The dataset contains 0 rows.")

        profiles, roles = profile_dataset_columns(df)
        quality = calculate_dataset_quality_score(df, profiles)
        suggestions = generate_cleaning_recommendations(df, profiles, quality)
        kpis, charts = calculate_kpis_and_charts(df, roles)

        # Convert first 100 rows to JSON-safe dictionary
        sample_df = df.head(100).replace({np.nan: None})
        sample_rows = sample_df.to_dict(orient="records")

        return DatasetAnalysisResultSchema(
            datasetName=dataset_name,
            isDemo=is_demo,
            uploadedAt=datetime.utcnow().isoformat(),
            fileSizeBytes=file_size,
            rowCount=len(df),
            columnCount=len(df.columns),
            columns=profiles,
            inferredRoles=roles,
            qualityScore=quality,
            cleaningSuggestions=suggestions,
            kpis=kpis,
            charts=charts,
            sampleRows=sample_rows
        )

    @classmethod
    async def process_uploaded_file(cls, file: UploadFile) -> DatasetAnalysisResultSchema:
        # Validate extension
        filename = file.filename or "uploaded_dataset"
        ext = filename.split(".")[-1].lower()
        if ext not in ["csv", "xlsx", "xls"]:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a .csv or .xlsx file.")

        contents = await file.read()
        file_size = len(contents)
        if file_size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File exceeds maximum size of 10 MB.")
        if file_size == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

        try:
            if ext == "csv":
                df = pd.read_csv(io.BytesIO(contents))
            else:
                df = pd.read_excel(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read tabular file: {str(e)}")

        return cls.analyze_dataframe(df, filename, is_demo=False, file_size=file_size)

    @classmethod
    def get_demo_dataset(cls) -> DatasetAnalysisResultSchema:
        df = generate_urbancart_dataframe()
        return cls.analyze_dataframe(df, "UrbanCart_Synthetic_Demo_Q1_Q2_2025.csv", is_demo=True)
