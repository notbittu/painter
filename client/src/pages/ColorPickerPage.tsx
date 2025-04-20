import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Button, Slider, TextField } from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import { styled, Theme } from '@mui/material/styles';

// Extend colord with the names plugin
extend([namesPlugin]);

const ColorSwatch = styled(Box)(({ theme }: { theme: Theme }) => ({
  width: '100%',
  height: 200,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease',
}));

const ColorPickerPage = () => {
  const [color, setColor] = useState('#3f51b5');
  const [palette, setPalette] = useState<string[]>([]);
  
  const colorInfo = colord(color);
  
  // Create complementary palette
  const createPalette = () => {
    const c = colord(color);
    const newPalette = [
      c.lighten(0.2).toHex(),  // Lighter
      color,                   // Base color
      c.darken(0.2).toHex(),   // Darker
      c.rotate(180).toHex(),   // Complementary
    ];
    setPalette(newPalette);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Color Picker
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
        Choose the perfect color for your space with our interactive color tools
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Select Your Color
            </Typography>
            
            <HexColorPicker color={color} onChange={setColor} style={{ width: '100%', height: 300, marginBottom: 20 }} />
            
            <Box sx={{ mt: 3 }}>
              <TextField 
                fullWidth
                label="Hex Color" 
                value={color} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColor(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Typography gutterBottom>
                Color Name: {colorInfo.toName({ closest: true })}
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={createPalette}
              >
                Generate Color Scheme
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 2, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Preview
            </Typography>
            
            <ColorSwatch sx={{ bgcolor: color, mb: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>RGB: {colorInfo.toRgbString()}</Typography>
              <Typography gutterBottom>HSL: {colorInfo.toHslString()}</Typography>
              <Typography gutterBottom>CMYK: {colord(color).toHex()}</Typography>
            </Box>
            
            {palette.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Color Scheme
                </Typography>
                <Grid container spacing={2}>
                  {palette.map((c, index) => (
                    <Grid item xs={3} key={index}>
                      <Box sx={{ bgcolor: c, height: 80, borderRadius: 1, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {c.toUpperCase()}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 4, mt: 6, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Popular Colors
        </Typography>
        <Grid container spacing={2}>
          {['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', 
            '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107',
            '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'].map((c) => (
            <Grid item xs={6} sm={4} md={2} lg={1} key={c}>
              <Box 
                sx={{ 
                  bgcolor: c, 
                  height: 50, 
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.05)' },
                  transition: 'transform 0.2s ease'
                }}
                onClick={() => setColor(c)}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ColorPickerPage; 