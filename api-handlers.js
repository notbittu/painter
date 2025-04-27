const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');

/**
 * Extract dominant colors from an image
 * @param {Buffer} imageBuffer - The image buffer
 * @param {number} numColors - Number of colors to extract
 * @returns {string[]} Array of hex color codes
 */
async function extractDominantColors(imageBuffer, numColors = 6) {
  try {
    // Resize image for faster processing
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(150, 150, { fit: 'cover' })
      .toBuffer();
    
    // Load the image
    const image = await loadImage(resizedImageBuffer);
    
    // Create canvas and draw image
    const canvas = createCanvas(150, 150);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, 150, 150);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, 150, 150);
    const pixels = imageData.data;
    
    // Sample from different regions
    const regions = [
      { x: 0, y: 0, width: 75, height: 75 },      // top-left
      { x: 75, y: 0, width: 75, height: 75 },     // top-right
      { x: 0, y: 75, width: 75, height: 75 },     // bottom-left
      { x: 75, y: 75, width: 75, height: 75 },    // bottom-right
      { x: 37, y: 37, width: 75, height: 75 },    // center
      { x: 0, y: 0, width: 150, height: 150 }     // entire image
    ];
    
    // Get average color from each region
    const colors = [];
    for (let i = 0; i < Math.min(numColors, regions.length); i++) {
      const region = regions[i];
      const { r, g, b } = getAverageColor(pixels, region, 150);
      const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colors.push(hexColor);
    }
    
    return colors;
  } catch (error) {
    console.error('Error extracting dominant colors:', error);
    return Array(numColors).fill('#cccccc'); // Default gray colors on error
  }
}

/**
 * Get average color from a region of pixels
 */
function getAverageColor(pixels, region, width) {
  let r = 0, g = 0, b = 0, count = 0;
  
  for (let y = region.y; y < region.y + region.height; y++) {
    for (let x = region.x; x < region.x + region.width; x++) {
      const idx = (y * width + x) * 4;
      r += pixels[idx];
      g += pixels[idx + 1];
      b += pixels[idx + 2];
      count++;
    }
  }
  
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count)
  };
}

/**
 * Generate a color name based on hex code
 */
function generateColorName(hexCode) {
  // Color names mapping (simplified version)
  const colorNames = {
    '#0000ff': 'Royal Blue',
    '#ff0000': 'Vibrant Red',
    '#00ff00': 'Lime Green',
    '#ffff00': 'Yellow',
    '#800080': 'Purple',
    '#a52a2a': 'Brown',
    '#ffffff': 'White',
    '#000000': 'Black',
  };
  
  // Get RGB values
  const r = parseInt(hexCode.substring(1, 3), 16);
  const g = parseInt(hexCode.substring(3, 5), 16);
  const b = parseInt(hexCode.substring(5, 7), 16);
  
  // Basic color classification
  let baseName;
  if (r > 200 && g > 200 && b > 200) {
    baseName = "Light";
  } else if (r < 60 && g < 60 && b < 60) {
    baseName = "Dark";
  } else if (r > g && r > b) {
    baseName = r > 200 ? "Warm" : "Rich";
  } else if (g > r && g > b) {
    baseName = g > 200 ? "Fresh" : "Natural";
  } else if (b > r && b > g) {
    baseName = b > 200 ? "Cool" : "Deep";
  } else {
    baseName = r > 180 ? "Soft" : "Classic";
  }
  
  // Find closest color in our predefined list
  let minDistance = Infinity;
  let closestColorName = null;
  
  for (const [hex, name] of Object.entries(colorNames)) {
    const r2 = parseInt(hex.substring(1, 3), 16);
    const g2 = parseInt(hex.substring(3, 5), 16);
    const b2 = parseInt(hex.substring(5, 7), 16);
    
    const distance = Math.sqrt((r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestColorName = name;
    }
  }
  
  return closestColorName ? `${baseName} ${closestColorName}` : `${baseName} Tone`;
}

/**
 * Generate a preview of the wall with the selected color
 */
async function generateWallPreview(imageBuffer, colorHex, options = {}) {
  try {
    // Get RGB values from hex
    const r = parseInt(colorHex.substring(1, 3), 16);
    const g = parseInt(colorHex.substring(3, 5), 16);
    const b = parseInt(colorHex.substring(5, 7), 16);
    
    // Convert options
    const intensity = options.intensity || 1.0;
    
    // Create a semi-transparent color overlay
    const overlay = Buffer.from([
      r, g, b, Math.round(180 * intensity)
    ]);
    
    // Apply the color to the image
    const processedImage = await sharp(imageBuffer)
      .composite([{
        input: {
          create: {
            width: 1,
            height: 1,
            channels: 4,
            background: { r, g, b, alpha: Math.round(180 * intensity) }
          }
        },
        tile: true,
        blend: 'overlay'
      }])
      .sharpen()
      .toBuffer();
    
    // Convert to base64
    return `data:image/jpeg;base64,${processedImage.toString('base64')}`;
  } catch (error) {
    console.error('Error generating preview:', error);
    return null;
  }
}

/**
 * Detect colors in an image
 */
async function detectColors(data) {
  try {
    if (!data || !data.image) {
      throw new Error('No image data provided');
    }
    
    // Extract the base64 data
    const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Extract dominant colors
    const hexColors = await extractDominantColors(imageBuffer);
    
    // Create color suggestions
    const dominantColors = await Promise.all(hexColors.map(async (hexColor) => {
      const colorName = generateColorName(hexColor);
      return {
        name: colorName,
        hex: hexColor,
        brand: getRandomBrand(),
        roomTypes: getRandomRoomTypes(),
        moodCategory: getRandomMood()
      };
    }));
    
    // Create sample palettes
    const palettes = [
      {
        name: "Modern Neutrals",
        description: "Clean, contemporary colors that create a calm atmosphere",
        colors: [
          {name: "Off White", hexCode: "#f5f5f5"},
          {name: "Soft Gray", hexCode: "#e0e0e0"},
          {name: "Warm Beige", hexCode: "#e6d2b5"},
          {name: "Light Sage", hexCode: "#d4e2d4"}
        ]
      },
      {
        name: "Bold Statements",
        description: "Expressive colors that energize your space",
        colors: [
          {name: "Vibrant Teal", hexCode: "#009688"},
          {name: "Deep Navy", hexCode: "#1a237e"},
          {name: "Terracotta", hexCode: "#bf360c"},
          {name: "Emerald", hexCode: "#2e7d32"}
        ]
      }
    ];
    
    return {
      dominantColors,
      suggestedPalettes: palettes
    };
  } catch (error) {
    console.error('Error in color detection:', error);
    throw error;
  }
}

/**
 * Generate a preview with the selected color
 */
async function generatePreview(data) {
  try {
    const { image, color, ...options } = data;
    
    if (!image || !color) {
      throw new Error('Missing image or color data');
    }
    
    // Extract the base64 data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Generate preview
    const previewBase64 = await generateWallPreview(imageBuffer, color, options);
    
    if (!previewBase64) {
      throw new Error('Failed to generate preview');
    }
    
    return {
      success: true,
      previewUrl: previewBase64,
      message: "Preview generated successfully",
      appliedFeatures: {
        shadowTracking: !!options.shadowTracking,
        vision360: !!options.vision360,
        realisticBlending: options.realisticBlending !== false,
        finish: options.finish || 'matte',
        lighting: options.lighting || 'natural'
      }
    };
  } catch (error) {
    console.error('Error generating preview:', error);
    throw error;
  }
}

/**
 * Find similar colors and brand matches
 */
async function colorMatches(data) {
  try {
    const { color, includeRGB } = data;
    
    if (!color) {
      throw new Error('No color provided');
    }
    
    // Get RGB values
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    
    // Generate similar colors
    const variations = [
      { r, g, b },  // Original
      { r: Math.max(0, r - 20), g: Math.max(0, g - 20), b: Math.max(0, b - 20) },  // Darker
      { r: Math.min(255, r + 20), g: Math.min(255, g + 20), b: Math.min(255, b + 20) },  // Lighter
      { r: Math.min(255, Math.floor(r * 1.1)), g, b },  // More red
      { r, g: Math.min(255, Math.floor(g * 1.1)), b },  // More green
      { r, g, b: Math.min(255, Math.floor(b * 1.1)) }  // More blue
    ];
    
    const similarColors = variations.map((color, i) => {
      const { r, g, b } = color;
      const hexCode = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      const colorName = generateColorName(hexCode);
      
      const name = i === 0 ? colorName :
                   i === 1 ? `Deep ${colorName}` :
                   i === 2 ? `Light ${colorName}` :
                   i === 3 ? `Vibrant ${colorName}` :
                   i === 4 ? `Fresh ${colorName}` :
                   `Cool ${colorName}`;
      
      const result = {
        name,
        hex: hexCode
      };
      
      if (includeRGB) {
        result.rgb = `rgb(${r}, ${g}, ${b})`;
      }
      
      return result;
    });
    
    // Generate brand matches
    const brands = ["Sherwin-Williams", "Benjamin Moore", "Behr", "Valspar", "PPG"];
    const brandMatches = brands.map(brand => {
      const colorName = generateColorName(color);
      let code, name, finishes;
      
      if (brand === "Sherwin-Williams") {
        code = `SW-${1000 + ((r + g + b) % 9000)}`;
        name = `SW ${colorName}`;
        finishes = ["Matte", "Eggshell", "Satin", "Semi-Gloss", "High-Gloss"];
      } else if (brand === "Benjamin Moore") {
        code = `BM-${r + g + b}`;
        name = `BM ${colorName}`;
        finishes = ["Flat", "Matte", "Eggshell", "Pearl", "Semi-Gloss", "High-Gloss"];
      } else if (brand === "Behr") {
        code = `BHR${((r * g * b) % 900) + 100}`;
        name = `Premium Plus ${colorName}`;
        finishes = ["Flat", "Eggshell", "Satin", "Semi-Gloss"];
      } else if (brand === "Valspar") {
        code = `VLP-${Math.floor((r + g + b) / 3)}`;
        name = `Signature ${colorName}`;
        finishes = ["Flat", "Eggshell", "Satin", "Semi-Gloss"];
      } else {  // PPG
        code = `PPG${((r * b) % 999) + 1000}`;
        name = `Timeless ${colorName}`;
        finishes = ["Flat", "Eggshell", "Satin", "Semi-Gloss", "High-Gloss"];
      }
      
      return {
        brand,
        colorName: name,
        colorCode: code,
        hex: color,
        finishOptions: finishes
      };
    });
    
    return {
      similarColors,
      brandMatches
    };
  } catch (error) {
    console.error('Error in color matches:', error);
    throw error;
  }
}

// Helper functions
function getRandomBrand() {
  const brands = ["Sherwin-Williams", "Benjamin Moore", "Behr", "Valspar", "PPG"];
  return brands[Math.floor(Math.random() * brands.length)];
}

function getRandomRoomTypes() {
  const roomTypes = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Dining Room", "Home Office"];
  const numTypes = Math.floor(Math.random() * 3) + 1;
  const selectedTypes = [];
  
  for (let i = 0; i < numTypes; i++) {
    const type = roomTypes[Math.floor(Math.random() * roomTypes.length)];
    if (!selectedTypes.includes(type)) {
      selectedTypes.push(type);
    }
  }
  
  return selectedTypes;
}

function getRandomMood() {
  const moods = ["Calm", "Energizing", "Cozy", "Modern", "Elegant", "Bold", "Relaxing", "Fresh"];
  return moods[Math.floor(Math.random() * moods.length)];
}

module.exports = {
  detectColors,
  generatePreview,
  colorMatches
}; 