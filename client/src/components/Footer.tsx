import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Painter
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create beautiful drawings on your photos with our easy-to-use painting tools.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                component={RouterLink}
                to="/"
                color="text.secondary"
                sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Home
              </Link>
              <Link
                component={RouterLink}
                to="/editor"
                color="text.secondary"
                sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Editor
              </Link>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} Painter. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 