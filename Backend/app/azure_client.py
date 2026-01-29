# app/azure_client.py
import os
import requests

AZURE_ML_ENDPOINT_LEVEL = "https://nivell-classifier-endpoint.spaincentral.inference.ml.azure.com/score"
AZURE_ML_ENDPOINT_TAP = "https://tap-classifier-endpoint.spaincentral.inference.ml.azure.com/score"

def predict_level_from_bytes_azure(image_bytes: bytes):
    AZURE_ML_KEY = os.getenv("AZURE_ML_KEY_LEVEL")  

    if not AZURE_ML_KEY:
        raise RuntimeError("No s'ha definit la variable d'entorn AZURE_ML_KEY")

    payload = {
        "image": image_bytes.hex()
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {AZURE_ML_KEY}",
    }

    response = requests.post(AZURE_ML_ENDPOINT_LEVEL, headers=headers, json=payload)
    response.raise_for_status()
    result = response.json()

    label = result.get("class")
    confidence = result.get("confidence")

    if label is None:
        raise ValueError(f"Resposta d'Azure ML inesperada: {result}")

    return label, confidence


def predict_tap_from_bytes_azure(image_bytes: bytes):
    AZURE_ML_KEY = os.getenv("AZURE_ML_KEY_TAP")

    if not AZURE_ML_KEY:
        raise RuntimeError("No s'ha definit la variable d'entorn AZURE_ML_KEY")

    payload = {
        "image": image_bytes.hex()
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {AZURE_ML_KEY}",
    }

    response = requests.post(AZURE_ML_ENDPOINT_TAP, headers=headers, json=payload)
    response.raise_for_status()
    result = response.json()

    label = result.get("class")
    confidence = result.get("confidence")

    if label is None:
        raise ValueError(f"Resposta d'Azure ML inesperada: {result}")

    return label, confidence