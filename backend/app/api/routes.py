from fastapi import APIRouter, UploadFile, File, HTTPException
from ..schemas.models import DatasetAnalysisResultSchema, HealthResponse
from ..services.data_service import DataService

router = APIRouter(prefix="/api", tags=["Merchant Data Analytics"])

@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        service="MerchantMind AI Backend",
        phase="Phase 1: Foundation",
        version="1.0.0"
    )

@router.get("/demo", response_model=DatasetAnalysisResultSchema)
def get_demo_dataset():
    """
    Returns pre-generated UrbanCart synthetic demo dataset with full profiling,
    data quality scoring, and revenue KPIs.
    """
    return DataService.get_demo_dataset()

@router.post("/upload", response_model=DatasetAnalysisResultSchema)
async def upload_dataset(file: UploadFile = File(...)):
    """
    Ingests merchant CSV/XLSX file, runs automated heuristics, quality scoring,
    and revenue analytics without modifying raw file data.
    """
    return await DataService.process_uploaded_file(file)
