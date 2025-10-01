#!/usr/bin/env python3
"""
PantryIQ Backend Startup Script - SIMPLIFIED & WORKING
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    print("=" * 70)
    print("🍳 Starting PantryIQ Backend Server...")
    print("=" * 70)
    print(f"📍 Server: http://{host}:{port}")
    print(f"📚 API Docs: http://{host}:{port}/api/docs")
    print(f"🔄 Debug Mode: {debug}")
    print("=" * 70)
    
    # Use simplified main for reliability
    uvicorn.run(
        "main_simple:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )
