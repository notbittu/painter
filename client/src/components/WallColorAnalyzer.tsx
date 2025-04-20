import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Grid,
  Chip,
  Card,
  CardContent,
  useTheme,
  Tooltip,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Alert,
  Divider,
  Tabs,
  Tab,
  Fade,
  Grow
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Upload as UploadIcon,
  ColorLens as ColorLensIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon,
  Image as ImageIcon,
  FormatColorFill as FormatColorFillIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import Webcam from 'react-webcam';
import ColorSuggestionService, { ColorSuggestion, ColorAnalysisResult } from '../services/ColorSuggestionService';
import { generateId } from '../utils/helpers';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wall-color-tabpanel-${index}`}
      aria-labelledby={`wall-color-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface WallColorAnalyzerProps {
  onColorSelect?: (color: ColorSuggestion) => void;
}

const WallColorAnalyzer: React.FC<WallColorAnalyzerProps> = ({ onColorSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [wallImage, setWallImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [colorResult, setColorResult] = useState<ColorAnalysisResult | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorSuggestion | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showColorDetails, setShowColorDetails] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Handle camera capture
  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setWallImage(imageSrc);
        setShowCamera(false);
        analyzeWallImage(imageSrc);
      } else {
        setError('Failed to capture image. Please try again.');
      }
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target?.result) {
            const imageData = event.target.result as string;
            setWallImage(imageData);
            analyzeWallImage(imageData);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setError('Failed to load image. Please try a different file.');
      }
    }
  };
  
  // Trigger file upload click
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Analyze wall image
  const analyzeWallImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await ColorSuggestionService.analyzeWallImage(imageData);
      setColorResult(result);
    } catch (err) {
      setError('Failed to analyze the wall. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle color selection
  const handleColorSelect = (color: ColorSuggestion) => {
    setSelectedColor(color);
    if (onColorSelect) {
      onColorSelect(color);
    }
    
    // Generate preview
    if (wallImage) {
      generatePreview(color);
    }
  };
  
  // Generate wall preview with selected color
  const generatePreview = async (color: ColorSuggestion) => {
    if (!wallImage) return;
    
    try {
      setIsAnalyzing(true);
      const preview = await ColorSuggestionService.generateColorPreview(wallImage, color.hexCode);
      setPreviewImage(preview);
    } catch (err) {
      setError('Failed to generate preview. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Copy color code to clipboard
  const copyColorCode = (colorCode: string) => {
    navigator.clipboard.writeText(colorCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Reset everything
  const resetAnalyzer = () => {
    setWallImage(null);
    setColorResult(null);
    setSelectedColor(null);
    setPreviewImage(null);
    setShowColorDetails(false);
    setTabValue(0);
    setError(null);
  };
  
  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      {!wallImage && !showCamera && (
        <Grow in={!wallImage && !showCamera}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(240, 240, 250, 0.9)',
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
                borderRadius: '50%',
                zIndex: 0,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '100px',
                height: '100px',
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1), transparent 70%)',
                borderRadius: '50%',
                zIndex: 0,
              }
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom
              sx={{
                background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                mb: 3
              }}
            >
              Wall Color Analyzer
            </Typography>
            
            <Typography variant="body1" color="textSecondary" paragraph>
              Take a photo of your wall or upload an image to get AI-powered color suggestions
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CameraIcon />}
                onClick={() => setShowCamera(true)}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  backgroundImage: 'linear-gradient(to right, #6366f1, #ec4899)',
                  boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    boxShadow: '0 12px 20px rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Take Photo
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<UploadIcon />}
                onClick={handleFileUploadClick}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 10px rgba(0, 0, 0, 0.08)',
                  },
                  transition: 'all 0.3s ease',
                }}
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
        </Grow>
      )}
      
      {showCamera && (
        <Fade in={showCamera}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: '24px',
              height: isMobile ? 400 : 500,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: '#000',
                borderRadius: '16px',
                overflow: 'hidden',
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
                  objectFit: 'cover',
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
                  startIcon={<CameraIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: '12px',
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.9)',
                    },
                  }}
                >
                  Capture Wall
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
        </Fade>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2, mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {wallImage && !isAnalyzing && colorResult && (
        <Box sx={{ mt: 3 }}>
          <Paper
            elevation={3}
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="wall color analysis tabs"
                variant={isMobile ? "fullWidth" : "standard"}
                sx={{ 
                  '& .MuiTab-root': {
                    transition: 'all 0.3s ease',
                    fontWeight: 500,
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  },
                  '& .Mui-selected': {
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                  }
                }}
              >
                <Tab 
                  icon={<ImageIcon />} 
                  iconPosition="start" 
                  label="Wall Image" 
                  id="wall-color-tab-0" 
                  aria-controls="wall-color-tabpanel-0" 
                />
                <Tab 
                  icon={<ColorLensIcon />} 
                  iconPosition="start" 
                  label="Color Suggestions" 
                  id="wall-color-tab-1" 
                  aria-controls="wall-color-tabpanel-1" 
                />
                <Tab 
                  icon={<FormatColorFillIcon />} 
                  iconPosition="start" 
                  label="Preview" 
                  id="wall-color-tab-2" 
                  aria-controls="wall-color-tabpanel-2" 
                  disabled={!selectedColor || !previewImage}
                />
              </Tabs>
            </Box>
            
            {/* Wall Image Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ position: 'relative', width: '100%', mb: 2 }}>
                <Box
                  component="img"
                  src={wallImage}
                  alt="Wall"
                  sx={{
                    width: '100%',
                    borderRadius: '12px',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                  }}
                />
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CameraIcon />}
                    onClick={() => {
                      resetAnalyzer();
                      setShowCamera(true);
                    }}
                  >
                    Take New Photo
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setTabValue(1)}
                    endIcon={<ColorLensIcon />}
                  >
                    View Color Suggestions
                  </Button>
                </Box>
              </Box>
            </TabPanel>
            
            {/* Color Suggestions Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom fontWeight="500">
                Recommended Colors for Your Wall
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500" color="primary">
                  Dominant Colors
                </Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {colorResult.dominantColors.map((color, index) => (
                    <Grid item key={`dominant-${index}`}>
                      <Tooltip title={color.name}>
                        <Chip
                          label={color.name}
                          onClick={() => handleColorSelect(color)}
                          sx={{
                            bgcolor: color.hexCode,
                            color: getContrastColor(color.hexCode),
                            '&:hover': {
                              opacity: 0.9,
                              transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s ease',
                            borderRadius: '8px',
                            border: selectedColor?.hexCode === color.hexCode ?
                              `2px solid ${theme.palette.primary.main}` : 'none',
                            fontWeight: selectedColor?.hexCode === color.hexCode ? 'bold' : 'normal',
                            height: '36px',
                            cursor: 'pointer',
                          }}
                        />
                      </Tooltip>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              <Typography variant="h6" gutterBottom fontWeight="500">
                Suggested Color Palettes
              </Typography>
              
              <Grid container spacing={3}>
                {colorResult.suggestedPalettes.map((palette, paletteIndex) => (
                  <Grid item xs={12} md={4} key={`palette-${paletteIndex}`}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: '16px',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          height: '16px'
                        }}
                      >
                        {palette.colors.map((color, colorIndex) => (
                          <Box
                            key={`palette-${paletteIndex}-color-${colorIndex}`}
                            sx={{
                              height: '16px',
                              flexGrow: 1,
                              backgroundColor: color.hexCode,
                              '&:first-of-type': {
                                borderTopLeftRadius: '16px',
                              },
                              '&:last-child': {
                                borderTopRightRadius: '16px',
                              },
                            }}
                          />
                        ))}
                      </Box>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                          {palette.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {palette.description}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {palette.colors.map((color, colorIndex) => (
                            <Box
                              key={`palette-detail-${paletteIndex}-color-${colorIndex}`}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 1,
                                p: 1,
                                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                },
                              }}
                              onClick={() => handleColorSelect(color)}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    backgroundColor: color.hexCode,
                                    borderRadius: '6px',
                                    marginRight: 1,
                                    border: '1px solid rgba(0,0,0,0.1)',
                                  }}
                                />
                                <Typography variant="body2">{color.name}</Typography>
                              </Box>
                              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                {color.hexCode}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {selectedColor && (
                <Box 
                  sx={{ 
                    mt: 4, 
                    p: 2, 
                    borderRadius: '16px', 
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.9))',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="600">
                      Selected Color: {selectedColor.name}
                    </Typography>
                    <Tooltip title="Copy Color Code">
                      <IconButton
                        onClick={() => copyColorCode(selectedColor.hexCode)}
                        size="small"
                      >
                        {copied ? <CheckIcon color="success" /> : <CopyIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '12px',
                        backgroundColor: selectedColor.hexCode,
                        marginRight: 2,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <Box>
                      <Typography variant="body1" fontWeight="500">
                        {selectedColor.hexCode}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedColor.name}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => setTabValue(2)}
                    disabled={!previewImage}
                    sx={{
                      backgroundImage: 'linear-gradient(to right, #6366f1, #ec4899)',
                      boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
                      '&:hover': {
                        boxShadow: '0 12px 20px rgba(99, 102, 241, 0.4)',
                      },
                    }}
                  >
                    {isAnalyzing ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : previewImage ? (
                      "View Wall Preview"
                    ) : (
                      "Generating Preview..."
                    )}
                  </Button>
                </Box>
              )}
            </TabPanel>
            
            {/* Preview Tab */}
            <TabPanel value={tabValue} index={2}>
              {selectedColor && previewImage && (
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight="500">
                    Wall Preview with {selectedColor.name}
                  </Typography>
                  
                  <Box sx={{ position: 'relative', width: '100%', mb: 3 }}>
                    <Box
                      component="img"
                      src={previewImage}
                      alt="Wall Preview"
                      sx={{
                        width: '100%',
                        borderRadius: '12px',
                        maxHeight: '500px',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" fontWeight="500" sx={{ mr: 2 }}>
                      Color: {selectedColor.name}
                    </Typography>
                    <Chip
                      label={selectedColor.hexCode}
                      sx={{
                        bgcolor: selectedColor.hexCode,
                        color: getContrastColor(selectedColor.hexCode),
                        fontWeight: 'bold',
                        borderRadius: '8px',
                      }}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" gutterBottom fontWeight="500">
                      Like this color?
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => copyColorCode(selectedColor.hexCode)}
                        startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                      >
                        {copied ? "Copied!" : "Copy Color Code"}
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setTabValue(1)}
                        startIcon={<ColorLensIcon />}
                      >
                        Try Another Color
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </TabPanel>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={resetAnalyzer}
              sx={{
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                },
              }}
            >
              Start Over
            </Button>
          </Box>
        </Box>
      )}
      
      {wallImage && isAnalyzing && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Analyzing Wall Colors
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            Our AI is identifying colors and generating suggestions for your wall.
            <br />
            This will take just a moment...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Helper to determine contrast color for text visibility
function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for bright colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default WallColorAnalyzer; 