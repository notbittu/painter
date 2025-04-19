import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Paper from '@mui/material/Paper';
import axios from 'axios';

function ImageUploader({ onImageUploaded, isLoading, setIsLoading }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.type.match('image.*')) {
      alert('Please select an image file.');
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/scan', formData);
      if (response.data.success) {
        onImageUploaded(
          file.name, 
          response.data.filepath, 
          response.data.suggested_colors
        );
      } else {
        alert(response.data.error || 'Error processing image.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCamera = async () => {
    if (!showCamera) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setShowCamera(true);
      } catch (error) {
        console.error('Camera access error:', error);
        alert('Could not access camera. Please check permissions.');
      }
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      // Create a File object from the blob
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      
      // Process the captured image
      handleFile(file);
      
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setShowCamera(false);
    }, 'image/jpeg');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload or Capture a Wall Photo
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Get AI-powered color suggestions for your wall
        </Typography>
      </Box>

      <Box
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          backgroundColor: isDragging ? 'rgba(74, 109, 167, 0.05)' : 'transparent',
          mb: 3,
          display: showCamera ? 'none' : 'block'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <CloudUploadIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag & Drop Image Here
        </Typography>
        <Typography color="textSecondary" paragraph>
          or click to browse
        </Typography>
        <Button variant="contained" color="primary">
          Choose File
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', display: showCamera ? 'block' : 'none' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} 
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={capturePhoto}
          >
            Capture Photo
          </Button>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Typography sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
          OR
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<PhotoCameraIcon />}
          onClick={toggleCamera}
          sx={{ mt: 1 }}
        >
          {showCamera ? 'Cancel' : 'Take Photo with Camera'}
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
}

export default ImageUploader; 