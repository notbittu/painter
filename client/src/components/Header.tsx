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
  
  const isWallPainter = location.pathname.includes('/wall-painter');

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(236,72,153,0.9) 100%)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormatColorFillIcon 
              sx={{ 
                color: 'white',
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
                color: 'white',
              textDecoration: 'none',
                cursor: 'pointer',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -3,
                  left: 0,
                  width: '100%',
                  height: 3,
                  background: 'linear-gradient(90deg, #ffffff, rgba(255,255,255,0.5), #ffffff)',
                  backgroundSize: '200% 100%',
                  animation: 'shine 3s infinite linear',
                },
                '@keyframes shine': {
                  '0%': { backgroundPosition: '-100% 0' },
                  '100%': { backgroundPosition: '100% 0' },
                },
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
                color: 'white',
                fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                mx: 1,
                opacity: location.pathname === '/' ? 1 : 0.8,
                '&:hover': { opacity: 1 }
              }}
            >
              Home
            </Button>
            
            <Button
              onClick={() => navigate('/wall-painter')}
              sx={{ 
                color: 'white',
                fontWeight: location.pathname === '/wall-painter' ? 'bold' : 'normal',
                mx: 1,
                display: 'flex',
                alignItems: 'center',
                opacity: location.pathname === '/wall-painter' ? 1 : 0.8,
                '&:hover': { opacity: 1 }
              }}
            >
              Wall Color Visualizer
              <Chip 
                label="New" 
                size="small" 
                sx={{ 
                  ml: 1, 
                  height: 20, 
                  fontSize: '0.625rem',
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 'bold'
                }} 
              />
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
                onClick={() => navigate('/wall-painter')}
                sx={{ 
                  borderRadius: '20px',
                  px: 2.5,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  }
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