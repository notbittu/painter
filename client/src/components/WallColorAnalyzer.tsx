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
  Brightness4 as Brightness4Icon,
  Panorama as PanoramaIcon,
  Tune as TuneIcon,
  InfoOutlined as InfoOutlinedIcon,
  RestartAlt as RestartAltIcon,
  LightMode as LightModeIcon,
  Weekend as WeekendIcon,
  Bed as BedIcon,
  Kitchen as KitchenIcon,
  Bathtub as BathtubIcon,
  TableRestaurant as TableRestaurantIcon,
  Laptop as LaptopIcon
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
  
  // Lighting condition for more accurate color suggestions
  const [lightingCondition, setLightingCondition] = useState<string>('Well-lit');
  
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
  
  // Simplified and enhanced color adjustment controls with vibrant design
  const renderColorAdjustmentControls = () => {
    return (
      <Fade in={true} timeout={800}>
        <Box 
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            background: 'linear-gradient(135deg, rgba(250,208,196,0.8) 0%, rgba(255,154,158,0.8) 100%)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
            }
          }}
        >
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              fontWeight: 600,
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            <TuneIcon /> Adjust Colors
          </Typography>
        
          <Grid container spacing={3}>
            {/* Intensity slider with simplified UI */}
            <Grid item xs={12}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'white'
                }}
              >
                <span>
                  <OpacityIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'text-bottom' }} /> 
                  Color Intensity
                </span>
                <Chip 
                  label={`${previewOptions.intensity}%`} 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    color: '#ff6b6b',
                  }}
                />
              </Typography>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={previewOptions.intensity}
                  onChange={(e: Event, newValue: number | number[]) => {
                    setPreviewOptions({
                      ...previewOptions,
                      intensity: newValue as number
                    });
                  }}
                  min={0}
                  max={100}
                  sx={{
                    color: 'white',
                    '& .MuiSlider-thumb': {
                      bgcolor: 'white',
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: `0px 0px 0px 8px rgba(255,255,255, 0.16)`
                      }
                    },
                    '& .MuiSlider-rail': {
                      opacity: 0.3,
                    }
                  }}
                />
              </Box>
            </Grid>
          
            {/* Toggles with cleaner design */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={previewOptions.realisticBlending}
                    onChange={() => {
                      setPreviewOptions({
                        ...previewOptions,
                        realisticBlending: !previewOptions.realisticBlending
                      });
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase': {
                        color: 'white',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'white'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Realistic Blending
                  </Typography>
                }
              />
            </Grid>
        
            {/* Shadow Tracking toggle */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={previewOptions.shadowTracking}
                    onChange={() => {
                      setPreviewOptions({
                        ...previewOptions,
                        shadowTracking: !previewOptions.shadowTracking
                      });
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase': {
                        color: 'white',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'white'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Shadow Tracking
                  </Typography>
                }
              />
            </Grid>
          </Grid>
            
          {/* Lighting condition selector with improved UI */}
          <Box sx={{ mt: 3 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1, 
                display: 'flex', 
                alignItems: 'center',
                color: 'white' 
              }}
            >
              <LightModeIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'text-bottom' }} /> 
              Lighting
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={lightingCondition}
                onChange={(e) => setLightingCondition(e.target.value as string)}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { 
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': { 
                    borderColor: 'rgba(255,255,255,0.5)'
                  },
                  '& .MuiSvgIcon-root': { 
                    color: 'white'
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: 'rgba(30,30,30,0.95)',
                      color: 'white',
                      '& .MuiMenuItem-root:hover': {
                        bgcolor: 'rgba(255,154,158,0.2)'
                      }
                    }
                  }
                }}
              >
                <MenuItem value="Well-lit">Well-lit Room</MenuItem>
                <MenuItem value="Natural light">Natural Light</MenuItem>
                <MenuItem value="Artificial light">Artificial Light</MenuItem>
                <MenuItem value="Low light">Low Light</MenuItem>
              </Select>
            </FormControl>
          </Box>
        
          {/* Actions row with simplified buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4,
            pt: 3,
            borderTop: `1px solid rgba(255,255,255,0.2)`
          }}>
            <Button 
              variant="outlined"
              onClick={() => setPreviewOptions(defaultPreviewOptions)}
              startIcon={<RestartAltIcon />}
              size="small"
              sx={{
                borderRadius: 2,
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                },
                textTransform: 'none'
              }}
            >
              Reset
            </Button>
            
            <Button
              variant="contained"
              onClick={() => {
                if (selectedColor && wallImage) {
                  generatePreview(selectedColor, previewOptions);
                }
              }}
              startIcon={<CheckIcon />}
              size="small"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: 'rgba(255,255,255,0.8)',
                color: '#ff6b6b',
                '&:hover': {
                  bgcolor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Fade>
    );
  };
  
  // Render preview section with enhanced visualization
  const renderPreviewSection = () => {
    if (!selectedColor || !previewImage) return null;
    
    return (
      <Box sx={{ mt: 4 }}>
        <Paper 
          sx={{ 
            p: 0, 
            borderRadius: 3, 
            overflow: 'hidden', 
            mb: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            animation: 'fadeInUp 0.6s ease-out',
            '@keyframes fadeInUp': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}
          elevation={4}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" component="h3" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: theme.palette.primary.main,
              fontWeight: 600 
            }}>
              <FormatColorFillIcon /> Wall Color Preview
            </Typography>
            <Box>
              <Tooltip title="Compare Before/After">
                <IconButton 
                  onClick={toggleCompareMode} 
                  color={compareMode ? "primary" : "default"}
                  sx={{ 
                    mr: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  <CompareIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save Image">
                <IconButton 
                  onClick={savePreviewImage}
                  sx={{ 
                    mr: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton 
                  onClick={sharePreview}
                  sx={{ 
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {compareMode ? (
            // Enhanced Compare view with 3D slider effect
            <Box sx={{ position: 'relative', height: 500, overflow: 'hidden' }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  left: 16, 
                  zIndex: 10, 
                  color: 'white', 
                  bgcolor: 'rgba(0,0,0,0.6)',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                BEFORE
              </Typography>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16, 
                  zIndex: 10, 
                  color: 'white', 
                  bgcolor: 'rgba(0,0,0,0.6)',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                AFTER
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
                borderRight: '3px solid white',
                boxShadow: '2px 0px 15px rgba(0,0,0,0.5)'
              }} />
              
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: `${previewOptions.intensity}%`, 
                transform: 'translate(-50%, -50%)',
                zIndex: 3,
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: '50%',
                width: 48,
                height: 48,
                  display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0,0,0,0.4)',
                border: '3px solid white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) scale(1.1)',
                },
                cursor: 'grab',
                '&:active': {
                  cursor: 'grabbing'
                }
              }}>
                <CompareIcon sx={{ color: theme.palette.primary.main }} />
              </Box>
              
              <Slider
                      sx={{ 
                  position: 'absolute', 
                  bottom: 40, 
                  left: 40, 
                  right: 40, 
                  zIndex: 4,
                  color: 'white',
                  '& .MuiSlider-thumb': {
                        width: 24, 
                        height: 24, 
                    backgroundColor: 'white',
                    border: `2px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`
                    }
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: theme.palette.primary.main,
                    border: 'none',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
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
              
              <Typography 
                variant="body2" 
                sx={{ 
                  position: 'absolute', 
                  bottom: 85, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.6)',
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  fontWeight: 500,
                  textAlign: 'center'
                }}
              >
                Drag slider to compare before and after
              </Typography>
            </Box>
          ) : (
            // Enhanced regular preview with depth effects
            <Box 
              sx={{ 
                height: 500, 
                backgroundImage: `url(${previewImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.5s ease',
                transform: 'perspective(1000px) rotateX(0deg)',
                '&:hover': {
                  transform: 'perspective(1000px) rotateX(2deg)'
                }
              }}
            >
              {/* Feature badge container */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1, 
                  zIndex: 5,
                  animation: 'fadeInRight 0.8s ease-out',
                  '@keyframes fadeInRight': {
                    '0%': { opacity: 0, transform: 'translateX(20px)' },
                    '100%': { opacity: 1, transform: 'translateX(0)' }
                  }
                }}
              >
                {/* Shadow Tracking badge with improved design */}
                {previewOptions.shadowTracking && (
                  <Tooltip title="Shadow Tracking uses AI to adapt the paint color to existing shadows and lighting conditions on your wall">
                    <Chip
                      icon={<ShadowTrackingIcon />}
                      label="Shadow Tracking"
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(0,0,0,0.75)', 
                        color: 'white',
                        fontWeight: 500,
                        backdropFilter: 'blur(4px)',
                        '& .MuiChip-icon': { color: '#ffa726' }
                      }}
                    />
                  </Tooltip>
                )}
                
                {/* Vision 360 badge with improved design */}
                {previewOptions.vision360 && (
                  <Tooltip title="NFD Vision 360 analyzes your wall's depth and contours for realistic paint visualization">
                    <Chip
                      icon={<Vision360Icon />}
                      label="Vision 360"
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(0,0,0,0.75)', 
                        color: 'white',
                        fontWeight: 500,
                        backdropFilter: 'blur(4px)',
                        '& .MuiChip-icon': { color: '#42a5f5' }
                      }}
                    />
                  </Tooltip>
                )}
                
                {/* Realistic Blending badge with improved design */}
                {previewOptions.realisticBlending && (
                  <Tooltip title="Realistic Blending simulates how paint interacts with your wall's texture and surface">
                    <Chip
                      icon={<FormatColorFillIcon />}
                      label="Realistic Blend"
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(0,0,0,0.75)', 
                        color: 'white',
                        fontWeight: 500,
                        backdropFilter: 'blur(4px)',
                        '& .MuiChip-icon': { color: '#66bb6a' }
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
              
              {/* Animated effect layer */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(0,0,0,0.05))',
                  pointerEvents: 'none'
                }}
              />
              
              {/* Room context indicator */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  left: 16, 
                  zIndex: 5,
                  bgcolor: 'rgba(0,0,0,0.75)',
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  backdropFilter: 'blur(4px)',
                  animation: 'fadeInUp 0.8s ease-out',
                  '@keyframes fadeInUp': {
                    '0%': { opacity: 0, transform: 'translateY(20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                <Typography variant="body2" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontWeight: 500,
                  '& svg': { mr: 1, opacity: 0.8 }
                }}>
                  {roomType === 'Living Room' && <WeekendIcon sx={{ fontSize: '1.1rem' }} />}
                  {roomType === 'Bedroom' && <BedIcon sx={{ fontSize: '1.1rem' }} />}
                  {roomType === 'Kitchen' && <KitchenIcon sx={{ fontSize: '1.1rem' }} />}
                  {roomType === 'Bathroom' && <BathtubIcon sx={{ fontSize: '1.1rem' }} />}
                  {roomType === 'Dining Room' && <TableRestaurantIcon sx={{ fontSize: '1.1rem' }} />}
                  {roomType === 'Home Office' && <LaptopIcon sx={{ fontSize: '1.1rem' }} />}
                  {roomType} • {lightingCondition}
                </Typography>
              </Box>
            </Box>
          )}
                
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            p: 3,
            borderTop: '1px solid rgba(0,0,0,0.05)',
            background: 'linear-gradient(to bottom, rgba(250,250,255,1), rgba(255,255,255,1))'
          }}>
            <Box 
              sx={{ 
                width: 70, 
                height: 70, 
                borderRadius: '50%', 
                bgcolor: selectedColor?.hex || '#ccc',
                mr: 3,
                border: `4px solid ${alpha(selectedColor?.hex || '#ccc', 0.3)}`,
                boxShadow: `0 5px 15px ${alpha(selectedColor?.hex || '#ccc', 0.2)}`,
                flexShrink: 0,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }} 
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                justifyContent: 'space-between'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedColor?.name || 'Select a color'}
                </Typography>
                
                {selectedColor?.colorCode && (
                  <Chip 
                    label={selectedColor.colorCode} 
                    size="small"
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      fontFamily: 'monospace'
                    }}
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'monospace', 
                  fontWeight: 'bold',
                  color: alpha('#000', 0.7),
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {selectedColor?.hex ? selectedColor.hex.toUpperCase() : ''}
                  <IconButton size="small" onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    copyColorCode(selectedColor?.hex || '');
                  }} sx={{ ml: 0.5 }}>
                    {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                  </IconButton>
                </Typography>
                
                {selectedColor?.rgb && (
                  <Tooltip title={`RGB: ${selectedColor.rgb}`}>
                    <Chip 
                      label="RGB" 
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 20 }}
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
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Tooltip>
                )}
              </Box>
              
              {selectedColor?.roomTypes && selectedColor.roomTypes.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ 
                    display: 'block', 
                    mb: 0.5,
                    color: alpha('#000', 0.6),
                    fontWeight: 500
                  }}>
                    Perfect for:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedColor.roomTypes.map((room, idx) => (
                      <Chip 
                        key={idx}
                        label={room} 
                        size="small"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.7rem',
                          bgcolor: alpha(theme.palette.primary.light, 0.1),
                          color: theme.palette.primary.dark,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {selectedColor?.moodCategory && (
                <Typography variant="caption" color="text.secondary" sx={{ 
                  display: 'block', 
                  mt: 1,
                  fontWeight: 500
                }}>
                  Mood: <span style={{ fontWeight: 600 }}>{selectedColor.moodCategory}</span>
                </Typography>
              )}
              
              {selectedColor?.suitableFor && (
                <Typography variant="body2" 
                  sx={{ 
                    display: 'block', 
                    mt: 2, 
                    fontStyle: 'italic',
                    color: alpha('#000', 0.6),
                    bgcolor: alpha(theme.palette.primary.light, 0.05),
                    p: 1,
                    borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    borderRadius: '0 4px 4px 0'
                  }}
                >
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
  
  // Render the main welcome screen with colorful vibrant design and glow effects
  const renderWelcomeScreen = () => {
    return (
      <Grow in={!wallImage && !showCamera}>
        <Box
          sx={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
            padding: { xs: 3, sm: 4, md: 5 },
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 0 100px rgba(255, 107, 107, 0.2)',
            '@keyframes gradient': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' },
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 250,
              height: 250,
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1) 70%)',
              borderRadius: '50%',
              zIndex: 0,
              transform: 'rotate(10deg)',
              pointerEvents: 'none',
              animation: 'float 8s ease-in-out infinite',
              filter: 'blur(10px)'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -70,
              left: -70,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.05) 70%)',
              borderRadius: '50%',
              zIndex: 0,
              transform: 'rotate(190deg)',
              pointerEvents: 'none',
              animation: 'float 10s ease-in-out infinite reverse',
              filter: 'blur(10px)'
            },
            '@keyframes float': {
              '0%': { transform: 'translateY(0px) rotate(10deg)' },
              '50%': { transform: 'translateY(-20px) rotate(5deg)' },
              '100%': { transform: 'translateY(0px) rotate(10deg)' },
            },
          }}
        >
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Typography variant="h2" component="h1" gutterBottom
              sx={{
                color: 'white',
                fontWeight: 800,
                mb: 3,
                position: 'relative',
                zIndex: 1,
                textShadow: '2px 2px 15px rgba(0,0,0,0.15), 0 0 30px rgba(255,255,255,0.3)',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                fontSize: { xs: '1.8rem', sm: '2.3rem', md: '2.8rem' },
                lineHeight: 1.2,
                maxWidth: '90%',
                margin: '0 auto 1.5rem'
              }}
            >
              Wall Color Visualizer
            </Typography>
          </Zoom>
          
          <Fade in={true} style={{ transitionDelay: '300ms' }}>
            <Typography 
              variant="h6" 
              component="h2" 
              paragraph
              sx={{
                maxWidth: '800px',
                mx: 'auto',
                mb: 4,
                position: 'relative',
                zIndex: 1,
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500,
                lineHeight: 1.6,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
              }}
            >
              Transform your space with our color visualization tool
            </Typography>
          </Fade>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3, 
            position: 'relative',
            zIndex: 1,
            mt: 4
          }}>
            <Zoom in={true} style={{ transitionDelay: '500ms' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<CameraIcon />}
                onClick={() => setShowCamera(true)}
                sx={{
                  px: { xs: 4, sm: 6 },
                  py: { xs: 1.5, sm: 2.5 },
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.8)',
                  color: '#ff6b6b',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 0 25px rgba(255, 255, 255, 0.4)',
                  '&:hover': {
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2), 0 0 30px rgba(255, 255, 255, 0.6)',
                    transform: 'translateY(-5px) scale(1.03)',
                    background: 'rgba(255,255,255,0.9)',
                  },
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' },
                  mb: 2
                }}
              >
                Start Camera
              </Button>
            </Zoom>
            
            <Typography variant="caption" sx={{ mb: 2, fontSize: '0.9rem', fontWeight: 500, color: 'white' }}>
              or
            </Typography>
            
            <Fade in={true} style={{ transitionDelay: '700ms' }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<UploadIcon />}
                onClick={handleFileUploadClick}
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                  borderRadius: '14px',
                  borderWidth: '2px',
                  borderColor: 'rgba(255,255,255,0.8)',
                  color: 'white',
                  '&:hover': {
                    borderWidth: '2px',
                    borderColor: 'white',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1), 0 0 20px rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  transition: 'all 0.3s ease',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 500,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Upload Image
              </Button>
            </Fade>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </Box>
          
          <Box sx={{ mt: 6, position: 'relative', zIndex: 1 }}>
            <Fade in={true} style={{ transitionDelay: '900ms' }}>
              <Box 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  p: 2, 
                  borderRadius: 2,
                  backdropFilter: 'blur(5px)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 4px 15px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: 'white', filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' }} />
                  <Typography variant="body2" sx={{ color: 'white' }}>Smart Color Analysis</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: 'white', filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' }} />
                  <Typography variant="body2" sx={{ color: 'white' }}>Real-time Preview</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: 'white', filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' }} />
                  <Typography variant="body2" sx={{ color: 'white' }}>Color Matching</Typography>
                </Box>
              </Box>
            </Fade>
          </Box>
        </Box>
      </Grow>
    );
  };
  
  // Render enhanced camera view with fixed mirror issue and professional effects
  const renderCameraView = () => {
    return (
      <Fade in={showCamera} timeout={600}>
        <Box
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2), 0 0 80px rgba(255,154,158,0.3)',
            background: 'linear-gradient(45deg, #ff9a9e, #fad0c4)',
            animation: 'fadeInUp 0.6s ease-out, glow 3s infinite alternate',
            '@keyframes fadeInUp': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            },
            '@keyframes glow': {
              '0%': { boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2), 0 0 80px rgba(255,154,158,0.3)' },
              '100%': { boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2), 0 0 100px rgba(255,154,158,0.5)' }
            }
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: facingMode,
                width: 1920,
                height: 1080,
              }}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '12px',
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none', // Only mirror for front camera
              }}
              mirrored={facingMode === 'user'} // Use built-in mirror for selfie mode only
            />
            
            {/* Enhanced camera grid overlay for better alignment */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at center, transparent 0%, transparent 75%, rgba(0,0,0,0.3) 100%)',
                pointerEvents: 'none',
                zIndex: 2,
                opacity: 0.4,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    linear-gradient(to bottom, transparent 33%, rgba(255,255,255,0.1) 33%, rgba(255,255,255,0.1) 34%, transparent 34%),
                    linear-gradient(to bottom, transparent 66%, rgba(255,255,255,0.1) 66%, rgba(255,255,255,0.1) 67%, transparent 67%),
                    linear-gradient(to right, transparent 33%, rgba(255,255,255,0.1) 33%, rgba(255,255,255,0.1) 34%, transparent 34%),
                    linear-gradient(to right, transparent 66%, rgba(255,255,255,0.1) 66%, rgba(255,255,255,0.1) 67%, transparent 67%)
                  `,
                  opacity: 0.5
                }
              }}
            />
            
            {/* Camera overlay with glow effect */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              p: 2,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
              color: 'white',
              textAlign: 'center',
              animation: 'fadeInDown 0.8s ease-out',
              backdropFilter: 'blur(8px)',
              zIndex: 3,
              '@keyframes fadeInDown': {
                '0%': { opacity: 0, transform: 'translateY(-20px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}>
              <Typography variant="h6" fontWeight="bold" sx={{ 
                textShadow: '0 0 10px rgba(255,255,255,0.4)',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                Position Camera
              </Typography>
              <Typography variant="caption" sx={{ 
                opacity: 0.9, 
                display: 'block', 
                mt: 0.5,
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                textShadow: '0 0 8px rgba(255,255,255,0.3)'
              }}>
                Hold steady for accurate color detection
              </Typography>
            </Box>
            
            {/* Focus area indicator */}
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: { xs: 160, sm: 200 },
              height: { xs: 160, sm: 200 },
              transform: 'translate(-50%, -50%)',
              border: '2px dashed rgba(255,255,255,0.6)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 20,
                height: 20,
                transform: 'translate(-50%, -50%)',
                border: '2px solid rgba(255,255,255,0.9)',
                borderRadius: '50%'
              },
              animation: 'pulse 3s infinite'
            }}/>
            
            {/* Room type selector with glow effect */}
            <Box sx={{
              position: 'absolute',
              top: { xs: 80, sm: 100 },
              right: 20,
              zIndex: 10,
              animation: 'fadeInRight 0.8s ease-out',
              '@keyframes fadeInRight': {
                '0%': { opacity: 0, transform: 'translateX(20px)' },
                '100%': { opacity: 1, transform: 'translateX(0)' }
              }
            }}>
              <Paper sx={{ 
                p: 1.5, 
                bgcolor: 'rgba(0,0,0,0.6)', 
                color: 'white', 
                borderRadius: 2, 
                backdropFilter: 'blur(10px)',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.1)'
              }}>
                <Typography variant="body2" fontWeight="bold" sx={{ 
                  mb: 1,
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  textShadow: '0 0 5px rgba(255,255,255,0.3)'
                }}>
                  Room Type:
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={roomType || 'Living Room'}
                    onChange={(e: SelectChangeEvent<string>) => setRoomType(e.target.value)}
                    sx={{ 
                      minWidth: { xs: 120, sm: 140 },
                      color: 'white', 
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.8)' },
                      '& .MuiSvgIcon-root': { color: 'white' },
                      fontSize: { xs: '0.75rem', sm: '0.85rem' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: 'rgba(30,30,30,0.95)',
                          backdropFilter: 'blur(15px)',
                          color: 'white',
                          '& .MuiMenuItem-root': {
                            fontSize: { xs: '0.75rem', sm: '0.85rem' }
                          },
                          '& .MuiMenuItem-root:hover': {
                            bgcolor: 'rgba(255,154,158,0.2)'
                          },
                          '& .MuiMenuItem-root.Mui-selected': {
                            bgcolor: 'rgba(255,154,158,0.3)'
                          }
                        }
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
                </FormControl>
              </Paper>
            </Box>
            
            {/* Camera status indicator */}
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                animation: 'blink 2s infinite',
                '@keyframes blink': {
                  '0%': { opacity: 0.6 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.6 }
                },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.7,
                borderRadius: 5,
                bgcolor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(5px)'
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#4caf50',
                  boxShadow: '0 0 5px #4caf50'
                }}
              />
              <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem', fontWeight: 500 }}>
                {facingMode === 'user' ? 'Front Camera' : 'Rear Camera'}
              </Typography>
            </Box>
            
            {/* Camera controls with enhanced glow effects */}
            <Box sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              p: { xs: 2, sm: 3 },
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backdropFilter: 'blur(10px)',
              zIndex: 4,
              animation: 'fadeInUp 0.8s ease-out',
              '@keyframes fadeInUp': {
                '0%': { opacity: 0, transform: 'translateY(20px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                {/* Camera flip button with glow effect */}
                <Tooltip title={`Switch to ${facingMode === 'user' ? 'rear' : 'front'} camera`}>
                  <IconButton 
                    onClick={toggleCameraFacingMode}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      backdropFilter: 'blur(5px)',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.3)',
                        transform: 'scale(1.1)',
                        boxShadow: '0 0 15px rgba(255,255,255,0.5)'
                      },
                      width: { xs: 42, sm: 52 },
                      height: { xs: 42, sm: 52 },
                      transition: 'all 0.2s ease',
                      boxShadow: '0 0 10px rgba(255,255,255,0.2)'
                    }}
                  >
                    <FlipCameraIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  </IconButton>
                </Tooltip>
                
                {/* Animated capture button with enhanced glow */}
                <Button
                  variant="contained"
                  onClick={handleCapture}
                  sx={{
                    bgcolor: 'white',
                    color: '#ff6b6b',
                    borderRadius: '50%',
                    width: { xs: 65, sm: 85 },
                    height: { xs: 65, sm: 85 },
                    minWidth: 'auto',
                    boxShadow: '0 0 0 5px rgba(255,255,255,0.3), 0 5px 15px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.5)',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: 'white',
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 0 5px rgba(255,255,255,0.4), 0 5px 15px rgba(0,0,0,0.3), 0 0 30px rgba(255,255,255,0.7)'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      right: -4,
                      bottom: -4,
                      borderRadius: '50%',
                      border: '2px solid white',
                      opacity: 0.5,
                      animation: 'pulse 2s infinite'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: -10,
                      left: -10,
                      right: -10,
                      bottom: -10,
                      borderRadius: '50%',
                      border: '1px solid white',
                      opacity: 0.2,
                      animation: 'pulse 2s infinite 0.5s'
                    },
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)', opacity: 0.5 },
                      '50%': { transform: 'scale(1.1)', opacity: 0.2 },
                      '100%': { transform: 'scale(1)', opacity: 0.5 }
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: { xs: 24, sm: 36 } }} />
                </Button>
                
                {/* Close button with glow effect */}
                <Tooltip title="Close camera">
                  <IconButton 
                    onClick={() => setShowCamera(false)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      backdropFilter: 'blur(5px)',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.3)',
                        transform: 'scale(1.1)',
                        boxShadow: '0 0 15px rgba(255,255,255,0.5)'
                      },
                      width: { xs: 42, sm: 52 },
                      height: { xs: 42, sm: 52 },
                      transition: 'all 0.2s ease',
                      boxShadow: '0 0 10px rgba(255,255,255,0.2)'
                    }}
                  >
                    <CloseIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {/* Camera mode labels */}
              <Typography 
                variant="caption" 
                sx={{ 
                  mt: 2, 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  textShadow: '0 0 5px rgba(0,0,0,0.5)'
                }}
              >
                {facingMode === 'user' ? 'SELFIE MODE' : 'COLOR DETECTION MODE'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>
    );
  };
  
  return (
    <Box>
      {renderWelcomeScreen()}
      {renderCameraView()}
      {renderPreviewSection()}
      
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
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        {/* Drawer content */}
      </SwipeableDrawer>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            borderRadius: '10px',
            fontWeight: 500
          }
        }}
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