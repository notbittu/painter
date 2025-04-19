from flask import Flask, send_from_directory, jsonify
from whitenoise import WhiteNoise
import os

# Get the absolute path to the static directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static', 'client', 'build')

app = Flask(__name__, static_folder=STATIC_DIR)
app.wsgi_app = WhiteNoise(app.wsgi_app, root=STATIC_DIR)

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    try:
        if path != "" and os.path.exists(os.path.join(STATIC_DIR, path)):
            return send_from_directory(STATIC_DIR, path)
        else:
            return send_from_directory(STATIC_DIR, 'index.html')
    except Exception as e:
        return jsonify({"error": str(e), "static_dir": STATIC_DIR}), 500

# API endpoint for color detection
@app.route('/api/detect-colors', methods=['POST'])
def detect_colors():
    try:
        # For now, return some sample colors
        # In production, you would implement actual color detection logic
        return jsonify({
            "colors": [
                "#4a6da7",
                "#f50057",
                "#00bcd4",
                "#ff9800",
                "#4caf50"
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Configure for both local and production
app.debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

# This is the main entry point for Render.com deployment
if __name__ == "__main__":
    # For production
    port = int(os.environ.get("PORT", 10000))
    print(f"Static directory path: {STATIC_DIR}")
    print(f"Directory exists: {os.path.exists(STATIC_DIR)}")
    if os.path.exists(STATIC_DIR):
        print(f"Contents of static directory: {os.listdir(STATIC_DIR)}")
    app.run(host="0.0.0.0", port=port, debug=False)