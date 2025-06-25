from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class TextScanRequest(BaseModel):
    text: str

# Trigger phrases that often appear in scams
trigger_phrases = [
    "click here to claim",
    "you have won",
    "get rich quick",
    "urgent response needed",
    "free money",
    "limited time offer",
    "claim your prize"
]

# Context words that make the phrase suspicious
dangerous_context = [
    "lottery", "prize", "reward", "money",
    "gift", "iphone", "winner", "free", "cash"
]

@router.post("/text")
def scan_text(data: TextScanRequest):
    lowered = data.text.lower()
    matches = []

    for phrase in trigger_phrases:
        if phrase in lowered:
            for context_word in dangerous_context:
                if context_word in lowered:
                    matches.append(f"{phrase} + {context_word}")

    if matches:
        return {
            "status": "warning",
            "message": "Suspicious combinations found.",
            "matches": matches
        }

    return {
        "status": "safe",
        "message": "No suspicious content detected."
    }
