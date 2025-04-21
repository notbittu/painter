import React, { useState, useRef, ChangeEvent, SyntheticEvent } from 'react';
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
  ToggleButtonGroup,
  Zoom,
  FormControlLabel,
  Switch,
  SelectChangeEvent
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
  Share as ShareIcon,
  FlipCameraAndroid as FlipCameraIcon,
  ViewInAr as Vision360Icon,
  Brightness4 as ShadowTrackingIcon,
  Panorama as PanoramaIcon
} from '@mui/icons-material';
import Webcam from 'react-webcam';
import ColorSuggestionService, { 
  ColorSuggestion, 
  ColorAnalysisResult, 
  ColorPreviewOptions,
  defaultPreviewOptions
} from '../services/ColorSuggestionService';
import { generateId } from '../utils/helpers';
import { alpha } from '@mui/material/styles';

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
  
  // Camera settings
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [shadowTrackingEnabled, setShadowTrackingEnabled] = useState<boolean>(true);
  
  // Room type for better analysis
  const [roomType, setRoomType] = useState<string>('Living Room');
  
  // Enhanced preview options
  const [previewOptions, setPreviewOptions] = useState<ColorPreviewOptions>({
    ...defaultPreviewOptions,
    shadowTracking: true,
    vision360: false,
    realisticBlending: true,
  });
  
  // Toggle camera facing mode (front/back)
  const toggleCameraFacingMode = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  };
  
  // Handle camera capture
  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (imageSrc) {
        // Normal mode, single image
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
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      // Handle single file upload
      const file = files[0];
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
      // Enhanced with the shadowTracking parameter
      const result = await ColorSuggestionService.analyzeWallImage(
        imageData, 
        shadowTrackingEnabled
      );
      setColorResult(result);
    } catch (err) {
      setError('Failed to analyze the wall. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Enhanced color selection with better color adaptation
  const handleColorSelect = async (color: ColorSuggestion) => {
    setSelectedColor(color);
    setError(null);
    
    if (onColorSelect) {
      onColorSelect(color);
    }
    
    try {
      // Generate preview with all the enhanced rendering options
      await generatePreview(color, previewOptions);
      
      // Generate brand matches and similar colors with AI
      const { brandMatches: brands, similarColors: similar } = 
        await ColorSuggestionService.findSimilarColors(color.hex, { 
          includeRGB: true,
          shadowTracking: previewOptions.shadowTracking,
          vision360: previewOptions.vision360,
          realisticBlending: previewOptions.realisticBlending
        });
      
      setBrandMatches(brands || []);
      setSimilarColors(similar || []);
      
    } catch (err) {
      setError('Failed to generate color preview. Please try again.');
      console.error(err);
    }
  };
  
  // Enhanced preview generation with new features
  const generatePreview = async (color: ColorSuggestion, options: ColorPreviewOptions) => {
    if (!wallImage) return;
    
      setIsAnalyzing(true);
    
    try {
      // Save original image for comparison if needed
      if (!originalPreviewImage) {
        setOriginalPreviewImage(wallImage);
      }
      
      // Advanced color preview with new features
      const previewResult = await ColorSuggestionService.generateColorPreview(
        wallImage, 
        color.hex,
        {
          intensity: options.intensity,
          finish: options.finish,
          texture: options.texture,
          lighting: options.lighting,
          blendMode: options.blendMode,
          shadowTracking: options.shadowTracking,
          vision360: options.vision360,
          realisticBlending: options.realisticBlending
        }
      );
      
      if (previewResult.success) {
        setPreviewImage(previewResult.preview);
      } else {
        setError(previewResult.error || 'Failed to generate preview');
      }
    } catch (err) {
      setError('Failed to generate color preview. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Enhanced toggle for shadow tracking with better descriptions
  const toggleShadowTracking = () => {
    const newValue = !previewOptions.shadowTracking;
    setPreviewOptions({
      ...previewOptions,
      shadowTracking: newValue
    });
    
    setSnackbarMessage(`Shadow tracking ${newValue ? 'enabled' : 'disabled'}: ${newValue ? 'Colors will adapt to lighting conditions' : 'Standard color rendering'}`);
    setOpenSnackbar(true);
    
    // If we have a current image and color, regenerate the preview
    if (selectedColor && wallImage) {
      generatePreview(selectedColor, {
        ...previewOptions,
        shadowTracking: newValue
      });
    }
  };
  
  // New toggle for Vision 360 feature
  const toggleVision360 = () => {
    const newValue = !previewOptions.vision360;
    setPreviewOptions({
      ...previewOptions,
      vision360: newValue
    });
    
    setSnackbarMessage(`NFD Vision 360 ${newValue ? 'enabled' : 'disabled'}: ${newValue ? 'Enhanced depth perception activated' : 'Standard visualization'}`);
    setOpenSnackbar(true);
    
    // If we have a current image and color, regenerate the preview
    if (selectedColor && wallImage) {
      generatePreview(selectedColor, {
        ...previewOptions,
        vision360: newValue
      });
    }
  };
  
  // New toggle for realistic blending
  const toggleRealisticBlending = () => {
    const newValue = !previewOptions.realisticBlending;
    setPreviewOptions({
      ...previewOptions,
      realisticBlending: newValue
    });
    
    setSnackbarMessage(`Realistic blending ${newValue ? 'enabled' : 'disabled'}: ${newValue ? 'Enhanced texture and surface interaction' : 'Standard color application'}`);
    setOpenSnackbar(true);
    
    // If we have a current image and color, regenerate the preview
      if (selectedColor && wallImage) {
      generatePreview(selectedColor, {
        ...previewOptions,
        realisticBlending: newValue
      });
    }
  };
  
  // Enhanced intensity control with more granular options
  const handleIntensityChange = (e: Event, newValue: number | number[]) => {
    setPreviewOptions({
      ...previewOptions,
      intensity: newValue as number
    });
    
    // Only regenerate if we've moved by at least 5% to avoid too many calls
    if (Math.abs((newValue as number) - previewOptions.intensity) >= 5 && selectedColor && wallImage) {
      generatePreview(selectedColor, {
        ...previewOptions,
        intensity: newValue as number
      });
    }
  };
  
  // Toggle comparison mode with better features
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    
    if (!compareMode && !originalPreviewImage && wallImage) {
      // Ensure we have the original image for comparison
      setOriginalPreviewImage(wallImage);
    }
    
    setSnackbarMessage(compareMode ? 
      'Normal view mode' : 
      'Before/After comparison mode - drag the slider to compare'
    );
    setOpenSnackbar(true);
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
          text: `Check out this wall color: ${selectedColor?.name} (${selectedColor?.hex})`,
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
  
  // Replace the existing color adjustment controls with enhanced version
  const renderColorAdjustmentControls = () => {
    if (!selectedColor) return null;
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Advanced Color Adjustment
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Color Intensity</span>
            <span>{previewOptions.intensity}%</span>
          </Typography>
          <Slider
            value={previewOptions.intensity}
            onChange={handleIntensityChange}
            min={50}
            max={150}
            aria-labelledby="color-intensity-slider"
            valueLabelDisplay="auto"
            marks={[
              { value: 50, label: '50%' },
              { value: 100, label: '100%' },
              { value: 150, label: '150%' },
            ]}
          />
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="finish-type-label">Finish Type</InputLabel>
              <Select
                labelId="finish-type-label"
                id="finish-type"
                value={previewOptions.finish}
                label="Finish Type"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newFinish = e.target.value as string;
                  setPreviewOptions({
                    ...previewOptions,
                    finish: newFinish
                  });
                  if (selectedColor && wallImage) {
                    generatePreview(selectedColor, {
                      ...previewOptions,
                      finish: newFinish
                    });
                  }
                }}
              >
                <MenuItem value="matte">Matte</MenuItem>
                <MenuItem value="eggshell">Eggshell</MenuItem>
                <MenuItem value="satin">Satin</MenuItem>
                <MenuItem value="semi-gloss">Semi-Gloss</MenuItem>
                <MenuItem value="high-gloss">High-Gloss</MenuItem>
                <MenuItem value="metallic">Metallic</MenuItem>
                <MenuItem value="pearl">Pearl</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="lighting-label">Lighting</InputLabel>
              <Select
                labelId="lighting-label"
                id="lighting"
                value={previewOptions.lighting}
                label="Lighting"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newLighting = e.target.value as string;
                  setPreviewOptions({
                    ...previewOptions,
                    lighting: newLighting
                  });
                  if (selectedColor && wallImage) {
                    generatePreview(selectedColor, {
                      ...previewOptions,
                      lighting: newLighting
                    });
                  }
                }}
              >
                <MenuItem value="natural">Natural</MenuItem>
                <MenuItem value="warm">Warm</MenuItem>
                <MenuItem value="cool">Cool</MenuItem>
                <MenuItem value="bright">Bright</MenuItem>
                <MenuItem value="dim">Dim</MenuItem>
                <MenuItem value="evening">Evening</MenuItem>
                <MenuItem value="morning">Morning</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom variant="body2">
            Blend Mode
                  </Typography>
          <ToggleButtonGroup
            value={previewOptions.blendMode}
            exclusive
            onChange={(e: SyntheticEvent, newBlendMode: string | null) => {
              if (newBlendMode) {
                setPreviewOptions({
                  ...previewOptions,
                  blendMode: newBlendMode
                });
                if (selectedColor && wallImage) {
                  generatePreview(selectedColor, {
                    ...previewOptions,
                    blendMode: newBlendMode
                  });
                }
              }
            }}
            fullWidth
            size="small"
          >
            <ToggleButton value="normal">Normal</ToggleButton>
            <ToggleButton value="multiply">Multiply</ToggleButton>
            <ToggleButton value="screen">Screen</ToggleButton>
            <ToggleButton value="overlay">Overlay</ToggleButton>
          </ToggleButtonGroup>
                </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom variant="body2">
            Smart Features
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Tooltip title="Adapts color to lighting conditions and surface shadows">
                <Paper 
                    sx={{ 
                    p: 1, 
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: previewOptions.shadowTracking ? 'primary.light' : 'background.paper',
                    color: previewOptions.shadowTracking ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      bgcolor: previewOptions.shadowTracking ? 'primary.main' : 'action.hover',
                    }
                  }}
                  onClick={toggleShadowTracking}
                >
                  <ShadowTrackingIcon fontSize="small" />
                  <Typography variant="caption" display="block">Shadow Tracking</Typography>
                </Paper>
              </Tooltip>
            </Grid>
            
            <Grid item xs={4}>
              <Tooltip title="Enhanced depth perception for more accurate rendering">
                <Paper 
                  sx={{ 
                    p: 1, 
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: previewOptions.vision360 ? 'primary.light' : 'background.paper',
                    color: previewOptions.vision360 ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      bgcolor: previewOptions.vision360 ? 'primary.main' : 'action.hover',
                    }
                  }}
                  onClick={toggleVision360}
                >
                  <Vision360Icon fontSize="small" />
                  <Typography variant="caption" display="block">Vision 360</Typography>
                </Paper>
              </Tooltip>
            </Grid>
            
            <Grid item xs={4}>
              <Tooltip title="Realistic color blending with surface textures">
                <Paper 
                sx={{ 
                    p: 1, 
                  textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: previewOptions.realisticBlending ? 'primary.light' : 'background.paper',
                    color: previewOptions.realisticBlending ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      bgcolor: previewOptions.realisticBlending ? 'primary.main' : 'action.hover',
                    }
                  }}
                  onClick={toggleRealisticBlending}
                >
                  <FormatColorFillIcon fontSize="small" />
                  <Typography variant="caption" display="block">Realistic Blend</Typography>
                </Paper>
              </Tooltip>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<TextureIcon />}
            onClick={() => {
              // Apply optimal settings based on AI analysis
              if (selectedColor && wallImage) {
                const optimalSettings: ColorPreviewOptions = {
                  ...previewOptions,
                  intensity: Math.min(Math.max(previewOptions.intensity, 80), 120), // Normalize intensity
                  shadowTracking: true,
                  vision360: true,
                  realisticBlending: true,
                  finish: selectedColor.name.toLowerCase().includes('gloss') ? 'semi-gloss' : 'matte',
                  lighting: 'natural'
                };
                
                setPreviewOptions(optimalSettings);
                generatePreview(selectedColor, optimalSettings);
                setSnackbarMessage('Applied AI-optimized settings for best results');
                setOpenSnackbar(true);
              }
            }}
          >
            Auto-Optimize Settings
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Render preview section
  const renderPreviewSection = () => {
    if (!selectedColor || !previewImage) return null;
    
    return (
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h3">
              Color Preview
                </Typography>
            <Box>
              <Tooltip title="Compare Before/After">
                <IconButton 
                  onClick={toggleCompareMode} 
                  color={compareMode ? "primary" : "default"}
                  sx={{ mr: 1 }}
                >
                  <CompareIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save Image">
                <IconButton onClick={savePreviewImage}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton onClick={sharePreview}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              </Box>
            </Box>
          
          {compareMode ? (
            // Enhanced Compare view with slider
            <Box sx={{ position: 'relative', height: 400, overflow: 'hidden' }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  left: 10, 
                  zIndex: 10, 
                  color: 'white', 
                  bgcolor: 'rgba(0,0,0,0.5)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1
                }}
              >
                Before
              </Typography>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10, 
                  zIndex: 10, 
                  color: 'white', 
                  bgcolor: 'rgba(0,0,0,0.5)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1
                }}
              >
                After
              </Typography>
              
              <Box sx={{ 
                  position: 'absolute', 
                top: 0, 
                  left: 0, 
                  right: 0, 
                bottom: 0, 
                backgroundImage: `url(${originalPreviewImage || wallImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 1
              }} />
              
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: `${previewOptions.intensity}%`, // Use intensity as comparison slider
                bottom: 0, 
                backgroundImage: `url(${previewImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 2,
                borderRight: '3px solid white'
              }} />
              
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: `${previewOptions.intensity}%`, 
                transform: 'translate(-50%, -50%)',
                zIndex: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '50%',
                width: 40,
                height: 40,
                  display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: theme.shadows[5],
                border: '2px solid white'
              }}>
                <CompareIcon fontSize="small" />
              </Box>
              
              <Slider
                      sx={{ 
                  position: 'absolute', 
                  bottom: 20, 
                  left: 40, 
                  right: 40, 
                  zIndex: 4,
                  color: 'white',
                  '& .MuiSlider-thumb': {
                        width: 24, 
                        height: 24, 
                    backgroundColor: 'white',
                    border: '2px solid #6366f1',
                    '&:hover': {
                      boxShadow: '0 0 0 8px rgba(99, 102, 241, 0.16)'
                    }
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#6366f1',
                    border: 'none',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  }
                }}
                value={previewOptions.intensity}
                onChange={(e: Event, newValue: number | number[]) => {
                  setPreviewOptions({
                    ...previewOptions,
                    intensity: newValue as number
                  });
                }}
                min={0}
                max={100}
                aria-label="Before/After comparison slider"
              />
            </Box>
          ) : (
            // Regular preview with enhanced info
            <Box 
              sx={{ 
                height: 400, 
                backgroundImage: `url(${previewImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 1,
                boxShadow: theme.shadows[1],
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {// Add feature indicators with improved information
              previewOptions.shadowTracking && (
                <Tooltip title="Shadow Tracking uses AI to adapt the paint color to existing shadows and lighting conditions on your wall">
                  <Chip
                    icon={<ShadowTrackingIcon />}
                    label="Shadow Tracking"
                    size="small"
                    sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
                  />
                </Tooltip>
              )}
              
              {previewOptions.vision360 && (
                <Tooltip title="NFD Vision 360 analyzes your wall's depth and contours for realistic paint visualization">
                  <Chip
                    icon={<Vision360Icon />}
                    label="Vision 360"
                    size="small"
                    sx={{ position: 'absolute', top: previewOptions.shadowTracking ? 50 : 10, right: 10, bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
                  />
                </Tooltip>
              )}
              
              {previewOptions.realisticBlending && (
                <Tooltip title="Realistic Blending simulates how paint interacts with your wall's texture and surface">
                  <Chip
                    icon={<FormatColorFillIcon />}
                    label="Realistic Blend"
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: previewOptions.shadowTracking && previewOptions.vision360 ? 90 : 
                           previewOptions.shadowTracking || previewOptions.vision360 ? 50 : 10, 
                      right: 10, 
                      bgcolor: 'rgba(0,0,0,0.7)', 
                      color: 'white' 
                    }}
                  />
                </Tooltip>
              )}
                  </Box>
          )}
                
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, mt: 2 }}>
            <Box 
                  sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                bgcolor: selectedColor?.hex || '#ccc',
                mr: 2,
                border: '3px solid white',
                boxShadow: 1,
                flexShrink: 0
              }} 
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {selectedColor?.name || 'Select a color'}
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedColor?.hex?.toUpperCase()}
                <IconButton size="small" onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  copyColorCode(selectedColor?.hex || '');
                }}>
                  {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                </IconButton>
                {selectedColor?.rgb && (
                  <Tooltip title={`RGB: ${selectedColor.rgb}`}>
                    <Chip 
                      label="RGB" 
                      size="small"
                      sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        copyColorCode(selectedColor.rgb || '');
                      }}
                    />
                  </Tooltip>
                )}
                {selectedColor?.brand && (
                  <Tooltip title={`Brand: ${selectedColor.brand}`}>
                    <Chip 
                      label={selectedColor.brand} 
                      size="small"
                      sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
                    />
                  </Tooltip>
                )}
              </Typography>
              {selectedColor?.roomTypes && selectedColor.roomTypes.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Perfect for: {selectedColor.roomTypes.join(', ')}
                </Typography>
              )}
              {selectedColor?.moodCategory && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Mood: {selectedColor.moodCategory}
                </Typography>
              )}
              {selectedColor?.suitableFor && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                  {selectedColor.suitableFor}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
        
        {renderColorAdjustmentControls()}
      </Box>
    );
  };
  
  // Render the main welcome screen with simplified design
  const renderWelcomeScreen = () => {
    return (
      <Grow in={!wallImage && !showCamera}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(240, 240, 250, 0.9)',
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 250,
              height: 250,
              background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15), rgba(236, 72, 153, 0.1) 70%)',
              borderRadius: '50%',
              zIndex: 0,
              transform: 'rotate(10deg)',
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -70,
              left: -70,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.05) 70%)',
              borderRadius: '50%',
              zIndex: 0,
              transform: 'rotate(190deg)',
              pointerEvents: 'none',
            }
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              mb: 3,
              position: 'relative',
              zIndex: 1,
              textShadow: '0 5px 15px rgba(0,0,0,0.1)',
              letterSpacing: '-0.02em',
              animation: 'shimmer 2.5s infinite linear',
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' },
              },
              backgroundSize: '200% auto',
            }}
          >
            Wall Color Visualizer
          </Typography>
          
          <Typography 
            variant="h6" 
            component="h2" 
            color="textSecondary" 
            paragraph
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              mb: 4,
              position: 'relative',
              zIndex: 1,
              opacity: 0.8,
              fontWeight: 500,
            }}
          >
            Transform your space with our AI-powered tool that suggests perfect colors and shows you exactly how they'll look on your walls
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1 
          }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CameraIcon />}
              onClick={() => setShowCamera(true)}
              sx={{
                px: 4,
                py: 2,
                borderRadius: '14px',
                backgroundImage: 'linear-gradient(to right, #6366f1, #ec4899)',
                boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
                '&:hover': {
                  boxShadow: '0 15px 25px rgba(99, 102, 241, 0.4)',
                  transform: 'translateY(-3px) scale(1.02)',
                },
                transition: 'all 0.3s ease',
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              Take Photo
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<UploadIcon />}
              onClick={handleFileUploadClick}
              sx={{
                px: 4,
                py: 2,
                borderRadius: '14px',
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 15px rgba(0, 0, 0, 0.05)',
                },
                transition: 'all 0.3s ease',
                fontSize: '1.1rem',
                fontWeight: 600,
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
    );
  };
  
  // Render enhanced camera view with simplified controls
  const renderCameraView = () => {
    return (
      <Fade in={showCamera}>
        <Paper
          elevation={4}
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: facingMode,
                width: 1280,
                height: 720,
              }}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
            
            {/* Camera overlay with improved instructions */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              p: 2,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
              color: 'white',
              textAlign: 'center',
            }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Position camera to clearly capture your wall
              </Typography>
              <Typography variant="caption">
                Ensure good lighting and a straight angle for best results
              </Typography>
            </Box>
            
            {/* Room type indicator for better analysis */}
            <Box sx={{
              position: 'absolute',
              top: 80,
              right: 20,
              zIndex: 10,
            }}>
              <Paper sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight="bold">
                  Room Type:
                </Typography>
                <Select
                  value={roomType || 'Living Room'}
                  onChange={(e: SelectChangeEvent) => setRoomType(e.target.value as string)}
                  size="small"
                  sx={{ 
                    ml: 1, 
                    color: 'white', 
                    '& .MuiSelect-select': { 
                      py: 0,
                      color: 'white',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    }
                  }}
                >
                  <MenuItem value="Living Room">Living Room</MenuItem>
                  <MenuItem value="Bedroom">Bedroom</MenuItem>
                  <MenuItem value="Kitchen">Kitchen</MenuItem>
                  <MenuItem value="Bathroom">Bathroom</MenuItem>
                  <MenuItem value="Dining Room">Dining Room</MenuItem>
                  <MenuItem value="Home Office">Home Office</MenuItem>
                </Select>
              </Paper>
            </Box>
            
            {/* Improved camera controls */}
            <Box sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              p: 3,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 3
            }}>
              {/* Camera flip button */}
              <IconButton 
                onClick={toggleCameraFacingMode}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  width: 48,
                  height: 48,
                }}
              >
                <FlipCameraIcon />
              </IconButton>
              
              {/* Capture button */}
              <Button
                variant="contained"
                onClick={handleCapture}
                sx={{
                  bgcolor: 'white',
                  color: '#6366f1',
                  borderRadius: '50%',
                  width: 80,
                  height: 80,
                  minWidth: 'auto',
                  boxShadow: '0 0 0 5px rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: 'white',
                    transform: 'scale(1.05)',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 36 }} />
              </Button>
              
              {/* Cancel button */}
              <IconButton 
                onClick={() => setShowCamera(false)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  width: 48,
                  height: 48,
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Fade>
    );
  };
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      {!wallImage && !showCamera && (
        renderWelcomeScreen()
      )}
      
      {showCamera && (
        renderCameraView()
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
                      transform: selectedColor?.hex === color.hex ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: selectedColor?.hex === color.hex ? '0 8px 16px rgba(0,0,0,0.1)' : '',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: selectedColor?.hex === color.hex ? `2px solid ${theme.palette.primary.main}` : 'none',
                    }}
                    onClick={() => handleColorSelect(color)}
                  >
                    <Box
                      sx={{
                        height: '100px',
                        backgroundColor: color.hex,
                      }}
                    ></Box>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {color.name}
                      </Typography>
                      {color.moodCategory && (
                        <Chip 
                          label={color.moodCategory} 
                          size="small"
                          sx={{ 
                            mb: 1, 
                            fontSize: '0.6rem', 
                            height: 18,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                          }}
                        />
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">
                          {color.hex}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            copyColorCode(color.hex);
                          }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
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
                    backgroundColor: selectedColor.hex,
                    mr: 2,
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }} 
                />
                <Box>
                  <Typography variant="h6">{selectedColor.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedColor.hex}
                    <IconButton 
                      size="small" 
                      sx={{ ml: 1 }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        copyColorCode(selectedColor.hex);
                      }}
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
                          backgroundColor: match.hex,
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
                    <Tooltip title={`${color.name} - ${color.hex}`} key={index}>
                      <Box
                        sx={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '10px',
                          backgroundColor: color.hex,
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