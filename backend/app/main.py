"""Main FastAPI application"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import os
import traceback
import sys
from dotenv import load_dotenv

from app.routes import onboarding, public, dashboard

load_dotenv()

app = FastAPI(
    title="BuKe API",
    description="Multi-tenant booking platform for service providers",
    version="1.0.0"
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unhandled exceptions and return JSON"""
    print(f"UNHANDLED EXCEPTION: {str(exc)}", file=sys.stderr)
    print(f"Traceback: {traceback.format_exc()}", file=sys.stderr)

    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Internal server error: {str(exc)}",
            "type": type(exc).__name__
        }
    )

# CORS configuration
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

# Custom CORS middleware to handle Vercel preview deployments
class CustomCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")

        # Check if origin matches allowed origins or Vercel preview domains
        is_allowed = False
        if origin:
            # Check exact matches
            if origin in allowed_origins:
                is_allowed = True
            # Check if it's a Vercel preview deployment
            elif origin.endswith(".vercel.app") and origin.startswith("https://"):
                is_allowed = True

        response = await call_next(request)

        # Add CORS headers if origin is allowed
        if is_allowed and origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"

        # Handle preflight requests
        if request.method == "OPTIONS":
            response.headers["Access-Control-Max-Age"] = "3600"

        return response

# Add custom CORS middleware
app.add_middleware(CustomCORSMiddleware)

# Also add standard CORS middleware as fallback
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
