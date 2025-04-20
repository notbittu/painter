import axios from 'axios';

/**
 * Service for handling AI-powered color suggestions
 */
export interface ColorSuggestion {
  name: string;
  hexCode: string;
  previewUrl?: string; // URL to a preview image with the color applied
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

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Service for getting AI-powered color suggestions for walls
 */
class ColorSuggestionService {
  /**
   * Analyze the wall image and suggest colors
   * @param imageData Base64 string of the image
   */
  public async analyzeWallImage(imageData: string): Promise<ColorAnalysisResult> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/detect-colors`, {
        image: imageData
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
   */
  public async generateColorPreview(wallImageData: string, colorHex: string): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-preview`, {
        image: wallImageData,
        color: colorHex
      });
      
      return response.data.previewUrl;
    } catch (error) {
      console.error('Error generating color preview:', error);
      // In a real app, we would handle this more gracefully
      throw new Error('Failed to generate preview');
    }
  }
  
  /**
   * Provides fallback color suggestions when the API is not available
   */
  private getFallbackColorSuggestions(): ColorAnalysisResult {
    return {
      dominantColors: [
        { name: 'Serene Blue', hexCode: '#4a6da7' },
        { name: 'Vibrant Rose', hexCode: '#f50057' },
        { name: 'Calm Aqua', hexCode: '#00bcd4' },
        { name: 'Warm Amber', hexCode: '#ff9800' },
        { name: 'Fresh Mint', hexCode: '#4caf50' },
        { name: 'Royal Purple', hexCode: '#9c27b0' }
      ],
      suggestedPalettes: [
        {
          name: 'Modern Neutrals',
          description: 'Clean, contemporary colors that create a calm atmosphere',
          colors: [
            { name: 'Off White', hexCode: '#f5f5f5' },
            { name: 'Soft Gray', hexCode: '#e0e0e0' },
            { name: 'Warm Beige', hexCode: '#e6d2b5' },
            { name: 'Light Sage', hexCode: '#d4e2d4' }
          ]
        },
        {
          name: 'Bold Statements',
          description: 'Expressive colors that energize your space',
          colors: [
            { name: 'Vibrant Teal', hexCode: '#009688' },
            { name: 'Deep Navy', hexCode: '#1a237e' },
            { name: 'Terracotta', hexCode: '#bf360c' },
            { name: 'Emerald', hexCode: '#2e7d32' }
          ]
        },
        {
          name: 'Pastel Dreams',
          description: 'Soft, soothing tones for a relaxing environment',
          colors: [
            { name: 'Powder Blue', hexCode: '#bbdefb' },
            { name: 'Blush Pink', hexCode: '#f8bbd0' },
            { name: 'Mint Green', hexCode: '#c8e6c9' },
            { name: 'Lavender', hexCode: '#d1c4e9' }
          ]
        }
      ]
    };
  }
}

export default new ColorSuggestionService(); 