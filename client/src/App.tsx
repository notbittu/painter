import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography, Button } from '@mui/material';
import ImageUpload from './components/ImageUpload';

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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom align="center" color="primary">
            Paint Home
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary">
            Visualize Wall Colors with AI
          </Typography>
          <ImageUpload />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 