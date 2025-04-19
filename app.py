from flask import Flask, send_from_directory
from whitenoise import WhiteNoise
import os

app = Flask(__name__, static_folder='static/client/build')
app.wsgi_app = WhiteNoise(app.wsgi_app, root='static/client/build')

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Configure for both local and production
app.debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

# This is the main entry point for Render.com deployment
if __name__ == "__main__":
    # For production
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)