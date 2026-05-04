import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_db, close_db
from app.routers import auth, tenders, payments
from app.config import get_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    await connect_db()
    logger.info("TendrAI backend started")
    yield
    # Shutdown
    await close_db()
    logger.info("TendrAI backend stopped")


app = FastAPI(
    title="TendrAI API",
    description="AI-Powered Tender Documentation & Submission Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]
if settings.FRONTEND_URL:
    allowed_origins.append(settings.FRONTEND_URL.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api")
app.include_router(tenders.router,  prefix="/api")
app.include_router(payments.router, prefix="/api")


# ── Health & Root ─────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok", "service": "tendrai-backend", "db": "mongodb"}


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "TendrAI API is running",
        "docs": "/api/docs",
    }
