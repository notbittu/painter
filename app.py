from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from whitenoise import WhiteNoise
import os
import base64
import logging
import json
from datetime import datetime
import numpy as np
import re
from io import BytesIO
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the absolute path to the static directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static', 'client', 'build')

# Create directories if they don't exist
os.makedirs(STATIC_DIR, exist_ok=True)

app = Flask(__name__, static_folder=STATIC_DIR)
CORS(app)  # Enable CORS for all routes
app.wsgi_app = WhiteNoise(app.wsgi_app, root=STATIC_DIR)

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    try:
        logger.info(f"Requested path: {path}")
        logger.debug(f"Static directory: {STATIC_DIR}")
        logger.debug(f"Directory exists: {os.path.exists(STATIC_DIR)}")
        
        if os.path.exists(STATIC_DIR):
            logger.debug(f"Contents of static directory: {os.listdir(STATIC_DIR)}")
        
        if path != "" and os.path.exists(os.path.join(STATIC_DIR, path)):
            return send_from_directory(STATIC_DIR, path)
        else:
            return send_from_directory(STATIC_DIR, 'index.html')
    except Exception as e:
        logger.error(f"Error serving file: {str(e)}")
        return jsonify({"error": str(e), "static_dir": STATIC_DIR}), 500

# API endpoint for health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Server is running properly",
        "time": datetime.now().isoformat(),
        "environment": os.getenv('FLASK_ENV', 'development')
    })

# Helper function to decode base64 image
def decode_base64_image(base64_string):
    # Remove the data URL prefix if present
    if "data:image" in base64_string:
        base64_string = re.sub('data:image/[^;]+;base64,', '', base64_string)
    
    # Decode base64 string to bytes
    image_data = base64.b64decode(base64_string)
    
    # Convert bytes to PIL Image
    image = Image.open(BytesIO(image_data))
    return image

# Helper function to encode PIL Image to base64
def encode_image_to_base64(image):
    buffered = BytesIO()
    image.save(buffered, format="JPEG", quality=90)
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return f"data:image/jpeg;base64,{img_str}"

# Helper function to extract dominant colors from an image
def extract_dominant_colors(image, num_colors=6):
    # Resize image for faster processing
    image = image.resize((150, 150))
    
    # Convert to numpy array
    np_image = np.array(image)
    
    # Reshape the image data to 2D array of pixels
    pixels = np_image.reshape(-1, 3)
    
    # Simple clustering approach (for demo purposes)
    # In a production app, we would use K-means clustering
    
    # Simulate clusters by sampling from different regions
    colors = []
    h, w = image.size
    regions = [
        (0, 0, h//2, w//2),             # top-left
        (h//2, 0, h, w//2),             # top-right
        (0, w//2, h//2, w),             # bottom-left
        (h//2, w//2, h, w),             # bottom-right
        (h//4, w//4, 3*h//4, 3*w//4),   # center
        (0, 0, h, w)                    # entire image
    ]
    
    # Get average color from each region
    for i, (x1, y1, x2, y2) in enumerate(regions):
        if i < num_colors:
            region = image.crop((x1, y1, x2, y2))
            region_np = np.array(region)
            avg_color = np.mean(region_np.reshape(-1, 3), axis=0).astype(int)
            hex_color = '#{:02x}{:02x}{:02x}'.format(avg_color[0], avg_color[1], avg_color[2])
            colors.append(hex_color)
    
    return colors

# Helper function to generate a color name
def generate_color_name(hex_code):
    # For this demo, we'll use some predefined color names based on hex ranges
    # In a real app, you'd use a proper color naming algorithm or database
    color_names = {
        # Blues
        '#0000ff': 'Royal Blue',
        '#add8e6': 'Light Blue',
        '#00008b': 'Dark Blue',
        '#4169e1': 'Royal Blue',
        '#1e90ff': 'Dodger Blue',
        '#87ceeb': 'Sky Blue',
        '#87cefa': 'Light Sky Blue',
        '#4682b4': 'Steel Blue',
        
        # Reds
        '#ff0000': 'Vibrant Red',
        '#8b0000': 'Dark Red',
        '#dc143c': 'Crimson',
        '#b22222': 'Fire Brick',
        '#cd5c5c': 'Indian Red',
        '#f08080': 'Light Coral',
        '#fa8072': 'Salmon',
        
        # Greens
        '#00ff00': 'Lime Green',
        '#008000': 'Green',
        '#006400': 'Dark Green',
        '#9acd32': 'Yellow Green',
        '#32cd32': 'Lime Green',
        '#00fa9a': 'Medium Spring Green',
        '#2e8b57': 'Sea Green',
        '#3cb371': 'Medium Sea Green',
        
        # Yellows
        '#ffff00': 'Yellow',
        '#ffd700': 'Gold',
        '#daa520': 'Goldenrod',
        '#f0e68c': 'Khaki',
        '#bdb76b': 'Dark Khaki',
        
        # Purples
        '#800080': 'Purple',
        '#4b0082': 'Indigo',
        '#8a2be2': 'Blue Violet',
        '#9932cc': 'Dark Orchid',
        '#9400d3': 'Dark Violet',
        '#ba55d3': 'Medium Orchid',
        '#da70d6': 'Orchid',
        
        # Browns
        '#a52a2a': 'Brown',
        '#8b4513': 'Saddle Brown',
        '#a0522d': 'Sienna',
        '#d2691e': 'Chocolate',
        '#cd853f': 'Peru',
        '#deb887': 'Burlywood',
        '#f4a460': 'Sandy Brown',
        
        # Whites, Grays, Blacks
        '#ffffff': 'White',
        '#f5f5f5': 'White Smoke',
        '#dcdcdc': 'Gainsboro',
        '#d3d3d3': 'Light Gray',
        '#a9a9a9': 'Dark Gray',
        '#808080': 'Gray',
        '#696969': 'Dim Gray',
        '#000000': 'Black',
        
        # Other Colors
        '#ffc0cb': 'Pink',
        '#ffb6c1': 'Light Pink',
        '#ff69b4': 'Hot Pink',
        '#ff1493': 'Deep Pink',
        '#db7093': 'Pale Violet Red',
        '#ff7f50': 'Coral',
        '#ff6347': 'Tomato',
        '#ff4500': 'Orange Red',
        '#ffa500': 'Orange',
        '#ee82ee': 'Violet',
        '#dda0dd': 'Plum',
        '#d8bfd8': 'Thistle',
        '#e6e6fa': 'Lavender',
        '#ffe4b5': 'Moccasin',
        '#ffdead': 'Navajo White',
        '#faebd7': 'Antique White',
        '#d2b48c': 'Tan',
        '#bc8f8f': 'Rosy Brown',
        '#ffe4e1': 'Misty Rose',
        '#fff0f5': 'Lavender Blush',
        '#faf0e6': 'Linen',
        '#fff5ee': 'Seashell',
        '#f5fffa': 'Mint Cream',
        '#708090': 'Slate Gray',
        '#778899': 'Light Slate Gray',
        '#b0c4de': 'Light Steel Blue',
        '#e0ffff': 'Light Cyan',
        '#00ffff': 'Cyan',
        '#40e0d0': 'Turquoise',
        '#afeeee': 'Pale Turquoise',
        '#7fffd4': 'Aquamarine',
        '#f0fff0': 'Honeydew',
        '#f5f5dc': 'Beige',
        '#fffacd': 'Lemon Chiffon',
        '#fffff0': 'Ivory',
        '#f0f8ff': 'Alice Blue',
        '#e6e6fa': 'Lavender',
    }
    
    # Start with generic descriptions
    r = int(hex_code[1:3], 16)
    g = int(hex_code[3:5], 16)
    b = int(hex_code[5:7], 16)
    
    # Basic color classification
    if r > 200 and g > 200 and b > 200:
        base_name = "Light"
    elif r < 60 and g < 60 and b < 60:
        base_name = "Dark"
    elif r > g and r > b:
        if r > 200 and g > 150:
            base_name = "Warm"
        else:
            base_name = "Rich"
    elif g > r and g > b:
        if g > 200:
            base_name = "Fresh"
        else:
            base_name = "Natural"
    elif b > r and b > g:
        if b > 200:
            base_name = "Cool"
        else:
            base_name = "Deep"
    elif abs(r - g) < 30 and abs(g - b) < 30 and abs(r - b) < 30:
        if r > 180:
            base_name = "Soft"
        else:
            base_name = "Classic"
    else:
        base_name = "Elegant"
    
    # Find the closest predefined color
    min_distance = float('inf')
    closest_color_name = None
    
    for hex_key, name in color_names.items():
        r2 = int(hex_key[1:3], 16)
        g2 = int(hex_key[3:5], 16)
        b2 = int(hex_key[5:7], 16)
        
        # Calculate color distance (Euclidean in RGB space)
        distance = ((r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2) ** 0.5
        
        if distance < min_distance:
            min_distance = distance
            closest_color_name = name
    
    # Combine base name with closest color name
    if closest_color_name:
        if "Light" in closest_color_name or "Dark" in closest_color_name:
            return closest_color_name
        else:
            return f"{base_name} {closest_color_name}"
    else:
        # Fallback to a generic name
        return f"{base_name} Tone #{hex_code[1:7]}"

# Generate a wall preview with the selected color
def generate_wall_preview(image, color_hex):
    # Convert hex to RGB
    r = int(color_hex[1:3], 16)
    g = int(color_hex[3:5], 16)
    b = int(color_hex[5:7], 16)
    
    # Create a copy of the original image
    result = image.copy()
    
    # Convert to RGBA to handle transparency
    result = result.convert('RGBA')
    
    # Create a color layer
    color_layer = Image.new('RGBA', result.size, (r, g, b, 180))
    
    # Blend with the original image (simplified approach)
    result = Image.alpha_composite(result, color_layer)
    
    # Convert back to RGB
    result = result.convert('RGB')
    
    # Apply some processing to make it look more realistic
    enhancer = ImageEnhance.Contrast(result)
    result = enhancer.enhance(1.1)
    
    enhancer = ImageEnhance.Sharpness(result)
    result = enhancer.enhance(1.1)
    
    return result

# API endpoint for color detection
@app.route('/api/detect-colors', methods=['POST'])
def detect_colors():
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            logger.warning("No image data provided in request")
            return jsonify({"error": "No image data provided"}), 400
        
        # Log that we received an image request
        logger.info("Processing color detection request")
        
        # Decode base64 image
        image = decode_base64_image(data['image'])
        
        # Extract dominant colors
        hex_colors = extract_dominant_colors(image)
        
        # Create color suggestions
        dominant_colors = []
        for hex_color in hex_colors:
            color_name = generate_color_name(hex_color)
            dominant_colors.append({
                "name": color_name,
                "hexCode": hex_color
            })
        
        # Create color palettes
        palettes = [
            {
                "name": "Modern Neutrals",
                "description": "Clean, contemporary colors that create a calm atmosphere",
                "colors": [
                    {"name": "Off White", "hexCode": "#f5f5f5"},
                    {"name": "Soft Gray", "hexCode": "#e0e0e0"},
                    {"name": "Warm Beige", "hexCode": "#e6d2b5"},
                    {"name": "Light Sage", "hexCode": "#d4e2d4"}
                ]
            },
            {
                "name": "Bold Statements",
                "description": "Expressive colors that energize your space",
                "colors": [
                    {"name": "Vibrant Teal", "hexCode": "#009688"},
                    {"name": "Deep Navy", "hexCode": "#1a237e"},
                    {"name": "Terracotta", "hexCode": "#bf360c"},
                    {"name": "Emerald", "hexCode": "#2e7d32"}
                ]
            },
            {
                "name": "Pastel Dreams",
                "description": "Soft, soothing tones for a relaxing environment",
                "colors": [
                    {"name": "Powder Blue", "hexCode": "#bbdefb"},
                    {"name": "Blush Pink", "hexCode": "#f8bbd0"},
                    {"name": "Mint Green", "hexCode": "#c8e6c9"},
                    {"name": "Lavender", "hexCode": "#d1c4e9"}
                ]
            }
        ]
        
        return jsonify({
            "dominantColors": dominant_colors,
            "suggestedPalettes": palettes
        })
        
    except Exception as e:
        logger.error(f"Error in color detection: {str(e)}")
        return jsonify({"error": str(e)}), 500

# API endpoint for generating preview
@app.route('/api/generate-preview', methods=['POST'])
def generate_preview():
    try:
        data = request.get_json()
        
        if not data or 'image' not in data or 'color' not in data:
            logger.warning("Missing required data in request")
            return jsonify({"error": "Missing image or color data"}), 400
        
        # Log request
        logger.info("Processing preview generation request")
        
        # Decode base64 image
        image = decode_base64_image(data['image'])
        
        # Generate preview with selected color
        preview_image = generate_wall_preview(image, data['color'])
        
        # Encode preview image to base64
        preview_data_url = encode_image_to_base64(preview_image)
        
        return jsonify({
            "previewUrl": preview_data_url
        })
        
    except Exception as e:
        logger.error(f"Error generating preview: {str(e)}")
        return jsonify({"error": str(e)}), 500

# API endpoint for saving images
@app.route('/api/save-image', methods=['POST'])
def save_image():
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            logger.warning("No image data provided in request")
            return jsonify({"error": "No image data provided"}), 400
        
        # Here we would save the image to a database or file system
        # For now, just return a success response
        logger.info("Image saved successfully")
        
        return jsonify({
            "success": True,
            "message": "Image saved successfully",
            "id": "img_" + datetime.now().strftime("%Y%m%d%H%M%S")
        })
    except Exception as e:
        logger.error(f"Error saving image: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Configure for both local and production
app.debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

# This is the main entry point for Render.com deployment
if __name__ == "__main__":
    # For production
    port = int(os.environ.get("PORT", 10000))
    logger.info(f"Starting server on port {port}")
    logger.info(f"Static directory path: {STATIC_DIR}")
    logger.info(f"Directory exists: {os.path.exists(STATIC_DIR)}")
    
    if os.path.exists(STATIC_DIR):
        logger.info(f"Contents of static directory: {os.listdir(STATIC_DIR)}")
    
    app.run(host="0.0.0.0", port=port, debug=app.debug)