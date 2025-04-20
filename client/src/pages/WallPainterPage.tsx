import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  useTheme
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WallColorAnalyzer from '../components/WallColorAnalyzer';
import { ColorSuggestion } from '../services/ColorSuggestionService';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';

const WallPainterPage: React.FC = () => {
  const theme = useTheme();
  // Store selected color for future features
  const [selectedColor, setSelectedColor] = useState<ColorSuggestion | null>(null);
  
  const handleColorSelect = (color: ColorSuggestion) => {
    setSelectedColor(color);
    // Color selection is handled inside WallColorAnalyzer component
    console.log(`Selected color: ${color.hexCode}`);
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #f8fafc, #eef2ff)',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          zIndex: 0,
          overflow: 'hidden',
          opacity: 0.5,
          pointerEvents: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(50px)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(50px)',
          }
        }}
      />
      
      <Header />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pt: { xs: 8, sm: 10 },
          pb: { xs: 4, sm: 6 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg">
          {/* Page Intro */}
          <Box 
            sx={{ 
              textAlign: 'center',
              mb: 6
            }}
          >
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(99, 102, 241, 0.2)',
                animation: 'shimmer 2.5s infinite linear',
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                  '100%': { backgroundPosition: '0% 50%' },
                },
                backgroundSize: '200% auto',
              }}
            >
              AI Wall Color Visualizer
            </Typography>
            
            <Typography
              variant="h5"
              component="h2" 
              color="textSecondary"
              sx={{
                mb: 3,
                maxWidth: '800px',
                mx: 'auto',
                opacity: 0.9,
                lineHeight: 1.6,
                animation: 'fadeIn 1s ease-in-out',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(10px)' },
                  to: { opacity: 0.9, transform: 'translateY(0)' },
                },
              }}
            >
              Transform your space with our AI-powered tool that suggests perfect colors and shows you how they'll look on your walls
            </Typography>
            
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'rgba(99, 102, 241, 0.08)',
                borderRadius: '12px',
                maxWidth: '900px',
                mx: 'auto',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <InfoIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                Take a clear photo of your wall or upload an existing image. Our AI will analyze it and suggest suitable color palettes, then show you a preview of how they would look.
              </Typography>
            </Paper>
          </Box>
          
          {/* Main Content */}
          <WallColorAnalyzer onColorSelect={handleColorSelect} />
          
          {/* How It Works Section */}
          <Box sx={{ mt: 10, mb: 6 }}>
            <Typography
              variant="h3"
              component="h3"
              align="center"
              gutterBottom
              sx={{
                mb: 6,
                fontWeight: 700,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              How It Works
            </Typography>
            
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4,
                justifyContent: 'center',
              }}
            >
              {/* Step 1 */}
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  flex: 1,
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: theme.palette.primary.main,
                    }}
                  >
                    1
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Capture or Upload
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Take a photo of your wall using your device's camera or upload an existing image. Make sure the wall is well-lit for best results.
                </Typography>
              </Paper>
              
              {/* Step 2 */}
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  flex: 1,
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    bgcolor: 'rgba(139, 92, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: '#8b5cf6',
                    }}
                  >
                    2
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  AI Color Analysis
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Our AI analyzes your wall and suggests color palettes that would look great in your space, considering lighting and room aesthetics.
                </Typography>
              </Paper>
              
              {/* Step 3 */}
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  flex: 1,
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    bgcolor: 'rgba(236, 72, 153, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: '#ec4899',
                    }}
                  >
                    3
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Visualize Results
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  See a realistic preview of how each color would look on your wall. Copy the color codes and take them to your local paint store.
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default WallPainterPage; 