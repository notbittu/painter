import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  IconButton, 
  Tooltip, 
  Slider, 
  Typography,
  Button,
  Drawer,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Brush as BrushIcon,
  ColorLens as ColorLensIcon,
  Delete as DeleteIcon,
  Undo as UndoIcon, 
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Photo as PhotoIcon,
  CameraAlt as CameraIcon,
  Upload as UploadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Stage, Layer, Line } from 'react-konva';
import Webcam from 'react-webcam';
import { HexColorPicker } from 'react-colorful';
import { useError } from '../context/ErrorContext';
import { DrawingSettings, CanvasState } from '../types';
import { downloadImage, mergeImageWithCanvas, resizeImage, isMobile, generateId } from '../utils/helpers';
import Footer from '../components/Footer';
import Header from '../components/Header';

const EditorPage: React.FC = () => {
  const { mode } = useParams<{ mode?: string }>();
  const navigate = useNavigate();
  const { setError } = useError();
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Refs
  const stageRef = useRef<any>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(mode === 'camera');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(!isMobileDevice);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  
  const [canvasState, setCanvasState] = useState<CanvasState>({
    lines: [],
    currentLine: null
  });
  
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
    color: '#ff0000',
    brushSize: 5,
    tool: 'brush'
  });
  
  // Canvas dimensions
  const [canvasDimensions, setCanvasDimensions] = useState<{width: number, height: number}>({
    width: 800,
    height: 600
  });
  
  // Set up canvas dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setCanvasDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [image]);
  
  // Handle camera mode on mount
  useEffect(() => {
    if (mode === 'camera') {
      setShowCamera(true);
    } else if (mode === 'upload') {
      handleFileUploadClick();
    }
  }, [mode]);
  
  // Mouse/touch handlers for drawing
  const handleMouseDown = (e: any) => {
    if (!image) return;
    
    const pos = e.target.getStage().getPointerPosition();
    setCanvasState({
      ...canvasState,
      currentLine: {
        tool: drawingSettings.tool,
        points: [pos.x, pos.y],
        color: drawingSettings.color,
        brushSize: drawingSettings.brushSize
      }
    });
  };
  
  const handleMouseMove = (e: any) => {
    if (!canvasState.currentLine) return;
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    const updatedCurrentLine = {
      ...canvasState.currentLine,
      points: [...canvasState.currentLine.points, point.x, point.y]
    };
    
    setCanvasState({
      ...canvasState,
      currentLine: updatedCurrentLine
    });
  };
  
  const handleMouseUp = () => {
    if (!canvasState.currentLine) return;
    
    setCanvasState({
      lines: [...canvasState.lines, canvasState.currentLine],
      currentLine: null
    });
  };
  
  // Camera handlers
  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImage(imageSrc);
        setShowCamera(false);
      } else {
        setError({
          message: 'Failed to capture image. Please try again.'
        });
      }
    }
  };
  
  // File upload handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target?.result) {
            // Resize the image to improve performance
            const resizedImage = await resizeImage(event.target.result as string);
            setImage(resizedImage);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setError({
          message: 'Failed to load image. Please try a different file.'
        });
      }
    }
  };
  
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Drawing tool handlers
  const handleColorChange = (color: string) => {
    setDrawingSettings({
      ...drawingSettings,
      color
    });
  };
  
  const handleBrushSizeChange = (_: Event, newValue: number | number[]) => {
    setDrawingSettings({
      ...drawingSettings,
      brushSize: newValue as number
    });
  };
  
  const handleUndo = () => {
    const newLines = [...canvasState.lines];
    newLines.pop();
    setCanvasState({
      ...canvasState,
      lines: newLines
    });
  };
  
  const handleClear = () => {
    setCanvasState({
      lines: [],
      currentLine: null
    });
  };
  
  // Save handlers
  const handleSave = () => {
    if (!image || !stageRef.current) return;
    
    try {
      // Get canvas as data URL
      const drawingCanvas = stageRef.current.toCanvas();
      const drawingDataUrl = drawingCanvas.toDataURL();
      
      // Merge drawing with the original image
      mergeImageWithCanvas(image, drawingDataUrl, (mergedImageDataUrl) => {
        downloadImage(mergedImageDataUrl, `painted-image-${generateId()}.png`);
        setShowSaveDialog(false);
      });
    } catch (error) {
      setError({
        message: 'Failed to save image. Please try again.'
      });
    }
  };
  
  const handleSaveOriginalImage = () => {
    if (image) {
      downloadImage(image, `original-image-${generateId()}.png`);
      setShowSaveDialog(false);
    }
  };
  
  // Fullscreen handling
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Toolbar component for drawing tools
  const DrawingToolbar = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Drawing Tools
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Brush Color
        </Typography>
        <Box 
          sx={{ 
            width: '100%', 
            height: 40, 
            bgcolor: drawingSettings.color, 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            mb: 1,
            cursor: 'pointer'
          }}
          onClick={() => setShowColorPicker(!showColorPicker)}
        />
        {showColorPicker && (
          <Box sx={{ mb: 2 }}>
            <HexColorPicker color={drawingSettings.color} onChange={handleColorChange} />
          </Box>
        )}
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Brush Size
        </Typography>
        <Slider
          value={drawingSettings.brushSize}
          onChange={handleBrushSizeChange}
          min={1}
          max={30}
          valueLabelDisplay="auto"
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Tools
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Brush">
            <Button
              variant={drawingSettings.tool === 'brush' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setDrawingSettings({ ...drawingSettings, tool: 'brush' })}
              startIcon={<BrushIcon />}
              sx={{ flexGrow: 1 }}
            >
              Brush
            </Button>
          </Tooltip>
          <Tooltip title="Eraser">
            <Button
              variant={drawingSettings.tool === 'eraser' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setDrawingSettings({ ...drawingSettings, tool: 'eraser' })}
              startIcon={<DeleteIcon />}
              sx={{ flexGrow: 1 }}
            >
              Eraser
            </Button>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Undo">
            <Button
              variant="outlined"
              color="primary"
              onClick={handleUndo}
              disabled={canvasState.lines.length === 0}
              startIcon={<UndoIcon />}
              sx={{ flexGrow: 1 }}
            >
              Undo
            </Button>
          </Tooltip>
          <Tooltip title="Clear">
            <Button
              variant="outlined"
              color="primary"
              onClick={handleClear}
              disabled={canvasState.lines.length === 0}
              startIcon={<DeleteIcon />}
              sx={{ flexGrow: 1 }}
            >
              Clear
            </Button>
          </Tooltip>
        </Box>
      </Box>
      
      <Box>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => setShowSaveDialog(true)}
          startIcon={<SaveIcon />}
          disabled={!image}
          sx={{ mb: 1 }}
        >
          Save Drawing
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={() => {
            setImage(null);
            setCanvasState({ lines: [], currentLine: null });
            setShowCamera(false);
          }}
          startIcon={<ArrowBackIcon />}
        >
          New Drawing
        </Button>
      </Box>
    </Box>
  );
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {!isFullscreen && <Header />}
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          pt: isFullscreen ? 0 : { xs: 8, sm: 10 },
          pb: isFullscreen ? 0 : { xs: 2, sm: 3 } 
        }}
      >
        {isFullscreen ? (
          <AppBar position="fixed" color="default" elevation={0}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={toggleFullscreen}>
                <FullscreenExitIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
                Editor (Fullscreen)
              </Typography>
              <IconButton
                color="primary"
                onClick={() => setDrawerOpen(!drawerOpen)}
              >
                <BrushIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        ) : (
          <Container maxWidth="xl" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1">
                Image Editor
              </Typography>
              <Box>
                <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                  <IconButton onClick={toggleFullscreen} color="primary">
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>
                {isMobileDevice && (
                  <Tooltip title="Show Tools">
                    <IconButton
                      color="primary"
                      onClick={() => setDrawerOpen(!drawerOpen)}
                    >
                      <BrushIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Container>
        )}
        
        <Container 
          maxWidth="xl" 
          sx={{ 
            flexGrow: 1, 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            height: '100%',
            p: isFullscreen ? 0 : undefined
          }}
        >
          {/* Main Content Area */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              height: { xs: 'calc(100vh - 200px)', md: 'auto' }
            }}
          >
            {/* No Image / Start Options */}
            {!image && !showCamera && (
              <Paper 
                sx={{ 
                  p: 4, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Typography variant="h5" component="h2" gutterBottom textAlign="center">
                  Get Started
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph textAlign="center">
                  Take a photo or upload an image to start drawing
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CameraIcon />}
                    onClick={() => setShowCamera(true)}
                    sx={{ minWidth: 180 }}
                  >
                    Use Camera
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<UploadIcon />}
                    onClick={handleFileUploadClick}
                    sx={{ minWidth: 180 }}
                  >
                    Upload Image
                  </Button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </Box>
              </Paper>
            )}
            
            {/* Camera View */}
            {showCamera && (
              <Paper 
                sx={{ 
                  p: 2, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    maxWidth: 800,
                    maxHeight: 600,
                    mx: 'auto',
                    overflow: 'hidden',
                    borderRadius: 1,
                    bgcolor: 'black'
                  }}
                >
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: "environment"
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCapture}
                      startIcon={<PhotoIcon />}
                    >
                      Capture Photo
                    </Button>
                  </Box>
                  
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'background.paper',
                      }
                    }}
                    onClick={() => setShowCamera(false)}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Paper>
            )}
            
            {/* Drawing Canvas */}
            {image && (
              <Paper 
                sx={{ 
                  p: 0, 
                  height: '100%', 
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 1,
                }}
                id="canvas-container"
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <Stage
                    width={canvasDimensions.width}
                    height={canvasDimensions.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    ref={stageRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Layer>
                      {/* Render previous lines */}
                      {canvasState.lines.map((line, i) => (
                        <Line
                          key={i}
                          points={line.points}
                          stroke={line.tool === 'eraser' ? '#ffffff' : line.color}
                          strokeWidth={line.brushSize}
                          tension={0.5}
                          lineCap="round"
                          lineJoin="round"
                          globalCompositeOperation={
                            line.tool === 'eraser' ? 'destination-out' : 'source-over'
                          }
                        />
                      ))}
                      
                      {/* Render current line */}
                      {canvasState.currentLine && (
                        <Line
                          points={canvasState.currentLine.points}
                          stroke={canvasState.currentLine.tool === 'eraser' ? '#ffffff' : canvasState.currentLine.color}
                          strokeWidth={canvasState.currentLine.brushSize}
                          tension={0.5}
                          lineCap="round"
                          lineJoin="round"
                          globalCompositeOperation={
                            canvasState.currentLine.tool === 'eraser' ? 'destination-out' : 'source-over'
                          }
                        />
                      )}
                    </Layer>
                  </Stage>
                </Box>
              </Paper>
            )}
          </Box>
          
          {/* Drawing Tools Panel */}
          {isMobileDevice ? (
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{
                sx: { width: '80%', maxWidth: 320 }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={() => setDrawerOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <DrawingToolbar />
            </Drawer>
          ) : (
            <Paper
              sx={{
                width: drawerOpen ? 300 : 0,
                ml: 2,
                overflow: 'hidden',
                display: drawerOpen ? 'block' : 'none',
                height: '100%',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              }}
            >
              <DrawingToolbar />
            </Paper>
          )}
          
          {/* Save Dialog */}
          <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
            <DialogTitle>Save Image</DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                Choose what you want to save:
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                onClick={handleSave}
                startIcon={<SaveIcon />}
              >
                Save with Drawing
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth 
                onClick={handleSaveOriginalImage}
                startIcon={<PhotoIcon />}
              >
                Save Original Image
              </Button>
              <Button 
                variant="text" 
                color="inherit" 
                fullWidth 
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
      
      {!isFullscreen && <Footer />}
    </Box>
  );
};

export default EditorPage; 