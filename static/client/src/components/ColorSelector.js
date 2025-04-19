import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import axios from 'axios';

// Helper function to generate complementary colors
const getComplementaryColors = (hex) => {
  // Convert hex to rgb
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Generate a few complementary colors
  const complementary = [
    // Complementary (opposite on color wheel)
    `#${(255 - r).toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${(255 - b).toString(16).padStart(2, '0')}`,
    // Analogous (next to on color wheel)
    `#${r.toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
    `#${(255 - r).toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
    // Lighter shades
    `#${Math.min(255, r + 40).toString(16).padStart(2, '0')}${Math.min(255, g + 40).toString(16).padStart(2, '0')}${Math.min(255, b + 40).toString(16).padStart(2, '0')}`,
    // Darker shades
    `#${Math.max(0, r - 40).toString(16).padStart(2, '0')}${Math.max(0, g - 40).toString(16).padStart(2, '0')}${Math.max(0, b - 40).toString(16).padStart(2, '0')}`
  ];
  
  return complementary;
};

// Default palette colors
const paletteColors = [
  '#FFFFFF', // White
  '#F5F5F5', // White Smoke
  '#DCDCDC', // Gainsboro
  '#D3D3D3', // Light Gray
  '#F0F8FF', // Alice Blue
  '#E6E6FA', // Lavender
  '#FFF0F5', // Lavender Blush
  '#FFE4E1', // Misty Rose
  '#FAEBD7', // Antique White
  '#FAF0E6', // Linen
  '#F5DEB3', // Wheat
  '#DEB887', // Burlywood
  '#D2B48C', // Tan
  '#BC8F8F', // Rosy Brown
  '#F08080', // Light Coral
];

function ColorSelector({ 
  suggestedColors, 
  selectedColor, 
  onColorSelected, 
  onColorApplied, 
  currentFile,
  isLoading,
  setIsLoading 
}) {
  const [tabValue, setTabValue] = useState(0);
  const [complementaryColors, setComplementaryColors] = useState([]);

  useEffect(() => {
    // Generate complementary colors when selectedColor changes
    if (selectedColor) {
      setComplementaryColors(getComplementaryColors(selectedColor));
    }
  }, [selectedColor]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleColorClick = (color) => {
    onColorSelected(color);
  };

  const handleApplyColor = async () => {
    if (!currentFile || !selectedColor) return;

    setIsLoading(true);

    try {
      const response = await axios.post('/api/apply-color', {
        filename: currentFile,
        color: selectedColor
      });

      if (response.data.success) {
        onColorApplied(response.data.result_path);
      } else {
        alert('Error applying color.');
      }
    } catch (error) {
      console.error('Apply color error:', error);
      alert('Failed to apply color. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ColorGrid = ({ colors }) => (
    <Grid container spacing={1} sx={{ mt: 1 }}>
      {colors.map((color, index) => (
        <Grid item key={index}>
          <Box
            className={`color-swatch ${color === selectedColor ? 'selected' : ''}`}
            onClick={() => handleColorClick(color)}
            sx={{
              backgroundColor: color,
              width: 45,
              height: 45,
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: color === selectedColor ? '2px solid #000' : '2px solid transparent',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3,
        flexGrow: 1,
        flexBasis: '50%'
      }}
    >
      <Typography variant="h6" gutterBottom>Color Selection</Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="color tabs" sx={{ mb: 2 }}>
        <Tab label="AI Suggested" />
        <Tab label="Color Palette" />
        <Tab label="Complementary" />
      </Tabs>

      {/* Tab Panels */}
      <Box role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && (
          <>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Colors extracted from your image:
            </Typography>
            <ColorGrid colors={suggestedColors} />
          </>
        )}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Popular paint colors:
            </Typography>
            <ColorGrid colors={paletteColors} />
          </>
        )}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 2}>
        {tabValue === 2 && (
          <>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Complementary to your selection:
            </Typography>
            <ColorGrid colors={complementaryColors} />
          </>
        )}
      </Box>

      {/* Selected Color */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="subtitle1" gutterBottom>
          Selected Color
        </Typography>
        <Box 
          sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            backgroundColor: selectedColor,
            margin: '0 auto',
            border: '3px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            mb: 1
          }} 
        />
        <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
          {selectedColor}
        </Typography>

        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          onClick={handleApplyColor}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Apply to Wall'}
        </Button>
      </Box>
    </Paper>
  );
}

export default ColorSelector; 