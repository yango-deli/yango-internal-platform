import hmac
from fastapi import Request, HTTPException
from app.config import settings


async def verify_internal_request(request: Request) -> None:
    """Block requests that don't come from the Next.js server."""
    secret = request.headers.get("X-Internal-Secret", "")
    if not settings.python_internal_secret:
        return  # Dev mode — no secret configured
    if not hmac.compare_digest(secret, settings.python_internal_secret):
        raise HTTPException(status_code=403, detail="Forbidden")
