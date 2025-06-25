from fastapi import APIRouter
from pydantic import BaseModel
from urllib.parse import urlparse

router = APIRouter()

class LinkCheckRequest(BaseModel):
    url: str

suspicious_keywords = [
    "win", "free", "claim", "prize", "money", "verify", "urgent", "reward"
]

@router.post("/link")
def verify_link(data: LinkCheckRequest):
    issues = []

    # Parse the URL
    parsed = urlparse(data.url)

    # Check for http
    if parsed.scheme == "http":
        issues.append("uses http instead of https")

    # Check for suspicious keywords in URL
    for word in suspicious_keywords:
        if word in data.url.lower():
            issues.append(f"contains suspicious keyword: {word}")

    if issues:
        return {
            "status": "warning",
            "message": "Suspicious URL detected.",
            "issues": issues
        }

    return {
        "status": "safe",
        "message": "No issues found."
    }
