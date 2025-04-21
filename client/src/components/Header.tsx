import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import {
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Badge,
  Chip,
  Link as RouterLink,
} from '@mui/material';
import { 
  Brush as BrushIcon, 
  FormatColorFill as FormatColorFillIcon,
  NewReleases as NewIcon,
  Close as CloseIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

const Header: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const isWallPainter = location.pathname.includes('/wall-painter');

  const handleNavigation = (path: string) => {
    navigate(path);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        <ListItem 
          button 
          onClick={() => handleNavigation('/')}
          sx={{ 
            py: 2,
            backgroundColor: location.pathname === '/' ? 'rgba(99,102,241,0.1)' : 'transparent',
            borderLeft: location.pathname === '/' ? '4px solid #6366f1' : '4px solid transparent',
            transition: 'all 0.3s ease'
          }}
        >
          <ListItemIcon>
            <HomeIcon color={location.pathname === '/' ? 'primary' : 'action'} />
          </ListItemIcon>
          <ListItemText 
            primary="Home" 
            primaryTypographyProps={{
              fontWeight: location.pathname === '/' ? 'bold' : 'normal'
            }}
          />
        </ListItem>
        <ListItem 
          button 
          onClick={() => handleNavigation('/wall-painter')}
          sx={{ 
            py: 2,
            backgroundColor: location.pathname === '/wall-painter' ? 'rgba(99,102,241,0.1)' : 'transparent',
            borderLeft: location.pathname === '/wall-painter' ? '4px solid #6366f1' : '4px solid transparent',
            transition: 'all 0.3s ease'
          }}
        >
          <ListItemIcon>
            <BrushIcon color={location.pathname === '/wall-painter' ? 'primary' : 'action'} />
          </ListItemIcon>
          <ListItemText 
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Wall Color Visualizer
                <Chip 
                  label="New" 
                  size="small" 
                  sx={{ 
                    ml: 1, 
                    height: 20, 
                    fontSize: '0.625rem',
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
            }
            primaryTypographyProps={{
              fontWeight: location.pathname === '/wall-painter' ? 'bold' : 'normal'
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(236,72,153,0.9) 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientAnimation 15s ease infinite',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        '@keyframes gradientAnimation': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              '&:hover': {
                '& svg': {
                  transform: 'rotate(360deg)',
                  transition: 'transform 1s ease-in-out',
                }
              }
            }}>
              <FormatColorFillIcon 
                sx={{ 
                  color: 'white',
                  mr: 1,
                  fontSize: '2rem',
                  transition: 'transform 0.5s ease-in-out',
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
                onClick={() => handleNavigation('/')}
              >
                PAINT HOME
              </Typography>
            </Box>
          </Zoom>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
            <Button
              onClick={() => handleNavigation('/')}
              sx={{ 
                color: 'white',
                fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                mx: 1,
                opacity: location.pathname === '/' ? 1 : 0.8,
                position: 'relative',
                '&:hover': { 
                  opacity: 1,
                  '&::after': {
                    width: '100%',
                  }
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: location.pathname === '/' ? '100%' : '0%',
                  height: '2px',
                  backgroundColor: 'white',
                  transition: 'width 0.3s ease',
                }
              }}
            >
              Home
            </Button>
            
            <Button
              onClick={() => handleNavigation('/wall-painter')}
              sx={{ 
                color: 'white',
                fontWeight: location.pathname === '/wall-painter' ? 'bold' : 'normal',
                mx: 1,
                display: 'flex',
                alignItems: 'center',
                opacity: location.pathname === '/wall-painter' ? 1 : 0.8,
                position: 'relative',
                '&:hover': { 
                  opacity: 1,
                  '&::after': {
                    width: '100%',
                  }
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: location.pathname === '/wall-painter' ? '100%' : '0%',
                  height: '2px',
                  backgroundColor: 'white',
                  transition: 'width 0.3s ease',
                }
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
                  fontWeight: 'bold',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)' },
                    '70%': { boxShadow: '0 0 0 5px rgba(255, 255, 255, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' },
                  }
                }} 
              />
            </Button>
          </Box>

          {isMobile ? (
            <IconButton
              size="large"
              aria-label="menu"
              color="inherit"
              sx={{ 
                ml: 'auto',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Fade in={true} style={{ transitionDelay: '200ms' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => handleNavigation('/wall-painter')}
                  sx={{ 
                    borderRadius: '20px',
                    px: 2.5,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    bgcolor: 'white',
                    color: 'primary.main',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  <BrushIcon sx={{ mr: 1 }} />
                  Try Wall Visualizer
                  <ChevronRightIcon sx={{ ml: 0.5 }} />
                </Button>
              </Box>
            </Fade>
          )}
        </Toolbar>
      </Container>
      
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            width: 250,
            borderTopLeftRadius: '12px',
            borderBottomLeftRadius: '12px',
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header; 