from fastapi import FastAPI
from app.routes import text_scan
from app.routes import link_verifier
from app.routes import file_scanner
from app.routes import image_checker
from app.routes import qr_scanner




app = FastAPI(
    title="SecureScan Backend",
    description="Smart Security Tool - API for scanning text, files, images, links, and more.",
    version="1.0.0"
)

# Include routers
app.include_router(text_scan.router, prefix="/scan", tags=["Text Scanner"])
app.include_router(link_verifier.router, prefix="/scan", tags=["Link Verifier"])
app.include_router(file_scanner.router, prefix="/scan", tags=["File Scanner"])
app.include_router(image_checker.router, prefix="/scan", tags=["Image Checker"])
app.include_router(qr_scanner.router , prefix="/scan", tags=["QR Scanner"])


@app.get("/")
def read_root():
    return {"message": "Welcome to SecureScan Backend!"}
