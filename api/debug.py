"""Debug endpoint to check what's wrong"""
from http.server import BaseHTTPRequestHandler
import sys
import json
from pathlib import Path

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Try to import and show debug info
            backend_path = str(Path(__file__).parent.parent / "backend")
            sys.path.insert(0, backend_path)

            info = {
                "backend_path": backend_path,
                "backend_exists": Path(backend_path).exists(),
                "sys_path": sys.path[:5],
            }

            # Try importing
            try:
                from app.main import app
                info["import_success"] = True
                info["app_type"] = str(type(app))
            except Exception as e:
                info["import_success"] = False
                info["import_error"] = str(e)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(info, indent=2).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        return
