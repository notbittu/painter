import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFoundPage: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          alignItems: 'center', 
          pt: { xs: 10, sm: 12 },
          pb: { xs: 6, sm: 8 } 
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '5rem', sm: '8rem' },
              fontWeight: 700,
              color: 'primary.main',
              mb: 2,
            }}
          >
            404
          </Typography>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
          >
            Page Not Found
          </Typography>
          <Typography 
            variant="body1" 
            color="textSecondary" 
            sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
          >
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
            startIcon={<HomeIcon />}
            size="large"
            sx={{ px: 4, py: 1.5 }}
          >
            Back to Home
          </Button>
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default NotFoundPage; 