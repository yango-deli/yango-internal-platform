from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.simulate import router as simulate_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Supplier Promo Simulation API",
    version="1.0.0",
    docs_url="/docs",  # Disable in prod by setting to None
)

# Only allow the Next.js container — adjust in prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://nextjs:3000", "http://localhost:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(simulate_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
