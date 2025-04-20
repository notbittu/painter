import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
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
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Brush as BrushIcon, 
  Home as HomeIcon,
  FormatColorFill as WallPainterIcon,
  NewReleases as NewIcon
} from '@mui/icons-material';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
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
      position="fixed" 
      color="default" 
      elevation={0}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <BrushIcon color="primary" sx={{ mr: 1 }} />
          <Typography 
            variant="h6" 
            color="textPrimary" 
            sx={{ 
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Painter
          </Typography>
        </RouterLink>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              keepMounted
            >
              <MenuItem 
                component={RouterLink} 
                to="/"
                onClick={handleMenuClose}
                selected={location.pathname === '/'}
              >
                <HomeIcon fontSize="small" sx={{ mr: 1 }} />
                Home
              </MenuItem>
              <MenuItem 
                component={RouterLink} 
                to="/editor"
                onClick={handleMenuClose}
                selected={isEditor}
              >
                <BrushIcon fontSize="small" sx={{ mr: 1 }} />
                Editor
              </MenuItem>
              <MenuItem 
                component={RouterLink} 
                to="/wall-painter"
                onClick={handleMenuClose}
                selected={isWallPainter}
              >
                <WallPainterIcon fontSize="small" sx={{ mr: 1 }} />
                Wall Painter
                <NewIcon 
                  sx={{ 
                    ml: 0.5, 
                    color: theme.palette.secondary.main, 
                    fontSize: '0.8rem'
                  }} 
                />
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component={RouterLink}
              to="/"
              color={location.pathname === '/' ? 'primary' : 'inherit'}
              startIcon={<HomeIcon />}
              sx={{ 
                fontWeight: location.pathname === '/' ? 600 : 400,
                borderRadius: '8px',
              }}
            >
              Home
            </Button>
            <Button
              component={RouterLink}
              to="/editor"
              color={isEditor ? 'primary' : 'inherit'}
              startIcon={<BrushIcon />}
              sx={{ 
                fontWeight: isEditor ? 600 : 400,
                borderRadius: '8px',
              }}
            >
              Editor
            </Button>
            <Button
              component={RouterLink}
              to="/wall-painter"
              color={isWallPainter ? 'primary' : 'inherit'}
              startIcon={
                <Badge
                  badgeContent={
                    <NewIcon sx={{ fontSize: '0.8rem', color: theme.palette.secondary.main }} />
                  }
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: 'transparent',
                      transform: 'scale(0.8) translate(50%, -50%)',
                    }
                  }}
                >
                  <WallPainterIcon />
                </Badge>
              }
              sx={{ 
                fontWeight: isWallPainter ? 600 : 400,
                borderRadius: '8px',
                position: 'relative',
                '&::after': isWallPainter ? {} : {
                  content: '""',
                  position: 'absolute',
                  bottom: 6,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                  borderRadius: '2px',
                  transform: 'scaleX(0.8)',
                  opacity: 0.8,
                }
              }}
            >
              Wall Painter
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 