from server.app import app
import os

# Configure for both local and production
app.debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

# This is the main entry point for Render.com deployment
if __name__ == "__main__":
    # For local development
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)