from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from pyzbar.pyzbar import decode

router = APIRouter()

@router.post("/scan/qr")
async def scan_qr_code(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        decoded_objs = decode(img)
        if not decoded_objs:
            return JSONResponse(status_code=400, content={"status": "error", "message": "No QR code found"})

        qr_data = decoded_objs[0].data.decode("utf-8")
        return {"status": "success", "message": "QR code scanned", "data": qr_data}

    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})
