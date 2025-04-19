import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ColorLensIcon from '@mui/icons-material/ColorLens';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4a6da7',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState<string[]>([]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setImage(base64Image);
        
        // Here we would call the AI color detection API
        try {
          const response = await fetch('/api/detect-colors', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64Image }),
          });
          const data = await response.json();
          setColors(data.colors);
        } catch (error) {
          console.error('Error detecting colors:', error);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom align="center" color="primary">
            AI Color Detector
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary">
            Upload an image to detect dominant colors
          </Typography>
          
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mt: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: 300,
                border: '2px dashed #ccc',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fafafa',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#f0f0f0',
                },
              }}
            >
              {loading ? (
                <CircularProgress />
              ) : image ? (
                <img
                  src={image}
                  alt="Uploaded"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Drag and drop your image here, or click to select
                  </Typography>
                </>
              )}
            </Box>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="contained" component="span" startIcon={<ColorLensIcon />}>
                Upload Image
              </Button>
            </label>

            {colors.length > 0 && (
              <Box sx={{ mt: 4, width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Detected Colors:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {colors.map((color, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: color,
                        borderRadius: 1,
                        boxShadow: 1,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 