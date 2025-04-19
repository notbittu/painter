import React, { useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ImageUpload: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h6" component="h3" gutterBottom>
        Upload Your Wall Image
      </Typography>
      <Box
        sx={{
          width: '100%',
          height: 300,
          border: '2px dashed #ccc',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fafafa',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: '#f0f0f0',
          },
        }}
      >
        {image ? (
          <img
            src={image}
            alt="Uploaded"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Drag and drop your image here, or click to select
            </Typography>
          </>
        )}
      </Box>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
        id="image-upload"
      />
      <label htmlFor="image-upload">
        <Button variant="contained" component="span">
          Select Image
        </Button>
      </label>
    </Paper>
  );
};

export default ImageUpload; 