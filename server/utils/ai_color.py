import cv2
import numpy as np
import random
import colorsys

def hex_to_rgb(hex_color):
    """Convert hex color string to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(rgb):
    """Convert RGB tuple to hex color string."""
    return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])

def simple_color_clustering(image, num_colors=5):
    """A simple color clustering method without KMeans."""
    # Resize image to make processing faster
    small_image = cv2.resize(image, (100, 100))
    pixels = small_image.reshape(-1, 3)
    
    # Sample pixels randomly to find colors
    sampled_pixels = pixels[np.random.choice(pixels.shape[0], min(1000, pixels.shape[0]), replace=False)]
    
    # Simple clustering - find most common colors
    # Convert to a set of tuples to remove duplicates, then back to array
    unique_colors = np.array(list(set(map(tuple, sampled_pixels))))
    
    # If we have fewer unique colors than requested, return what we have
    if len(unique_colors) <= num_colors:
        return unique_colors
    
    # Otherwise, select a subset of diverse colors
    selected_colors = []
    
    # Start with a random color
    selected_idx = random.randint(0, len(unique_colors) - 1)
    selected_colors.append(unique_colors[selected_idx])
    
    # Find the most distinct colors
    for _ in range(num_colors - 1):
        max_distance = 0
        farthest_color = None
        
        for color in unique_colors:
            # Skip if color is already selected
            if any(np.array_equal(color, selected) for selected in selected_colors):
                continue
                
            # Calculate minimum distance to any selected color
            min_distance = min(np.sum(np.square(color - selected)) for selected in selected_colors)
            
            if min_distance > max_distance:
                max_distance = min_distance
                farthest_color = color
        
        if farthest_color is not None:
            selected_colors.append(farthest_color)
    
    return np.array(selected_colors)

def extract_colors(image_path, num_colors=5):
    """Extract dominant colors from an image."""
    # Load image
    image = cv2.imread(image_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Extract colors
    colors = simple_color_clustering(image, num_colors)
    
    # Convert to RGB integers
    colors = [tuple(map(int, color)) for color in colors]
    
    # Convert to hex
    hex_colors = [rgb_to_hex(color) for color in colors]
    
    # Add some predefined nice paint colors
    predefined_colors = [
        '#F5F5DC',  # Beige
        '#E0FFFF',  # Light Cyan
        '#FFF0F5',  # Lavender Blush
        '#E6E6FA',  # Lavender
        '#F0FFF0',  # Honeydew
        '#F0F8FF',  # Alice Blue
        '#FDF5E6',  # Old Lace
        '#F8F8FF',  # Ghost White
        '#FFFAFA',  # Snow
        '#F0FFFF',  # Azure
        '#708090',  # Slate Gray
        '#B0C4DE',  # Light Steel Blue
        '#E9967A',  # Dark Salmon
        '#FFE4E1',  # Misty Rose
        '#FFE4B5',  # Moccasin
    ]
    
    # Combine extracted and predefined colors
    all_colors = hex_colors + predefined_colors
    
    return all_colors

def apply_color_to_image(image_path, output_path, color_hex, opacity=0.5):
    """Apply a color overlay to an image with realistic shadowing."""
    # Load image
    image = cv2.imread(image_path)
    
    # Convert hex color to BGR (OpenCV uses BGR)
    rgb_color = hex_to_rgb(color_hex)
    bgr_color = (rgb_color[2], rgb_color[1], rgb_color[0])
    
    # Create a copy of the image for processing
    result = image.copy()
    
    # Convert to grayscale to detect edges and features
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Use Canny edge detection
    edges = cv2.Canny(blurred, 50, 150)
    
    # Dilate edges to make them more prominent
    kernel = np.ones((2, 2), np.uint8)
    dilated_edges = cv2.dilate(edges, kernel, iterations=1)
    
    # Create a mask where edges are black and rest is white
    edge_mask = 255 - dilated_edges
    
    # Create a color overlay
    color_overlay = np.full_like(image, bgr_color)
    
    # Apply the color overlay with variable opacity based on edge mask
    # Edges get less color (simulating shadows)
    for i in range(3):  # For each color channel
        result[:, :, i] = (
            image[:, :, i] * (1 - opacity) + 
            color_overlay[:, :, i] * opacity * (edge_mask / 255.0)
        ).astype(np.uint8)
    
    # Save the result
    cv2.imwrite(output_path, result)
    
    return output_path

def get_complementary_colors(color_hex, num_colors=3):
    """Generate complementary colors for a given color."""
    # Convert hex to RGB
    r, g, b = hex_to_rgb(color_hex)
    
    # Convert RGB to HSV
    r, g, b = r/255.0, g/255.0, b/255.0
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    
    complementary_colors = []
    
    # Generate colors with different hues
    for i in range(num_colors):
        new_h = (h + (i + 1) * (1.0 / (num_colors + 1))) % 1.0
        r, g, b = colorsys.hsv_to_rgb(new_h, s, v)
        rgb_int = (int(r * 255), int(g * 255), int(b * 255))
        complementary_colors.append(rgb_to_hex(rgb_int))
    
    return complementary_colors 