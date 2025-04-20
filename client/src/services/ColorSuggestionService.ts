import axios from 'axios';

/**
 * Service for handling AI-powered color suggestions
 */
export interface ColorSuggestion {
  name: string;
  hexCode: string;
  previewUrl?: string; // URL to a preview image with the color applied
  brand?: string; // Paint brand name
  colorCode?: string; // Brand-specific color code
  roomTypes?: string[]; // Recommended room types
}

export interface ColorAnalysisResult {
  dominantColors: ColorSuggestion[];
  suggestedPalettes: {
    name: string;
    description: string;
    colors: ColorSuggestion[];
  }[];
  wallPreview?: string; // Data URL of the wall with suggested color applied
}

export interface ColorPreviewOptions {
  intensity: number; // 0.0 to 2.0, where 1.0 is normal intensity
  finish: 'matte' | 'eggshell' | 'satin' | 'semi-gloss' | 'high-gloss';
  showTexture: boolean; // Whether to show wall texture in preview
  lightingEffect: 'natural' | 'warm' | 'cool' | 'bright' | 'dim'; // Lighting simulation
  shadowTracking?: boolean; // Added for shadow tracking feature
}

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Default preview options
export const defaultPreviewOptions: ColorPreviewOptions = {
  intensity: 1.0,
  finish: 'matte',
  showTexture: true,
  lightingEffect: 'natural',
  shadowTracking: true
};

/**
 * Service for getting AI-powered color suggestions for walls
 */
class ColorSuggestionService {
  /**
   * Analyze the wall image and suggest colors
   * @param imageData Base64 string of the image
   * @param shadowTracking Whether to preserve shadows in the analysis
   */
  public async analyzeWallImage(imageData: string, shadowTracking: boolean = true): Promise<ColorAnalysisResult> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/detect-colors`, {
        image: imageData,
        shadowTracking: shadowTracking
      });
      
      return response.data;
    } catch (error) {
      console.error('Error analyzing wall colors:', error);
      
      // Fallback with sample data if the API fails
      return this.getFallbackColorSuggestions();
    }
  }
  
  /**
   * Generate a preview of how the wall would look with the selected color
   * @param wallImageData Base64 string of the wall image
   * @param colorHex Hex color code to apply
   * @param options Options for the preview generation
   */
  public async generateColorPreview(
    wallImageData: string, 
    colorHex: string, 
    options: ColorPreviewOptions = defaultPreviewOptions
  ): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-preview`, {
        image: wallImageData,
        color: colorHex,
        intensity: options.intensity,
        finish: options.finish,
        showTexture: options.showTexture,
        lightingEffect: options.lightingEffect,
        shadowTracking: options.shadowTracking
      });
      
      return response.data.previewUrl;
    } catch (error) {
      console.error('Error generating color preview:', error);
      // Simulate intensity adjustment on the client side when API fails
      return this.getClientSidePreview(colorHex, options);
    }
  }
  
  /**
   * Get similar colors to the selected color
   * @param colorHex The hex code of the color
   */
  public async getSimilarColors(colorHex: string): Promise<ColorSuggestion[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/similar-colors`, {
        color: colorHex
      });
      
      return response.data.colors;
    } catch (error) {
      console.error('Error getting similar colors:', error);
      // Return fallback similar colors
      return this.getFallbackSimilarColors(colorHex);
    }
  }
  
  /**
   * Get brand-specific color matches
   * @param colorHex The hex code of the color
   */
  public async getBrandMatches(colorHex: string): Promise<{brand: string, colorName: string, colorCode: string, hexCode: string}[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/brand-matches`, {
        color: colorHex
      });
      
      return response.data.matches;
    } catch (error) {
      console.error('Error getting brand matches:', error);
      // Return fallback brand matches
      return this.getFallbackBrandMatches(colorHex);
    }
  }
  
  /**
   * Generate a simple client-side preview when API fails
   * Adjusts color based on intensity
   */
  private getClientSidePreview(colorHex: string, options: ColorPreviewOptions): string {
    // This is a fallback that just returns the color - in a real app we would use canvas
    // to generate a proper preview with the wall image
    return colorHex;
  }
  
  /**
   * Get fallback similar colors - used when API fails
   */
  private getFallbackSimilarColors(colorHex: string): ColorSuggestion[] {
    // In a real app, we would generate proper similar colors
    return [
      { name: 'Lighter Shade', hexCode: this.adjustColorLightness(colorHex, 20) },
      { name: 'Darker Shade', hexCode: this.adjustColorLightness(colorHex, -20) },
      { name: 'Similar Tone 1', hexCode: this.adjustColorHue(colorHex, 5) },
      { name: 'Similar Tone 2', hexCode: this.adjustColorHue(colorHex, -5) }
    ];
  }
  
  /**
   * Get fallback brand matches - used when API fails
   */
  private getFallbackBrandMatches(colorHex: string): {brand: string, colorName: string, colorCode: string, hexCode: string}[] {
    return [
      { brand: 'Asian Paints', colorName: 'Serene Blue', colorCode: 'AP-2231', hexCode: colorHex },
      { brand: 'Berger', colorName: 'Ocean Blue', colorCode: 'BG-112', hexCode: colorHex },
      { brand: 'Nerolac', colorName: 'Sky Blue', colorCode: 'NL-345', hexCode: colorHex },
      { brand: 'Dulux', colorName: 'Aqua Fresh', colorCode: 'DX-567', hexCode: colorHex }
    ];
  }
  
  /**
   * Adjusts color lightness
   */
  private adjustColorLightness(hex: string, amount: number): string {
    // Simplified color adjustment for demo purposes
    // In a real app, we would convert to HSL, adjust lightness, then convert back to hex
    return hex;
  }
  
  /**
   * Adjusts color hue
   */
  private adjustColorHue(hex: string, amount: number): string {
    // Simplified color adjustment for demo purposes
    // In a real app, we would convert to HSL, adjust hue, then convert back to hex
    return hex;
  }
  
  /**
   * Provides fallback color suggestions when the API is not available
   */
  private getFallbackColorSuggestions(): ColorAnalysisResult {
    return {
      dominantColors: [
        { 
          name: 'Serene Blue', 
          hexCode: '#4a6da7', 
          brand: 'Asian Paints', 
          colorCode: 'AP-2231',
          roomTypes: ['Bedroom', 'Living Room'] 
        },
        { 
          name: 'Vibrant Rose', 
          hexCode: '#f50057', 
          brand: 'Berger',
          colorCode: 'BG-112',
          roomTypes: ['Accent Wall', 'Children\'s Room'] 
        },
        { 
          name: 'Calm Aqua', 
          hexCode: '#00bcd4', 
          brand: 'Nerolac',
          colorCode: 'NL-345',
          roomTypes: ['Bathroom', 'Kitchen'] 
        },
        { 
          name: 'Warm Amber', 
          hexCode: '#ff9800', 
          brand: 'Dulux',
          colorCode: 'DX-567',
          roomTypes: ['Dining Room', 'Study'] 
        },
        { 
          name: 'Fresh Mint', 
          hexCode: '#4caf50', 
          brand: 'Asian Paints',
          colorCode: 'AP-2245',
          roomTypes: ['Kitchen', 'Balcony'] 
        },
        { 
          name: 'Royal Purple', 
          hexCode: '#9c27b0', 
          brand: 'Berger',
          colorCode: 'BG-136',
          roomTypes: ['Accent Wall', 'Entertainment Room'] 
        }
      ],
      suggestedPalettes: [
        {
          name: 'Modern Neutrals',
          description: 'Clean, contemporary colors that create a calm atmosphere',
          colors: [
            { 
              name: 'Off White', 
              hexCode: '#f5f5f5', 
              brand: 'Asian Paints',
              colorCode: 'AP-1101',
              roomTypes: ['Any Room'] 
            },
            { 
              name: 'Soft Gray', 
              hexCode: '#e0e0e0', 
              brand: 'Nerolac',
              colorCode: 'NL-201',
              roomTypes: ['Living Room', 'Bedroom'] 
            },
            { 
              name: 'Warm Beige', 
              hexCode: '#e6d2b5', 
              brand: 'Dulux',
              colorCode: 'DX-221',
              roomTypes: ['Living Room', 'Dining Room'] 
            },
            { 
              name: 'Light Sage', 
              hexCode: '#d4e2d4', 
              brand: 'Berger',
              colorCode: 'BG-311',
              roomTypes: ['Kitchen', 'Bathroom'] 
            }
          ]
        },
        {
          name: 'Bold Statements',
          description: 'Expressive colors that energize your space',
          colors: [
            { 
              name: 'Vibrant Teal', 
              hexCode: '#009688', 
              brand: 'Asian Paints',
              colorCode: 'AP-3311',
              roomTypes: ['Accent Wall', 'Home Office'] 
            },
            { 
              name: 'Deep Navy', 
              hexCode: '#1a237e', 
              brand: 'Nerolac',
              colorCode: 'NL-445',
              roomTypes: ['Bedroom', 'Study'] 
            },
            { 
              name: 'Terracotta', 
              hexCode: '#bf360c', 
              brand: 'Dulux',
              colorCode: 'DX-667',
              roomTypes: ['Living Room', 'Dining Room'] 
            },
            { 
              name: 'Emerald', 
              hexCode: '#2e7d32', 
              brand: 'Berger',
              colorCode: 'BG-512',
              roomTypes: ['Study', 'Dining Room'] 
            }
          ]
        },
        {
          name: 'Pastel Dreams',
          description: 'Soft, soothing tones for a relaxing environment',
          colors: [
            { 
              name: 'Powder Blue', 
              hexCode: '#bbdefb', 
              brand: 'Asian Paints',
              colorCode: 'AP-2211',
              roomTypes: ['Bedroom', 'Nursery'] 
            },
            { 
              name: 'Blush Pink', 
              hexCode: '#f8bbd0', 
              brand: 'Berger',
              colorCode: 'BG-176',
              roomTypes: ['Bedroom', 'Dressing Room'] 
            },
            { 
              name: 'Mint Green', 
              hexCode: '#c8e6c9', 
              brand: 'Nerolac',
              colorCode: 'NL-325',
              roomTypes: ['Bathroom', 'Kitchen'] 
            },
            { 
              name: 'Lavender', 
              hexCode: '#d1c4e9', 
              brand: 'Dulux',
              colorCode: 'DX-527',
              roomTypes: ['Bedroom', 'Reading Nook'] 
            }
          ]
        }
      ]
    };
  }
}

// Create an instance first, then export it
const colorSuggestionService = new ColorSuggestionService();
export default colorSuggestionService; 