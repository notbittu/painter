import React, { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ImageUploader from './components/ImageUploader';
import ColorSelector from './components/ColorSelector';
import ImagePreview from './components/ImagePreview';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a6da7',
    },
    secondary: {
      main: '#f78c6c',
    },
  },
});

function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [coloredImage, setColoredImage] = useState(null);
  const [suggestedColors, setSuggestedColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (file, imageUrl, colors) => {
    setCurrentFile(file);
    setOriginalImage(imageUrl);
    setSuggestedColors(colors);
    setColoredImage(null);
  };

  const handleColorSelection = (color) => {
    setSelectedColor(color);
  };

  const handleColorApply = (coloredImageUrl) => {
    setColoredImage(coloredImageUrl);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="app-container">
        <Header />
        
        <Container maxWidth="lg" component="main" className="main-content">
          <Box mb={4}>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              Visualize Your Perfect Wall Color with AI
            </Typography>
            <Typography variant="subtitle1" align="center" color="textSecondary">
              Upload a photo of your wall and explore different paint colors
            </Typography>
          </Box>
          
          {!originalImage ? (
            <ImageUploader 
              onImageUploaded={handleFileUpload} 
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <ImagePreview 
                originalImage={originalImage} 
                coloredImage={coloredImage}
                onReset={() => {
                  setOriginalImage(null);
                  setColoredImage(null);
                  setCurrentFile(null);
                  setSuggestedColors([]);
                }}
              />
              <ColorSelector 
                suggestedColors={suggestedColors}
                selectedColor={selectedColor}
                onColorSelected={handleColorSelection}
                onColorApplied={handleColorApply}
                currentFile={currentFile}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </Box>
          )}
        </Container>
        
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App; 