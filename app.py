from server.app import app
import os

# This is the main entry point for Render.com deployment
if __name__ == "__main__":
    # Get port from environment variable or use 5000 as default
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)