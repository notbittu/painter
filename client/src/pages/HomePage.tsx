import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import WallpaperIcon from '@mui/icons-material/Wallpaper';

// Sample colors for trending palettes
const trendingColors = [
  ['#F3F8FF', '#DEECFF', '#C6CFFF', '#E8D3FF'],
  ['#97FEED', '#43919B', '#73A9AD', '#BDD9BF'],
  ['#E29578', '#FFDDD2', '#EDF6F9', '#83C5BE'],
  ['#5F0F40', '#9A031E', '#FB8B24', '#E36414'],
];

// Sample room images
const roomImages = [
  {
    title: 'Modern Living Room',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format',
    description: 'Minimalist design with neutral tones and subtle accents.',
  },
  {
    title: 'Cozy Bedroom',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500&auto=format',
    description: 'Warm colors create a perfect sanctuary for relaxation.',
  },
  {
    title: 'Elegant Kitchen',
    image: 'https://images.unsplash.com/photo-1556912998-c57cc6b63cd7?w=500&auto=format',
    description: 'Bold colors balance with bright spaces for a modern look.',
  },
];

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '80vh',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: 'url(https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
        }}
      >
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '4rem' },
              maxWidth: '800px',
              mb: 2,
            }}
          >
            Transform Your Space With Perfect Colors
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{
              maxWidth: '600px',
              mb: 4,
            }}
          >
            Discover premium paints and expert color solutions for your home
          </Typography>
          <Box>
            <Button
              variant="contained"
              size="large"
              color="primary"
              sx={{ mr: 2, px: 4, py: 1.5 }}
              onClick={() => navigate('/room-visualizer')}
            >
              Try Room Visualizer
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ px: 4, py: 1.5, borderColor: 'white', color: 'white' }}
              onClick={() => navigate('/color-picker')}
            >
              Explore Colors
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <FormatPaintIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Premium Paint Collection
              </Typography>
              <Typography variant="body1" color="text.secondary">
                High-quality paints that provide excellent coverage, durability, and vibrant colors that last for years.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <ColorLensIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Expert Color Matching
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Advanced color technology to help you find the perfect shade or match an existing color with precision.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <WallpaperIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Virtual Room Visualizer
              </Typography>
              <Typography variant="body1" color="text.secondary">
                See how colors look in your space before you paint with our cutting-edge visualization technology.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Trending Colors Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container>
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Trending Color Palettes
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            align="center"
            sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
          >
            Discover the latest color trends and find inspiration for your next painting project.
          </Typography>

          <Grid container spacing={4}>
            {trendingColors.map((palette, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                  <CardActionArea>
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        {palette.map((color, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 50,
                              height: 50,
                              bgcolor: color,
                              borderRadius: i === 0 ? '8px 0 0 8px' : i === palette.length - 1 ? '0 8px 8px 0' : 0,
                              border: `1px solid ${theme.palette.divider}`,
                              ml: i > 0 ? '-1px' : 0,
                            }}
                          />
                        ))}
                      </Box>
                      <Typography variant="h6" component="h3">
                        {index === 0
                          ? 'Serene Blues'
                          : index === 1
                          ? 'Coastal Greens'
                          : index === 2
                          ? 'Sunset Pastels'
                          : 'Vibrant Warmth'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {index === 0
                          ? 'Calming blues for bedrooms and offices'
                          : index === 1
                          ? 'Fresh greens inspired by nature'
                          : index === 2
                          ? 'Soft tones for living spaces'
                          : 'Bold accents for statement walls'}
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Room Inspiration Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Room Inspiration Gallery
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          align="center"
          sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
        >
          Explore beautiful room designs and find ideas for your own space.
        </Typography>

        <Grid container spacing={4}>
          {roomImages.map((room, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="240"
                    image={room.image}
                    alt={room.title}
                  />
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {room.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {room.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/inspirations')}
          >
            View More Inspirations
          </Button>
        </Box>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mt: 4,
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" component="h2" gutterBottom>
                Ready to transform your space?
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 2, opacity: 0.9 }}>
                Try our virtual room visualizer today and see how different colors look in your own space.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                }}
                onClick={() => navigate('/room-visualizer')}
              >
                Get Started Now
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 