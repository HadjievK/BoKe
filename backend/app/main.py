"""Main FastAPI application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.routes import onboarding, public, dashboard
from app.database.connection import init_pool

load_dotenv()

app = FastAPI(
    title="BuKe API",
    description="Multi-tenant booking platform for service providers",
    version="1.0.0"
)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database connection pool on startup
@app.on_event("startup")
async def startup_event():
    init_pool()
    print("[OK] Database connection pool initialized")

# Include routers
app.include_router(onboarding.router, prefix="/api", tags=["Onboarding"])
app.include_router(public.router, prefix="/api", tags=["Public Booking"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])


@app.get("/")
async def root():
    return {
        "message": "BuKe API - Multi-tenant booking platform",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
