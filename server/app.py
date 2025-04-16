from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
from utils.ai_color import extract_colors, apply_color_to_image
from flask_cors import CORS

app = Flask(__name__, static_folder='../client/build')
CORS(app)  # Enable CORS for all routes

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Serve React App - Catch-all route to serve the React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# API Routes
@app.route('/api/scan', methods=['POST'])
def scan_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract suggested colors
        suggested_colors = extract_colors(filepath)
        
        return jsonify({
            'success': True, 
            'filename': filename, 
            'filepath': f'/api/uploads/{filename}',
            'suggested_colors': suggested_colors
        })
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/apply-color', methods=['POST'])
def apply_color():
    data = request.json
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], data['filename'])
    color_hex = data['color']
    
    # Process the image with the selected color
    result_filename = f"colored_{data['filename']}"
    result_path = os.path.join(app.config['UPLOAD_FOLDER'], result_filename)
    
    # Apply color to image
    apply_color_to_image(image_path, result_path, color_hex)
    
    return jsonify({
        'success': True,
        'result_path': f'/api/uploads/{result_filename}'
    })

# Serve uploaded files
@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True) 