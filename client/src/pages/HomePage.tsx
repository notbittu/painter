import React, { useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container, 
  Typography, 
  Button,
  Grid,
  Paper, 
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  CameraAlt as CameraIcon, 
  Upload as UploadIcon, 
  Brush as BrushIcon,
  Palette as PaletteIcon,
  SaveAlt as SaveAltIcon,
  TouchApp as TouchAppIcon,
  FormatColorFill as FormatColorFillIcon
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Animation CSS keyframes
const animateBubble = `
@keyframes animate-bubble {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
    border-radius: 0;
  }
  100% {
    transform: translateY(-1000px) rotate(720deg);
    opacity: 0;
    border-radius: 50%;
  }
}
`;

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const animationRef = useRef<HTMLDivElement>(null);
  
  // Animation setup for floating bubbles
  useEffect(() => {
    const colors = ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
    const bubbleContainer = animationRef.current;
    
    if (bubbleContainer) {
      // Create bubble elements
      for (let i = 0; i < 15; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.cssText = `
          position: absolute;
          bottom: -100px;
          width: ${Math.random() * 40 + 20}px;
          height: ${Math.random() * 40 + 20}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: 50%;
          opacity: 0.4;
          animation: animate-bubble ${Math.random() * 10 + 15}s linear infinite;
          left: ${Math.random() * 100}%;
          animation-delay: ${Math.random() * 5}s;
        `;
        bubbleContainer.appendChild(bubble);
      }
    }
    
    // Cleanup
    return () => {
      if (bubbleContainer) {
        const bubbles = bubbleContainer.querySelectorAll('.bubble');
        bubbles.forEach(bubble => bubble.remove());
      }
    };
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background bubbles */}
      <Box
        ref={animationRef}
        sx={{
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          overflow: 'hidden',
          zIndex: -1,
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)',
          },
          '& .bubble': {
            animation: 'animate-bubble',
          },
        }}
      />
      
      {/* Global keyframes */}
      <style>{animateBubble}</style>
      
      <Header />
      
      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pt: { xs: 12, sm: 14 },
          pb: { xs: 8, sm: 10 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Hero Section */}
        <Box sx={{
          py: { xs: 8, md: 12 },
          position: 'relative',
          backgroundImage: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(236,72,153,0.1) 100%)',
          borderRadius: '24px',
          overflow: 'hidden',
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2,
                    position: 'relative',
                  }}
                >
                  Visualize Your Dream Walls
                </Typography>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ mb: 4, maxWidth: '600px', lineHeight: 1.5 }}
                >
                  Capture or upload photos of your walls and see exactly how they'll look with our AI-powered color visualizer
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/wall-painter"
                  startIcon={<FormatColorFillIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    backgroundImage: 'linear-gradient(90deg, #6366f1, #ec4899)',
                    boxShadow: '0 8px 16px rgba(236,72,153,0.3)',
                    '&:hover': {
                      boxShadow: '0 12px 20px rgba(236,72,153,0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Try Wall Visualizer
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Features Section */}
        <Box 
          sx={{ 
            py: 12,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '1px',
              height: '100%',
              background: 'linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.3), transparent)',
              display: { xs: 'none', md: 'block' },
            },
          }}
        >
          <Typography 
            variant="h2" 
            component="h3" 
            textAlign="center" 
            gutterBottom
            sx={{
              mb: 2,
              position: 'relative',
              display: 'inline-block',
              px: 4,
              background: 'linear-gradient(90deg, #6366f1, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mx: 'auto',
              width: 'fit-content',
            }}
          >
            Powerful Drawing Tools
          </Typography>
          
          <Typography
                variant="body1" 
                color="textSecondary" 
                textAlign="center" 
                sx={{ 
                  mb: 8,
                  maxWidth: '750px',
                  mx: 'auto',
                  fontSize: '1.1rem',
                }}
              >
                Everything you need to annotate and enhance your photos with an intuitive, easy-to-use interface
          </Typography>

          <Grid container spacing={5}>
            <Grid 
              item 
              xs={12} 
              md={4}
              sx={{
                opacity: 0,
                animation: 'fadeInUp 1s ease forwards',
              }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(240, 240, 250, 0.9)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    '& .icon-container': {
                      transform: 'scale(1.1)',
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '8px',
                    background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                    borderRadius: '24px 24px 0 0',
                  },
                }}
              >
                <Box 
                  className="icon-container"
                          sx={{
                    mb: 3, 
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(59, 130, 246, 0.1))',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <CameraIcon color="primary" sx={{ fontSize: 40 }} />
                    </Box>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                  }}
                >
                  Capture Images
                    </Typography>
                <Typography variant="body1" color="textSecondary" textAlign="center">
                  Take photos directly with your device camera or upload existing ones from your gallery
                    </Typography>
              </Paper>
            </Grid>
            
            <Grid 
              item 
              xs={12} 
              md={4}
              sx={{
                opacity: 0,
                animation: 'fadeInUp 1s ease forwards 0.3s',
              }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(240, 240, 250, 0.9)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    '& .icon-container': {
                      transform: 'scale(1.1)',
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '8px',
                    background: 'linear-gradient(90deg, #ec4899, #ef4444)',
                    borderRadius: '24px 24px 0 0',
                  },
                }}
              >
                <Box 
                  className="icon-container"
                  sx={{ 
                    mb: 3, 
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(239, 68, 68, 0.1))',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <BrushIcon sx={{ fontSize: 40, color: '#ec4899' }} />
        </Box>
      <Typography
                  variant="h5" 
                  component="h3" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: '#ec4899',
                  }}
                >
                  Creative Drawing
                </Typography>
                <Typography variant="body1" color="textSecondary" textAlign="center">
                  Use brushes of different sizes and vibrant colors to express your creativity exactly how you want
          </Typography>
              </Paper>
            </Grid>
            
            <Grid 
              item 
              xs={12} 
              md={4}
              sx={{
                opacity: 0,
                animation: 'fadeInUp 1s ease forwards 0.6s',
              }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(240, 240, 250, 0.9)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    '& .icon-container': {
                      transform: 'scale(1.1)',
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '8px',
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                    borderRadius: '24px 24px 0 0',
                  },
                }}
              >
                <Box 
                  className="icon-container"
                  sx={{ 
                    mb: 3, 
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <SaveAltIcon sx={{ fontSize: 40, color: '#10b981' }} />
                </Box>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: '#10b981',
                  }}
                >
                  Instant Saving
                  </Typography>
                <Typography variant="body1" color="textSecondary" textAlign="center">
                  Download your masterpiece instantly to share with friends or use in your projects
                  </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        {/* Call to Action */}
        <Box
          sx={{
            py: 10,
            textAlign: 'center',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 80px rgba(0, 0, 0, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 70%)',
              zIndex: -1,
            },
          }}
        >
          <Typography 
            variant="h3" 
            component="h3" 
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ready to Start Creating?
          </Typography>
          
          <Typography 
            variant="h6" 
      sx={{
              mb: 4, 
              maxWidth: 700, 
              mx: 'auto',
              color: theme.palette.text.secondary,
              fontWeight: 400,
            }}
          >
            Jump in and create your first masterpiece in seconds – no sign-up required!
            </Typography>
          
            <Button
            component={RouterLink}
            to="/editor"
              variant="contained"
            color="primary"
              size="large"
            startIcon={<PaletteIcon />}
              sx={{
              px: 6, 
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.3s ease',
                '&:hover': {
                boxShadow: '0 15px 30px rgba(99, 102, 241, 0.5)',
                transform: 'translateY(-5px) scale(1.05)',
                },
              }}
            >
            Open Editor Now
            </Button>
          
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TouchAppIcon sx={{ color: theme.palette.primary.main }} />
              <Typography variant="body2" color="textSecondary">Easy to Use</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaletteIcon sx={{ color: theme.palette.secondary.main }} />
              <Typography variant="body2" color="textSecondary">Vibrant Colors</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SaveAltIcon sx={{ color: '#10b981' }} />
              <Typography variant="body2" color="textSecondary">Save & Share</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default HomePage; 