import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import FormattedColorIcon from '@mui/icons-material/FormatColorFill';
import Box from '@mui/material/Box';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormattedColorIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            Paint Home
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 