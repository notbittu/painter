import React, { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Button,
  Badge,
  Container,
  Chip,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Brush as BrushIcon, 
  Home as HomeIcon,
  FormatColorFill as FormatColorFillIcon,
  NewReleases as NewIcon
} from '@mui/icons-material';

const Header: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const isEditor = location.pathname.includes('/editor');
  const isWallPainter = location.pathname.includes('/wall-painter');
  
  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormatColorFillIcon 
              sx={{ 
                color: 'primary.main',
                mr: 1,
                fontSize: '2rem'
              }} 
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'primary.main',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            >
              PAINT HOME
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
            <Button
              onClick={() => navigate('/')}
              sx={{ 
                color: location.pathname === '/' ? 'primary.main' : 'text.primary',
                fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                mx: 1
              }}
            >
              Home
            </Button>
            
            <Button
              onClick={() => navigate('/wall-painter')}
              sx={{ 
                color: location.pathname === '/wall-painter' ? 'primary.main' : 'text.primary',
                fontWeight: location.pathname === '/wall-painter' ? 'bold' : 'normal',
                mx: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Wall Color Visualizer
              <Chip 
                label="New" 
                size="small" 
                color="primary" 
                sx={{ ml: 1, height: 20, fontSize: '0.625rem' }} 
              />
            </Button>
            
            <Button
              onClick={() => navigate('/color-gallery')}
              sx={{ 
                color: location.pathname === '/color-gallery' ? 'primary.main' : 'text.primary',
                fontWeight: location.pathname === '/color-gallery' ? 'bold' : 'normal',
                mx: 1
              }}
            >
              Color Gallery
            </Button>
          </Box>

          {isMobile ? (
            <IconButton 
              size="large"
              aria-label="menu"
              color="inherit"
              sx={{ ml: 'auto' }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FormatColorFillIcon />}
                onClick={() => navigate('/wall-painter')}
                sx={{ 
                  borderRadius: '20px',
                  px: 2.5,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                Try Wall Visualizer
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 