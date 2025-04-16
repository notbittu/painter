import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ImagePreview({ originalImage, coloredImage, onReset }) {
  const [view, setView] = useState('original');
  
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        flexGrow: 1,
        flexBasis: '50%'
      }}
    >
      <Box sx={{ width: '100%', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Wall Preview</Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={onReset}
          size="small"
        >
          New Image
        </Button>
      </Box>
      
      <Box className="image-container" sx={{ mb: 2, width: '100%', textAlign: 'center' }}>
        {/* Original Image */}
        <img 
          src={originalImage} 
          alt="Original Wall" 
          style={{ 
            display: view === 'original' ? 'inline-block' : 'none',
            maxWidth: '100%',
            maxHeight: '60vh'
          }} 
        />
        
        {/* Colored Image */}
        <img 
          src={coloredImage} 
          alt="Colored Wall" 
          style={{ 
            display: view === 'colored' && coloredImage ? 'inline-block' : 'none',
            maxWidth: '100%',
            maxHeight: '60vh'
          }} 
        />
        
        {/* Show placeholder if colored view selected but no colored image yet */}
        {view === 'colored' && !coloredImage && (
          <Box sx={{ 
            p: 4, 
            border: '1px dashed #ccc', 
            borderRadius: 1,
            backgroundColor: '#f9f9f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}>
            <Typography color="textSecondary">
              Apply a color to see preview
            </Typography>
          </Box>
        )}
      </Box>
      
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={handleViewChange}
        aria-label="image view"
        size="small"
      >
        <ToggleButton value="original" aria-label="original view">
          Original
        </ToggleButton>
        <ToggleButton 
          value="colored" 
          aria-label="colored view" 
          disabled={!coloredImage}
        >
          Colored
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
}

export default ImagePreview; 