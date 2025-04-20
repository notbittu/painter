import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, Pinterest, YouTube } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        p: 6,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" color="primary" gutterBottom>
              PAINTER
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Transform your space with premium quality paints and expert color solutions.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="primary" aria-label="facebook">
                <Facebook />
              </IconButton>
              <IconButton color="primary" aria-label="twitter">
                <Twitter />
              </IconButton>
              <IconButton color="primary" aria-label="instagram">
                <Instagram />
              </IconButton>
              <IconButton color="primary" aria-label="pinterest">
                <Pinterest />
              </IconButton>
              <IconButton color="primary" aria-label="youtube">
                <YouTube />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Products
            </Typography>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Interior Paints
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Exterior Paints
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Wall Primers
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Wood Finishes
            </Link>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Tools
            </Typography>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Color Picker
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Room Visualizer
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Color Collections
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Paint Calculator
            </Link>
          </Grid>
          
          <Grid item xs={6} sm={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Support
            </Typography>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              FAQs
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Contact Us
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Find a Store
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Painting Tips
            </Link>
          </Grid>
          
          <Grid item xs={6} sm={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Privacy Policy
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Terms of Use
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Cookie Policy
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1 }}>
              Sitemap
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ mt: 6, mb: 4 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          &copy; {new Date().getFullYear()} Painter. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 