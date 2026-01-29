from fastapi import APIRouter, UploadFile, File
from .blob_client import upload_pdf
from .config import CONTAINER_ERRORS

router = APIRouter()

@router.post("/upload-error-pdf")
async def upload_error_pdf(file: UploadFile = File(...)):
    pdf_bytes = await file.read()
    upload_pdf(file.filename, pdf_bytes)
    return {"status": "stored"}
