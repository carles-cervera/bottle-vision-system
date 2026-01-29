import os
from azure.storage.blob import BlobServiceClient, ContentSettings
from .config import AZURE_STORAGE_CONNECTION_STRING, CONTAINER_ERRORS

_service_client: BlobServiceClient | None = None


def _get_service_client() -> BlobServiceClient:
    global _service_client
    if _service_client is None:
        if not AZURE_STORAGE_CONNECTION_STRING:
            raise RuntimeError("AZURE_STORAGE_CONNECTION_STRING no está configurada")
        _service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    return _service_client

def read_image_bytes(container: str, blob_name: str) -> bytes:
    blob = _get_service_client().get_blob_client(container=container, blob=blob_name)
    max_concurrency = int(os.getenv("AZURE_BLOB_DOWNLOAD_CONCURRENCY", "4"))
    if max_concurrency < 1:
        max_concurrency = 1
    return blob.download_blob(max_concurrency=max_concurrency).readall()


def upload_pdf(filename: str, pdf_bytes: bytes):
    blob = _get_service_client().get_blob_client(container=CONTAINER_ERRORS, blob=filename)
    blob.upload_blob(pdf_bytes, overwrite=True)


def upload_image_bytes(
    container: str,
    blob_name: str,
    image_bytes: bytes,
    *,
    content_type: str = "application/octet-stream",
):
    """Sube bytes de imagen a un blob.

    Aunque el sistema sea Blob-only, esto evita errores de import y permite
    guardar evidencias (si se usa).
    """
    blob = _get_service_client().get_blob_client(container=container, blob=blob_name)
    blob.upload_blob(
        image_bytes,
        overwrite=True,
        content_settings=ContentSettings(content_type=content_type),
    )

def list_blobs(container: str):
    """
    Devuelve una lista de nombres de blobs en el contenedor dado.
    """
    container_client = _get_service_client().get_container_client(container)
    return [blob.name for blob in container_client.list_blobs()]