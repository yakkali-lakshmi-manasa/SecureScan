from fastapi import APIRouter, UploadFile, File
import os

router = APIRouter()

blocked_extensions = ['.exe', '.bat', '.vbs', '.js', '.sh', '.cmd']

@router.post("/file")
async def scan_file(file: UploadFile = File(...)):
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()

    # Rule 1: Blocked extension
    if ext in blocked_extensions:
        return {
            "status": "warning",
            "message": f"File '{filename}' has a dangerous extension: {ext}"
        }

    # Rule 2: Optional content scan for text files
    if ext in ['.txt']:
        content = await file.read()
        content = content.decode('utf-8', errors='ignore').lower()
        if "virus" in content or "malware" in content:
            return {
                "status": "warning",
                "message": "Suspicious keywords found in file content."
            }

    return {
        "status": "safe",
        "message": f"File '{filename}' appears to be safe."
    }
