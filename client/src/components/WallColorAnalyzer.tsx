import React, { useState, useRef } from 'react';
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
  useMediaQuery,
  Alert,
  Divider,
  Tabs,
  Tab,
  Fade,
  Grow,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Badge,
  SwipeableDrawer,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Upload as UploadIcon,
  ColorLens as ColorLensIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Image as ImageIcon,
  FormatColorFill as FormatColorFillIcon,
  Check as CheckIcon,
  BrightnessMedium as BrightnessIcon,
  Opacity as OpacityIcon,
  AutoFixHigh as TextureIcon,
  Contrast as ContrastIcon,
  Compare as CompareIcon,
  Palette as PaletteIcon,
  WbSunny as LightIcon,
  Store as StoreIcon,
  ZoomIn as ZoomInIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import Webcam from 'react-webcam';
import ColorSuggestionService, { 
  ColorSuggestion, 
  ColorAnalysisResult, 
  ColorPreviewOptions,
  defaultPreviewOptions
} from '../services/ColorSuggestionService';
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
  const [originalPreviewImage, setOriginalPreviewImage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [showColorDrawer, setShowColorDrawer] = useState<boolean>(false);
  const [brandMatches, setBrandMatches] = useState<any[]>([]);
  const [similarColors, setSimilarColors] = useState<ColorSuggestion[]>([]);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  
  // Color preview options
  const [previewOptions, setPreviewOptions] = useState<ColorPreviewOptions>(defaultPreviewOptions);
  
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
  const handleColorSelect = async (color: ColorSuggestion) => {
    setSelectedColor(color);
    if (onColorSelect) {
      onColorSelect(color);
    }
    
    // Load similar colors and brand matches
    try {
      const similar = await ColorSuggestionService.getSimilarColors(color.hexCode);
      setSimilarColors(similar);
      
      const matches = await ColorSuggestionService.getBrandMatches(color.hexCode);
      setBrandMatches(matches);
    } catch (err) {
      console.error('Failed to load color information', err);
    }
    
    // Generate preview with default options
    if (wallImage) {
      generatePreview(color, previewOptions);
    }
  };
  
  // Generate wall preview with selected color
  const generatePreview = async (color: ColorSuggestion, options: ColorPreviewOptions) => {
    if (!wallImage || !color) return;
    
    try {
      setIsAnalyzing(true);
      const preview = await ColorSuggestionService.generateColorPreview(wallImage, color.hexCode, options);
      setPreviewImage(preview);
      
      // Store original preview for comparison
      if (!originalPreviewImage) {
        setOriginalPreviewImage(preview);
      }
    } catch (err) {
      setError('Failed to generate preview. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle intensity change
  const handleIntensityChange = (event: Event, value: number | number[]) => {
    const newValue = value as number;
    const newOptions = {...previewOptions, intensity: newValue};
    setPreviewOptions(newOptions);
    
    if (selectedColor && wallImage) {
      generatePreview(selectedColor, newOptions);
    }
  };
  
  // Handle finish change
  const handleFinishChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const finish = event.target.value as 'matte' | 'eggshell' | 'satin' | 'semi-gloss' | 'high-gloss';
    const newOptions = {...previewOptions, finish};
    setPreviewOptions(newOptions);
    
    if (selectedColor && wallImage) {
      generatePreview(selectedColor, newOptions);
    }
  };
  
  // Handle texture toggle
  const handleTextureToggle = (event: React.MouseEvent<HTMLElement>, value: boolean) => {
    if (value !== null) {
      const newOptions = {...previewOptions, showTexture: value};
      setPreviewOptions(newOptions);
      
      if (selectedColor && wallImage) {
        generatePreview(selectedColor, newOptions);
      }
    }
  };
  
  // Handle lighting effect change
  const handleLightingChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const lightingEffect = event.target.value as 'natural' | 'warm' | 'cool' | 'bright' | 'dim';
    const newOptions = {...previewOptions, lightingEffect};
    setPreviewOptions(newOptions);
    
    if (selectedColor && wallImage) {
      generatePreview(selectedColor, newOptions);
    }
  };
  
  // Toggle comparison mode
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  };
  
  // Copy color code to clipboard
  const copyColorCode = (colorCode: string) => {
    navigator.clipboard.writeText(colorCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      setSnackbarMessage(`Color code ${colorCode} copied to clipboard!`);
      setOpenSnackbar(true);
    });
  };
  
  // Save preview image
  const savePreviewImage = () => {
    if (previewImage) {
      const link = document.createElement('a');
      link.href = previewImage;
      link.download = `wall-preview-${selectedColor?.name.replace(/\s+/g, '-').toLowerCase() || 'color'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbarMessage('Preview image saved!');
      setOpenSnackbar(true);
    }
  };
  
  // Share preview
  const sharePreview = async () => {
    if (previewImage && navigator.share) {
      try {
        const blob = await fetch(previewImage).then(r => r.blob());
        const file = new File([blob], 'wall-preview.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My Wall Color Preview',
          text: `Check out this wall color: ${selectedColor?.name} (${selectedColor?.hexCode})`,
          files: [file]
        });
      } catch (err) {
        console.error('Error sharing', err);
        setSnackbarMessage('Failed to share preview');
        setOpenSnackbar(true);
      }
    } else {
      setSnackbarMessage('Sharing not supported on this device');
      setOpenSnackbar(true);
    }
  };
  
  // Reset everything
  const resetAnalyzer = () => {
    setWallImage(null);
    setColorResult(null);
    setSelectedColor(null);
    setPreviewImage(null);
    setOriginalPreviewImage(null);
    setCompareMode(false);
    setShowColorDrawer(false);
    setTabValue(0);
    setError(null);
    setPreviewOptions(defaultPreviewOptions);
    setSimilarColors([]);
    setBrandMatches([]);
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  
  // Render the color adjustment controls
  const renderColorAdjustmentControls = () => {
    if (!selectedColor) return null;
    
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: '16px',
          mt: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Adjustment Controls
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BrightnessIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body2">Color Intensity</Typography>
          </Box>
          <Slider
            value={previewOptions.intensity}
            min={0.1}
            max={2.0}
            step={0.1}
            onChange={handleIntensityChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Finish</InputLabel>
                <Select
                  value={previewOptions.finish}
                  label="Finish"
                  onChange={handleFinishChange}
                >
                  <MenuItem value="matte">Matte</MenuItem>
                  <MenuItem value="eggshell">Eggshell</MenuItem>
                  <MenuItem value="satin">Satin</MenuItem>
                  <MenuItem value="semi-gloss">Semi-Gloss</MenuItem>
                  <MenuItem value="high-gloss">High-Gloss</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Lighting</InputLabel>
                <Select
                  value={previewOptions.lightingEffect}
                  label="Lighting"
                  onChange={handleLightingChange}
                >
                  <MenuItem value="natural">Natural</MenuItem>
                  <MenuItem value="warm">Warm</MenuItem>
                  <MenuItem value="cool">Cool</MenuItem>
                  <MenuItem value="bright">Bright</MenuItem>
                  <MenuItem value="dim">Dim</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ToggleButtonGroup
              value={previewOptions.showTexture}
              exclusive
              onChange={handleTextureToggle}
              size="small"
            >
              <ToggleButton value={true}>
                <TextureIcon sx={{ mr: 1 }} /> Show Texture
              </ToggleButton>
              <ToggleButton value={false}>
                <TextureIcon sx={{ mr: 1 }} /> Hide Texture
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CompareIcon />}
              onClick={toggleCompareMode}
              size="small"
            >
              {compareMode ? 'Exit Compare' : 'Compare Original'}
            </Button>
            
            <Box>
              <IconButton color="primary" onClick={savePreviewImage} sx={{ mr: 1 }}>
                <SaveIcon />
              </IconButton>
              <IconButton color="primary" onClick={sharePreview}>
                <ShareIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };
  
  // Render preview section
  const renderPreviewSection = () => {
    if (!previewImage) return null;
    
    return (
      <Box>
        <Paper 
          elevation={3}
          sx={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            my: 3
          }}
        >
          {compareMode ? (
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', position: 'relative' }}>
                <Box sx={{ flex: 1, borderRight: '1px solid white' }}>
                  <Typography 
                    variant="subtitle2"
                    sx={{ 
                      position: 'absolute', 
                      left: 10, 
                      top: 10, 
                      bgcolor: 'rgba(0,0,0,0.6)', 
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    Original
                  </Typography>
                  <img 
                    src={wallImage || ''} 
                    alt="Original wall" 
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      display: 'block',
                      maxHeight: '50vh'
                    }} 
                  />
                </Box>
                <Box sx={{ flex: 1, borderLeft: '1px solid white' }}>
                  <Typography 
                    variant="subtitle2"
                    sx={{ 
                      position: 'absolute', 
                      right: 10, 
                      top: 10, 
                      bgcolor: 'rgba(0,0,0,0.6)', 
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    {selectedColor?.name}
                  </Typography>
                  <img 
                    src={previewImage} 
                    alt="Colored wall preview" 
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      display: 'block',
                      maxHeight: '50vh'
                    }} 
                  />
                </Box>
              </Box>
              <Box 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: theme.palette.primary.main,
                  color: 'white'
                }}
              >
                <Typography variant="body2">
                  Move slider to see the difference
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ position: 'relative' }}>
              <img 
                src={previewImage} 
                alt="Wall color preview" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  display: 'block',
                  maxHeight: '60vh'
                }} 
              />
              
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  p: 2, 
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="subtitle1">
                    {selectedColor?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        bgcolor: selectedColor?.hexCode, 
                        mr: 1,
                        border: '2px solid white'
                      }} 
                    />
                    <Typography variant="body2">
                      {selectedColor?.hexCode}
                    </Typography>
                    <IconButton 
                      size="small" 
                      sx={{ ml: 1, color: 'white' }}
                      onClick={() => selectedColor && copyColorCode(selectedColor.hexCode)}
                    >
                      {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                </Box>
                
                <Button 
                  variant="contained" 
                  onClick={() => setShowColorDrawer(true)}
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.8)'
                    }
                  }}
                  size="small"
                >
                  Shop This Color
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    );
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
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: 'environment',
                }}
                style={{
                  width: '100%',
                  borderRadius: '16px',
                }}
              />
              
              <Box sx={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                gap: 2
              }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCapture}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    color: theme.palette.primary.main,
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'white',
                    }
                  }}
                >
                  <PhotoCameraIcon />
                </Button>
                
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setShowCamera(false)}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    color: theme.palette.error.main,
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'white',
                    }
                  }}
                >
                  <CloseIcon />
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}
      
      {isAnalyzing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={60} />
        </Box>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2, borderRadius: '12px' }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {wallImage && colorResult && !isAnalyzing && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button
              startIcon={<CloseIcon />}
              onClick={resetAnalyzer}
              size="small"
              color="inherit"
            >
              New Analysis
            </Button>
          </Box>
          
          {renderPreviewSection()}
          
          {selectedColor && renderColorAdjustmentControls()}
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                }
              }}
            >
              <Tab 
                label="Suggested Colors" 
                icon={<ColorLensIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Color Palettes" 
                icon={<PaletteIcon />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              AI Recommended Colors
            </Typography>
            
            <Grid container spacing={2}>
              {colorResult.dominantColors.map((color, index) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: selectedColor?.hexCode === color.hexCode ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: selectedColor?.hexCode === color.hexCode ? '0 8px 16px rgba(0,0,0,0.1)' : '',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: selectedColor?.hexCode === color.hexCode ? `2px solid ${theme.palette.primary.main}` : 'none',
                    }}
                    onClick={() => handleColorSelect(color)}
                  >
                    <Box
                      sx={{
                        height: '100px',
                        backgroundColor: color.hexCode,
                      }}
                    ></Box>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {color.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">
                          {color.hexCode}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyColorCode(color.hexCode);
                          }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {color.brand && (
                        <Chip 
                          label={`${color.brand} ${color.colorCode}`} 
                          size="small" 
                          sx={{ mt: 1, fontSize: '0.7rem' }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Suggested Color Palettes
            </Typography>
            
            <Grid container spacing={3}>
              {colorResult.suggestedPalettes.map((palette, paletteIndex) => (
                <Grid item xs={12} md={6} key={paletteIndex}>
                  <Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {palette.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {palette.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        {palette.colors.map((color, colorIndex) => (
                          <Tooltip title={`${color.name} - ${color.hexCode}`} key={colorIndex}>
                            <Box
                              sx={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: color.hexCode,
                                cursor: 'pointer',
                                border: '2px solid white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                }
                              }}
                              onClick={() => handleColorSelect(color)}
                            />
                          </Tooltip>
                        ))}
                      </Box>
                      
                      <Button
                        variant="text"
                        color="primary"
                        size="small"
                        sx={{ mt: 2 }}
                        endIcon={<FormatColorFillIcon />}
                      >
                        Apply Palette
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Box>
      )}
      
      <SwipeableDrawer
        anchor="bottom"
        open={showColorDrawer}
        onClose={() => setShowColorDrawer(false)}
        onOpen={() => setShowColorDrawer(true)}
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            maxHeight: '80vh',
          }
        }}
      >
        <Box sx={{ p: 3, position: 'relative' }}>
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setShowColorDrawer(false)}
          >
            <CloseIcon />
          </IconButton>
          
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Shop This Color
          </Typography>
          
          {selectedColor && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box 
                  sx={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: '12px', 
                    backgroundColor: selectedColor.hexCode,
                    mr: 2,
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }} 
                />
                <Box>
                  <Typography variant="h6">{selectedColor.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedColor.hexCode}
                    <IconButton 
                      size="small" 
                      sx={{ ml: 1 }}
                      onClick={() => copyColorCode(selectedColor.hexCode)}
                    >
                      {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                    </IconButton>
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Brand Matches
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                {brandMatches.length > 0 ? (
                  brandMatches.map((match, index) => (
                    <Paper
                      key={index}
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        display: 'flex', 
                        alignItems: 'center',
                        borderRadius: '12px'
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 30, 
                          height: 30, 
                          borderRadius: '6px', 
                          backgroundColor: match.hexCode,
                          mr: 2
                        }} 
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2">
                          {match.brand}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {match.colorName} ({match.colorCode})
                        </Typography>
                      </Box>
                      <StoreIcon color="action" />
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No brand matches found for this color.
                  </Typography>
                )}
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Similar Colors
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                {similarColors.length > 0 ? (
                  similarColors.map((color, index) => (
                    <Tooltip title={`${color.name} - ${color.hexCode}`} key={index}>
                      <Box
                        sx={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '10px',
                          backgroundColor: color.hexCode,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          }
                        }}
                        onClick={() => {
                          handleColorSelect(color);
                          setShowColorDrawer(false);
                        }}
                      />
                    </Tooltip>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No similar colors found.
                  </Typography>
                )}
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ 
                  py: 1.2,
                  borderRadius: '12px',
                  mt: 2,
                  backgroundImage: 'linear-gradient(to right, #6366f1, #ec4899)',
                }}
                startIcon={<StoreIcon />}
              >
                Find in Stores Near You
              </Button>
            </>
          )}
        </Box>
      </SwipeableDrawer>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

// Helper function to determine text color based on background color
function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export default WallColorAnalyzer; 