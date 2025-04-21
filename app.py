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

# Enhanced functions for new features
def apply_shadow_tracking(image, mask=None):
    """
    Apply shadow tracking to maintain lighting variations in the wall.
    Creates or uses a mask to identify shadow areas.
    """
    try:
        # Convert image to grayscale to detect shadows
        gray_image = image.convert('L')
        
        # Create a shadow mask if not provided
        if mask is None:
            # Enhance contrast to better identify shadows
            contrast = ImageEnhance.Contrast(gray_image)
            high_contrast = contrast.enhance(2.0)
            
            # Apply threshold to create mask
            threshold = 128  # Adjust based on lighting
            mask = high_contrast.point(lambda x: 0 if x < threshold else 255, '1')
            
            # Smoothen the mask
            mask = mask.filter(ImageFilter.GaussianBlur(radius=3))
        
        return mask
    except Exception as e:
        logger.error(f"Error in shadow tracking: {str(e)}")
        # Return a basic mask if error occurs
        return Image.new('L', image.size, 255)

def apply_nfd_vision360(image, color_hex):
    """
    Apply NFD Vision 360 - enhanced depth perception for more realistic rendering.
    Creates a gradient effect based on estimated depth.
    """
    try:
        # Convert hex to RGB
        r = int(color_hex[1:3], 16)
        g = int(color_hex[3:5], 16)
        b = int(color_hex[5:7], 16)
        
        # Create a copy of the original image
        result = image.copy()
        
        # Get image dimensions
        width, height = image.size
        
        # Create gradient mask for depth effect
        gradient = Image.new('L', (width, height), 0)
        draw = ImageDraw.Draw(gradient)
        
        # Draw a radial gradient (simple depth simulation)
        center_x, center_y = width // 2, height // 2
        max_distance = (width**2 + height**2)**0.5 // 2
        
        for y in range(height):
            for x in range(width):
                # Calculate distance from center (normalized)
                distance = ((x - center_x)**2 + (y - center_y)**2)**0.5 / max_distance
                # Map distance to brightness (closer = brighter)
                brightness = int(255 * (1 - distance * 0.5))
                gradient.putpixel((x, y), brightness)
        
        # Apply gradient to create depth effect
        pixels = result.load()
        gradient_pixels = gradient.load()
        
        for y in range(height):
            for x in range(width):
                # Get current pixel color
                pixel = pixels[x, y]
                # Get gradient value (0-255)
                depth = gradient_pixels[x, y] / 255.0
                
                # Adjust color based on depth
                adjusted_r = int(r * (0.7 + depth * 0.3))
                adjusted_g = int(g * (0.7 + depth * 0.3))
                adjusted_b = int(b * (0.7 + depth * 0.3))
                
                # Set new pixel color
                pixels[x, y] = (
                    min(255, adjusted_r),
                    min(255, adjusted_g),
                    min(255, adjusted_b),
                    255 if len(pixel) > 3 else 255
                )
        
        return result
    except Exception as e:
        logger.error(f"Error in NFD Vision 360: {str(e)}")
        # Return the original image if error occurs
        return image

def apply_realistic_blending(image, color_image, blend_mode='normal'):
    """
    Apply realistic blending between the wall image and the color.
    Simulates how paint would interact with the wall texture.
    """
    try:
        # Make sure images are the same size and mode
        if image.size != color_image.size:
            color_image = color_image.resize(image.size)
        
        # Convert to RGBA if not already
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        if color_image.mode != 'RGBA':
            color_image = color_image.convert('RGBA')
        
        # Create result image
        result = Image.new('RGBA', image.size)
        
        # Get pixel data
        img_pixels = image.load()
        color_pixels = color_image.load()
        result_pixels = result.load()
        
        width, height = image.size
        
        # Apply different blend modes
        for y in range(height):
            for x in range(width):
                # Get pixel values
                img_pixel = img_pixels[x, y]
                color_pixel = color_pixels[x, y]
                
                # Apply blend mode
                if blend_mode == 'multiply':
                    # Multiply blend mode
                    r = (img_pixel[0] * color_pixel[0]) // 255
                    g = (img_pixel[1] * color_pixel[1]) // 255
                    b = (img_pixel[2] * color_pixel[2]) // 255
                elif blend_mode == 'screen':
                    # Screen blend mode
                    r = 255 - ((255 - img_pixel[0]) * (255 - color_pixel[0]) // 255)
                    g = 255 - ((255 - img_pixel[1]) * (255 - color_pixel[1]) // 255)
                    b = 255 - ((255 - img_pixel[2]) * (255 - color_pixel[2]) // 255)
                elif blend_mode == 'overlay':
                    # Overlay blend mode
                    r = (2 * img_pixel[0] * color_pixel[0] // 255) if img_pixel[0] < 128 else (255 - 2 * (255 - img_pixel[0]) * (255 - color_pixel[0]) // 255)
                    g = (2 * img_pixel[1] * color_pixel[1] // 255) if img_pixel[1] < 128 else (255 - 2 * (255 - img_pixel[1]) * (255 - color_pixel[1]) // 255)
                    b = (2 * img_pixel[2] * color_pixel[2] // 255) if img_pixel[2] < 128 else (255 - 2 * (255 - img_pixel[2]) * (255 - color_pixel[2]) // 255)
                else:
                    # Normal blend mode (default)
                    alpha = color_pixel[3] / 255.0
                    r = int(color_pixel[0] * alpha + img_pixel[0] * (1 - alpha))
                    g = int(color_pixel[1] * alpha + img_pixel[1] * (1 - alpha))
                    b = int(color_pixel[2] * alpha + img_pixel[2] * (1 - alpha))
                
                # Set result pixel
                a = max(img_pixel[3], color_pixel[3])
                result_pixels[x, y] = (r, g, b, a)
        
        return result
    except Exception as e:
        logger.error(f"Error in realistic blending: {str(e)}")
        # Return color image if error occurs
        return color_image

# Enhanced wall preview function
def generate_enhanced_wall_preview(image, color_hex, options=None):
    """
    Generate an enhanced preview of the wall with the selected color,
    incorporating shadow tracking, NFD Vision 360, and realistic blending.
    """
    try:
        # Set default options if none provided
        if options is None:
            options = {
                'intensity': 1.0,
                'finish': 'matte',
                'texture': True,
                'lighting': 'natural',
                'blendMode': 'normal',
                'shadowTracking': False,
                'vision360': False,
                'realisticBlending': True
            }
        
        # Convert hex to RGB
        r = int(color_hex[1:3], 16)
        g = int(color_hex[3:5], 16)
        b = int(color_hex[5:7], 16)
        
        # Apply intensity adjustment
        intensity = float(options.get('intensity', 1.0))
        r = min(255, int(r * intensity))
        g = min(255, int(g * intensity))
        b = min(255, int(b * intensity))
        
        # Create a solid color image
        color_image = Image.new('RGBA', image.size, (r, g, b, 255))
        
        # Apply finish effect
        finish = options.get('finish', 'matte')
        
        if finish == 'high-gloss':
            # Add shine effect for glossy finish
            shine = Image.new('RGBA', image.size, (255, 255, 255, 0))
            draw = ImageDraw.Draw(shine)
            width, height = shine.size
            # Draw highlight
            for y in range(height):
                alpha = int(255 * (1 - abs(y - height/3) / (height/2)))
                if alpha > 0:
                    draw.line([(0, y), (width, y)], fill=(255, 255, 255, alpha))
            
            # Blend shine with color
            color_image = Image.alpha_composite(color_image, shine)
        elif finish == 'semi-gloss':
            # Add subtle shine for semi-gloss
            brightness = ImageEnhance.Brightness(color_image)
            color_image = brightness.enhance(1.1)
        elif finish in ['satin', 'eggshell']:
            # Add subtle texture for satin/eggshell
            brightness = ImageEnhance.Brightness(color_image)
            color_image = brightness.enhance(1.05)
        elif finish == 'metallic':
            # Add metallic effect
            metallic = Image.new('RGBA', image.size, (255, 255, 255, 0))
            draw = ImageDraw.Draw(metallic)
            width, height = metallic.size
            
            # Create metallic gradient
            for y in range(height):
                for x in range(width):
                    # Create a pattern that simulates metallic reflection
                    reflection = (x + y) % 20
                    alpha = int(30 * (reflection / 20))
                    if alpha > 0:
                        metallic.putpixel((x, y), (255, 255, 255, alpha))
            
            # Blend metallic with color
            color_image = Image.alpha_composite(color_image, metallic)
        
        # Create a copy of the original image
        result = image.copy().convert('RGBA')
        
        # Apply features based on options
        shadow_mask = None
        
        # Apply shadow tracking if enabled
        if options.get('shadowTracking', False):
            shadow_mask = apply_shadow_tracking(image)
            
            # Use shadow mask to modify the color intensity
            color_pixels = color_image.load()
            mask_pixels = shadow_mask.load()
            width, height = image.size
            
            for y in range(height):
                for x in range(width):
                    # Get shadow value (0-255)
                    shadow_val = mask_pixels[x, y]
                    # Apply shadow to color (darker where shadow is)
                    pixel = color_pixels[x, y]
                    shadow_factor = shadow_val / 255.0
                    # Adjust RGB values based on shadow
                    new_r = int(pixel[0] * shadow_factor)
                    new_g = int(pixel[1] * shadow_factor)
                    new_b = int(pixel[2] * shadow_factor)
                    color_pixels[x, y] = (new_r, new_g, new_b, pixel[3])
        
        # Apply NFD Vision 360 if enabled
        if options.get('vision360', False):
            color_image = apply_nfd_vision360(color_image, color_hex)
        
        # Apply realistic blending if enabled
        if options.get('realisticBlending', True):
            result = apply_realistic_blending(
                result, 
                color_image, 
                options.get('blendMode', 'normal')
            )
        else:
            # Simple alpha compositing if realistic blending is disabled
            result = Image.alpha_composite(result, color_image)
        
        # Apply lighting effect
        lighting = options.get('lighting', 'natural')
        
        if lighting == 'warm':
            # Add warm tone
            enhancer = ImageEnhance.Color(result)
            result = enhancer.enhance(1.1)
            # Add slight yellow tint
            yellow_overlay = Image.new('RGBA', result.size, (255, 255, 200, 30))
            result = Image.alpha_composite(result, yellow_overlay)
        elif lighting == 'cool':
            # Add cool tone
            enhancer = ImageEnhance.Color(result)
            result = enhancer.enhance(0.9)
            # Add slight blue tint
            blue_overlay = Image.new('RGBA', result.size, (200, 200, 255, 30))
            result = Image.alpha_composite(result, blue_overlay)
        elif lighting == 'bright':
            # Brighten the image
            enhancer = ImageEnhance.Brightness(result)
            result = enhancer.enhance(1.2)
        elif lighting == 'dim':
            # Dim the image
            enhancer = ImageEnhance.Brightness(result)
            result = enhancer.enhance(0.8)
        elif lighting == 'evening':
            # Evening lighting (warm but dimmer)
            enhancer = ImageEnhance.Brightness(result)
            dimmed = enhancer.enhance(0.85)
            orange_overlay = Image.new('RGBA', result.size, (255, 200, 150, 40))
            result = Image.alpha_composite(dimmed, orange_overlay)
        elif lighting == 'morning':
            # Morning lighting (cooler, bright)
            enhancer = ImageEnhance.Brightness(result)
            brightened = enhancer.enhance(1.1)
            blue_overlay = Image.new('RGBA', result.size, (220, 240, 255, 20))
            result = Image.alpha_composite(brightened, blue_overlay)
        
        # Convert to RGB for saving as JPEG
        result = result.convert('RGB')
        
        return result
    except Exception as e:
        logger.error(f"Error generating enhanced wall preview: {str(e)}")
        # Return original image with a red tint to indicate error
        error_image = image.copy()
        red_overlay = Image.new('RGBA', image.size, (255, 0, 0, 50))
        error_image.paste(red_overlay, (0, 0), red_overlay)
        return error_image.convert('RGB')

# Update the API endpoint for generating preview
@app.route('/api/generate-preview', methods=['POST'])
def generate_preview():
    try:
        data = request.json
        image_data = data.get('image')
        color_hex = data.get('color')
        
        # Get options with defaults
        options = {
            'intensity': float(data.get('intensity', 1.0)),
            'finish': data.get('finish', 'matte'),
            'texture': data.get('texture', True),
            'lighting': data.get('lighting', 'natural'),
            'blendMode': data.get('blendMode', 'normal'),
            'shadowTracking': data.get('shadowTracking', False),
            'vision360': data.get('vision360', False),
            'realisticBlending': data.get('realisticBlending', True)
        }
        
        # Decode base64 image
        image = decode_base64_image(image_data)
        
        # Generate enhanced preview
        preview_image = generate_enhanced_wall_preview(image, color_hex, options)
        
        # Convert back to base64
        preview_base64 = encode_image_to_base64(preview_image)
        
        return jsonify({
            "success": True,
            "previewUrl": preview_base64,
            "message": "Preview generated successfully",
            "appliedFeatures": {
                "shadowTracking": options['shadowTracking'],
                "vision360": options['vision360'],
                "realisticBlending": options['realisticBlending'],
                "finish": options['finish'],
                "lighting": options['lighting']
            }
        })
    except Exception as e:
        logger.error(f"Error in generate_preview: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to generate preview"
        }), 500

# Add a new endpoint for color matches (combining similar colors and brand matches)
@app.route('/api/color-matches', methods=['POST'])
def color_matches():
    try:
        data = request.json
        color_hex = data.get('color')
        include_rgb = data.get('includeRGB', False)
        shadow_tracking = data.get('shadowTracking', False)
        vision360 = data.get('vision360', False)
        realistic_blending = data.get('realisticBlending', True)
        
        # Generate similar colors
        similar_colors = []
        
        # Get RGB values
        r = int(color_hex[1:3], 16)
        g = int(color_hex[3:5], 16)
        b = int(color_hex[5:7], 16)
        
        # Generate similar colors with slight variations
        variations = [
            (r, g, b),  # Original color
            (max(0, r - 20), max(0, g - 20), max(0, b - 20)),  # Darker
            (min(255, r + 20), min(255, g + 20), min(255, b + 20)),  # Lighter
            (min(255, int(r * 1.1)), g, b),  # More red
            (r, min(255, int(g * 1.1)), b),  # More green
            (r, g, min(255, int(b * 1.1)))   # More blue
        ]
        
        for i, (rv, gv, bv) in enumerate(variations):
            hex_code = f"#{rv:02x}{gv:02x}{bv:02x}"
            color_name = generate_color_name(hex_code)
            
            if i == 0:
                name = color_name
            elif i == 1:
                name = f"Deep {color_name}"
            elif i == 2:
                name = f"Light {color_name}"
            elif i == 3:
                name = f"Vibrant {color_name}"
            elif i == 4:
                name = f"Fresh {color_name}"
            else:
                name = f"Cool {color_name}"
            
            color_obj = {
                "name": name,
                "hex": hex_code
            }
            
            if include_rgb:
                color_obj["rgb"] = f"rgb({rv}, {gv}, {bv})"
                
            similar_colors.append(color_obj)
        
        # Generate brand matches
        brand_matches = []
        brands = ["Sherwin-Williams", "Benjamin Moore", "Behr", "Valspar", "PPG"]
        
        for brand in brands:
            # Generate a unique color code for each brand
            if brand == "Sherwin-Williams":
                code = f"SW-{1000 + (r + g + b) % 9000}"
                name = f"SW {color_name}"
                finishes = ["Matte", "Eggshell", "Satin", "Semi-Gloss", "High-Gloss"]
            elif brand == "Benjamin Moore":
                code = f"BM-{r + g + b}"
                name = f"BM {color_name}"
                finishes = ["Flat", "Matte", "Eggshell", "Pearl", "Semi-Gloss", "High-Gloss"]
            elif brand == "Behr":
                code = f"BHR{(r * g * b) % 900 + 100}"
                name = f"Premium Plus {color_name}"
                finishes = ["Flat", "Eggshell", "Satin", "Semi-Gloss"]
            elif brand == "Valspar":
                code = f"VLP-{(r + g + b) // 3}"
                name = f"Signature {color_name}"
                finishes = ["Flat", "Eggshell", "Satin", "Semi-Gloss"]
            else:  # PPG
                code = f"PPG{(r * b) % 999 + 1000}"
                name = f"Timeless {color_name}"
                finishes = ["Flat", "Eggshell", "Satin", "Semi-Gloss", "High-Gloss"]
            
            brand_matches.append({
                "brand": brand,
                "colorName": name,
                "colorCode": code,
                "hex": color_hex,
                "finishOptions": finishes
            })
        
        return jsonify({
            "similarColors": similar_colors,
            "brandMatches": brand_matches,
            "featuresUsed": {
                "shadowTracking": shadow_tracking,
                "vision360": vision360,
                "realisticBlending": realistic_blending
            }
        })
    except Exception as e:
        logger.error(f"Error in color_matches: {str(e)}")
        return jsonify({
            "error": str(e),
            "message": "Failed to find color matches"
        }), 500

# Configure for both local and production
app.debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

# Serverless Function handler for Vercel
def handler(event, context):
    return app(event, context)

# Keep the original app.run code for local development
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))