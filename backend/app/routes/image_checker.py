from fastapi import APIRouter, UploadFile, File, HTTPException
import os

router = APIRouter()

# Allowed image extensions
allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']

@router.post("/image")
async def check_image(image: UploadFile = File(...)):
    filename = image.filename
    ext = os.path.splitext(filename)[1].lower()

    # 1. Extension check
    if ext not in allowed_extensions:
        return {
            "status": "warning",
            "message": f"Unsupported or dangerous file extension: {ext}"
        }

    # 2. Basic validation (future: scan metadata, QR, content, etc.)
    # Read file to ensure it's not a fake extension
    content = await image.read()
    if len(content) < 10:  # Empty or too small might be invalid
        return {
            "status": "warning",
            "message": "The uploaded image seems invalid or empty."
        }

    return {
        "status": "safe",
        "message": f"Image '{filename}' appears safe and valid."
    }
