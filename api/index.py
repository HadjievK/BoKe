"""Vercel Serverless API handler"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import FastAPI app
from app.main import app
from mangum import Mangum

# Create Mangum handler for Vercel serverless
handler = Mangum(app, lifespan="off")
