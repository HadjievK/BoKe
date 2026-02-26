import sys
from pathlib import Path

# Add backend to Python path
backend_path = str(Path(__file__).parent.parent / "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import app and create handler
from app.main import app
from mangum import Mangum

handler = Mangum(app, lifespan="off")
