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
  Panorama as PanoramaIcon,
  Tune as TuneIcon,
  InfoOutlined as InfoOutlinedIcon,
  RestartAlt as RestartAltIcon,
  LightMode as LightModeIcon
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
  
  // Render color adjustment controls with enhanced UI
  const renderColorAdjustmentControls = () => {
    return (
      <Fade in={true} timeout={800}>
        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
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
              color: theme.palette.primary.main
            }}
          >
            <TuneIcon /> Fine-Tune Visualization
          </Typography>
          
          <Grid container spacing={3}>
            {/* Intensity slider with enhanced UI */}
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between' 
                }}
              >
                <span>
                  <OpacityIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'text-bottom', opacity: 0.7 }} /> 
                  Color Intensity
                </span>
                <Chip 
                  label={`${previewOptions.intensity}%`} 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
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
                    color: theme.palette.primary.main,
                    '& .MuiSlider-thumb': {
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.primary.main, 0.16)}`
                      }
                    }
                  }}
                />
              </Box>
            </Grid>
            
            {/* Realistic Blending toggle with enhanced UI */}
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center' 
                }}
              >
                <FormatColorFillIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'text-bottom', opacity: 0.7 }} /> 
                Realistic Blending
              </Typography>
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
                    color="primary"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.main
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.5)
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color={previewOptions.realisticBlending ? 'primary' : 'text.secondary'}>
                    {previewOptions.realisticBlending ? 'Enabled' : 'Disabled'}
                  </Typography>
                }
              />
              <Tooltip title="Realistic Blending simulates how paint interacts with your wall's texture and surface">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
            
            {/* Shadow Tracking toggle with enhanced UI */}
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center' 
                }}
              >
                <ShadowTrackingIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'text-bottom', opacity: 0.7 }} /> 
                Shadow Tracking
              </Typography>
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
                    color="primary"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#ffa726'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: alpha('#ffa726', 0.5)
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color={previewOptions.shadowTracking ? '#d97706' : 'text.secondary'}>
                    {previewOptions.shadowTracking ? 'Enabled' : 'Disabled'}
                  </Typography>
                }
              />
              <Tooltip title="Shadow Tracking uses AI to adapt the paint color to existing shadows and lighting conditions on your wall">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
            
            {/* Vision 360 toggle with enhanced UI */}
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center' 
                }}
              >
                <Vision360Icon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'text-bottom', opacity: 0.7 }} /> 
                Vision 360
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={previewOptions.vision360}
                    onChange={() => {
                      setPreviewOptions({
                        ...previewOptions,
                        vision360: !previewOptions.vision360
                      });
                    }}
                    color="primary"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#42a5f5'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: alpha('#42a5f5', 0.5)
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color={previewOptions.vision360 ? '#1976d2' : 'text.secondary'}>
                    {previewOptions.vision360 ? 'Enabled' : 'Disabled'}
                  </Typography>
                }
              />
              <Tooltip title="NFD Vision 360 analyzes your wall's depth and contours for realistic paint visualization">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          
          {/* Lighting condition selector with enhanced UI */}
          <Box sx={{ mt: 3 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1, 
                display: 'flex', 
                alignItems: 'center' 
              }}
            >
              <LightModeIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'text-bottom', opacity: 0.7 }} /> 
              Lighting Condition
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={lightingCondition}
                onChange={(e) => setLightingCondition(e.target.value as string)}
                sx={{ 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.2)
                  }
                }}
              >
                <MenuItem value="Well-lit">Well-lit Room</MenuItem>
                <MenuItem value="Natural light">Natural Light</MenuItem>
                <MenuItem value="Artificial light">Artificial Light</MenuItem>
                <MenuItem value="Low light">Low Light</MenuItem>
                <MenuItem value="Evening light">Evening Light</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
              Selecting the correct lighting helps visualize how colors will appear in your actual environment
            </Typography>
          </Box>
          
          {/* Actions row with enhanced buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4,
            pt: 3,
            borderTop: `1px solid ${alpha('#000', 0.05)}`
          }}>
            <Button
              variant="outlined"
              onClick={resetPreviewOptions}
              startIcon={<RestartAltIcon />}
              size="small"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 2
              }}
            >
              Reset Options
            </Button>
            
            <Button
              variant="contained"
              onClick={applyPreviewOptions}
              startIcon={<CheckIcon />}
              size="small"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 2,
                boxShadow: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                '&:hover': {
                  boxShadow: 4,
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                }
              }}
            >
              Apply Changes
            </Button>
          </Box>
        </Paper>
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
                  {selectedColor?.hex?.toUpperCase()}
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
              animation: 'float 8s ease-in-out infinite',
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
              animation: 'float 10s ease-in-out infinite reverse',
            },
            '@keyframes float': {
              '0%': { transform: 'translateY(0px) rotate(10deg)' },
              '50%': { transform: 'translateY(-20px) rotate(5deg)' },
              '100%': { transform: 'translateY(0px) rotate(10deg)' },
            },
          }}
        >
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
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
                textTransform: 'uppercase',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              Wall Color Visualizer
            </Typography>
          </Zoom>
          
          <Fade in={true} style={{ transitionDelay: '300ms' }}>
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
                lineHeight: 1.6,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
              }}
            >
              Transform your space with our AI-powered tool that suggests perfect colors based on your wall type and lighting conditions
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
                  px: 6,
                  py: 2.5,
                  borderRadius: '16px',
                  backgroundImage: 'linear-gradient(to right, #6366f1, #8b5cf6, #d946ef)',
                  boxShadow: '0 10px 25px rgba(99, 102, 241, 0.5)',
                  '&:hover': {
                    boxShadow: '0 15px 30px rgba(99, 102, 241, 0.6)',
                    transform: 'translateY(-5px) scale(1.03)',
                    backgroundImage: 'linear-gradient(to right, #4f46e5, #7c3aed, #c026d3)',
                  },
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' },
                  mb: 2
                }}
              >
                Get Started with Camera
              </Button>
            </Zoom>
            
            <Typography variant="caption" color="textSecondary" sx={{ mb: 2, fontSize: '0.9rem', fontWeight: 500 }}>
              or
            </Typography>
            
            <Fade in={true} style={{ transitionDelay: '700ms' }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<UploadIcon />}
                onClick={handleFileUploadClick}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: '14px',
                  borderWidth: '2px',
                  borderColor: 'rgba(99, 102, 241, 0.5)',
                  color: '#6366f1',
                  '&:hover': {
                    borderWidth: '2px',
                    borderColor: '#6366f1',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 15px rgba(0, 0, 0, 0.05)',
                    backgroundColor: 'rgba(99, 102, 241, 0.04)',
                  },
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  fontWeight: 500,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Upload Wall Image
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
              <Paper 
                elevation={0} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.5)', 
                  p: 2, 
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: 'success.main' }} />
                  <Typography variant="body2">AI Enhanced Color Suggestions</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: 'success.main' }} />
                  <Typography variant="body2">Realistic Shadow Detection</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: 'success.main' }} />
                  <Typography variant="body2">Room-Specific Color Palettes</Typography>
                </Box>
              </Paper>
            </Fade>
          </Box>
        </Paper>
      </Grow>
    );
  };
  
  // Render enhanced camera view with improved UI
  const renderCameraView = () => {
    return (
      <Fade in={showCamera} timeout={600}>
        <Paper
          elevation={6}
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)',
            animation: 'fadeInUp 0.6s ease-out',
            '@keyframes fadeInUp': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
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
              }}
            />
            
            {/* Camera overlay with improved design and animations */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              p: 2,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
              color: 'white',
              textAlign: 'center',
              animation: 'fadeInDown 0.8s ease-out',
              '@keyframes fadeInDown': {
                '0%': { opacity: 0, transform: 'translateY(-20px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}>
              <Typography variant="h6" fontWeight="bold">
                Position Camera for Best Results
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
                Ensure good lighting and hold steady for accurate color detection
              </Typography>
              
              {/* Animated guidelines overlay */}
              <Box sx={{
                position: 'absolute',
                top: 80,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '80%',
                border: '2px dashed rgba(255,255,255,0.4)',
                borderRadius: '8px',
                display: { xs: 'none', md: 'block' },
                animation: 'pulseBorder 2s infinite',
                '@keyframes pulseBorder': {
                  '0%': { borderColor: 'rgba(255,255,255,0.2)' },
                  '50%': { borderColor: 'rgba(255,255,255,0.6)' },
                  '100%': { borderColor: 'rgba(255,255,255,0.2)' }
                },
                zIndex: 5,
                pointerEvents: 'none'
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: 10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: '4px',
                  px: 1,
                  py: 0.5
                }}>
                  <Typography variant="caption">Align wall within frame</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Room type selector with enhanced UI */}
            <Box sx={{
              position: 'absolute',
              top: 100,
              right: 20,
              zIndex: 10,
              animation: 'fadeInRight 0.8s ease-out',
              '@keyframes fadeInRight': {
                '0%': { opacity: 0, transform: 'translateX(20px)' },
                '100%': { opacity: 1, transform: 'translateX(0)' }
              }
            }}>
              <Paper sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.75)', color: 'white', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                  Wall Type:
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={roomType || 'Living Room'}
                    onChange={(e) => setRoomType(e.target.value as string)}
                    sx={{ 
                      minWidth: 160,
                      color: 'white', 
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.7)' },
                      '& .MuiSvgIcon-root': { color: 'white' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: 'rgba(30,30,30,0.95)',
                          color: 'white',
                          '& .MuiMenuItem-root:hover': {
                            bgcolor: 'rgba(99,102,241,0.2)'
                          },
                          '& .MuiMenuItem-root.Mui-selected': {
                            bgcolor: 'rgba(99,102,241,0.3)'
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
                    <MenuItem value="Accent Wall">Accent Wall</MenuItem>
                    <MenuItem value="Hallway">Hallway</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Lighting Condition:
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    value={lightingCondition || 'Well-lit'}
                    onChange={(e, newValue) => {
                      if (newValue) setLightingCondition(newValue);
                    }}
                    size="small"
                    fullWidth
                    sx={{
                      '.MuiToggleButton-root': {
                        color: 'rgba(255,255,255,0.7)',
                        borderColor: 'rgba(255,255,255,0.2)',
                        textTransform: 'none',
                        '&.Mui-selected': {
                          color: 'white',
                          backgroundColor: 'rgba(99,102,241,0.5)',
                        }
                      }
                    }}
                  >
                    <ToggleButton value="Well-lit">
                      <LightIcon sx={{ fontSize: 14, mr: 0.5 }} /> Bright
                    </ToggleButton>
                    <ToggleButton value="Dimly lit">
                      <Brightness4Icon sx={{ fontSize: 14, mr: 0.5 }} /> Dim
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Paper>
            </Box>
            
            {/* Enhanced camera controls with animations */}
            <Box sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              p: 3,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'fadeInUp 0.8s ease-out',
              '@keyframes fadeInUp': {
                '0%': { opacity: 0, transform: 'translateY(20px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}>
              <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                Tap capture when your wall is properly framed
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {/* Camera flip button with animation */}
                <Tooltip title={`Switch to ${facingMode === 'user' ? 'back' : 'front'} camera`}>
                  <IconButton 
                    onClick={toggleCameraFacingMode}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.25)',
                        transform: 'scale(1.1)'
                      },
                      width: 50,
                      height: 50,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FlipCameraIcon />
                  </IconButton>
                </Tooltip>
                
                {/* Animated capture button */}
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
                    boxShadow: '0 0 0 5px rgba(255,255,255,0.3), 0 5px 15px rgba(0,0,0,0.3)',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: 'white',
                      transform: 'scale(1.05)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '-8px',
                      left: '-8px',
                      right: '-8px',
                      bottom: '-8px',
                      borderRadius: '50%',
                      border: '2px solid white',
                      opacity: 0.5,
                      animation: 'pulse 2s infinite',
                    },
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)', opacity: 0.5 },
                      '50%': { transform: 'scale(1.1)', opacity: 0.3 },
                      '100%': { transform: 'scale(1)', opacity: 0.5 }
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 36 }} />
                </Button>
                
                {/* Cancel button */}
                <Tooltip title="Close camera">
                  <IconButton 
                    onClick={() => setShowCamera(false)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.25)',
                        transform: 'scale(1.1)'
                      },
                      width: 50,
                      height: 50,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
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
            <Typography variant="h6" gutterBottom sx={{ 
              mb: 3, 
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 60,
                height: 3,
                bgcolor: 'primary.main',
                borderRadius: 3
              }
            }}>
              AI Recommended Colors For Your Wall
            </Typography>
            
            <Grid container spacing={3}>
              {colorResult.dominantColors.map((color, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: selectedColor?.hex === color.hex ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: selectedColor?.hex === color.hex ? '0 15px 30px rgba(0,0,0,0.15)' : '0 5px 15px rgba(0,0,0,0.05)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: selectedColor?.hex === color.hex ? `2px solid ${theme.palette.primary.main}` : 'none',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 15px 30px rgba(0,0,0,0.15)'
                        },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onClick={() => handleColorSelect(color)}
                    >
                      <Box
                        sx={{
                          height: '150px',
                          backgroundColor: color.hex,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%)',
                            backgroundSize: '20px 20px',
                            opacity: 0.2
                          }
                        }}
                      >
                        {/* Room type indicator */}
                        {color.roomTypes && color.roomTypes.length > 0 && (
                          <Chip 
                            label={color.roomTypes[0]}
                            size="small"
                            sx={{ 
                              position: 'absolute', 
                              top: 10, 
                              right: 10,
                              bgcolor: 'rgba(0,0,0,0.4)',
                              color: 'white',
                              fontWeight: 500,
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                        
                        {/* Light reflectance value */}
                        {color.lightReflectanceValue && (
                          <Tooltip title="Light Reflectance Value">
                            <Chip 
                              icon={<LightIcon sx={{ fontSize: '0.9rem', color: 'white' }} />}
                              label={color.lightReflectanceValue}
                              size="small"
                              sx={{ 
                                position: 'absolute', 
                                bottom: 10, 
                                left: 10,
                                bgcolor: 'rgba(0,0,0,0.4)',
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 0 }}>
                            {color.name}
                          </Typography>
                          <Chip 
                            label={color.brand} 
                            size="small"
                            sx={{ 
                              fontSize: '0.65rem', 
                              height: 20,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        
                        {color.moodCategory && (
                          <Chip 
                            label={color.moodCategory} 
                            size="small"
                            sx={{ 
                              mb: 1.5, 
                              fontSize: '0.7rem', 
                              height: 20,
                              alignSelf: 'flex-start',
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main
                            }}
                          />
                        )}
                        
                        {color.suitableFor && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, flexGrow: 1 }}>
                            {color.suitableFor}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            fontFamily: 'monospace', 
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}>
                            {color.hex.toUpperCase()}
                          </Typography>
                          <Box>
                            <IconButton 
                              size="small" 
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                copyColorCode(color.hex);
                              }}
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                }
                              }}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
            
            {/* Color palette suggestions with animations */}
            {colorResult.suggestedPalettes && colorResult.suggestedPalettes.length > 0 && (
              <Box sx={{ mt: 5 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  mb: 3, 
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: 60,
                    height: 3,
                    bgcolor: 'primary.main',
                    borderRadius: 3
                  }
                }}>
                  Coordinated Color Palettes
                </Typography>
                
                <Grid container spacing={3}>
                  {colorResult.suggestedPalettes.map((palette, paletteIndex) => (
                    <Grid item xs={12} md={6} key={paletteIndex}>
                      <Fade in={true} style={{ transitionDelay: `${paletteIndex * 150}ms` }}>
                        <Paper sx={{ p: 3, borderRadius: 3, overflow: 'hidden', height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                            {palette.name}
                          </Typography>
                          
                          {palette.style && (
                            <Chip 
                              label={palette.style} 
                              size="small"
                              sx={{ 
                                mb: 1,
                                fontSize: '0.7rem', 
                                height: 20,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main
                              }}
                            />
                          )}
                          
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            {palette.description}
                          </Typography>
                          
                          <Grid container spacing={1} sx={{ mb: 2 }}>
                            {palette.colors.map((color, colorIndex) => (
                              <Grid item xs={4} key={colorIndex}>
                                <Box 
                                  sx={{ 
                                    bgcolor: color.hex, 
                                    height: 100, 
                                    borderRadius: 2, 
                                    mb: 1,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    transform: selectedColor?.hex === color.hex ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: selectedColor?.hex === color.hex ? 
                                      '0 5px 15px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
                                    border: selectedColor?.hex === color.hex ? 
                                      `2px solid ${theme.palette.primary.main}` : 'none',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                                    },
                                    position: 'relative'
                                  }}
                                  onClick={() => handleColorSelect(color)}
                                >
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      p: 0.5,
                                      bgcolor: 'rgba(0,0,0,0.5)',
                                      color: 'white',
                                      textAlign: 'center',
                                      fontSize: '0.65rem',
                                      fontWeight: 500,
                                      borderBottomLeftRadius: 2,
                                      borderBottomRightRadius: 2,
                                      opacity: 0,
                                      transition: 'opacity 0.2s ease',
                                      '.MuiBox-root:hover &': {
                                        opacity: 1
                                      }
                                    }}
                                  >
                                    {color.name}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>
                                  {color.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                  {color.hex.toUpperCase()}
                                </Typography>
                              </Grid>
                            ))}
                          </Grid>
                          
                          <Button 
                            variant="outlined" 
                            size="small" 
                            fullWidth
                            onClick={() => {
                              // Apply the first color from the palette
                              if (palette.colors && palette.colors.length > 0) {
                                handleColorSelect(palette.colors[0]);
                              }
                            }}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              mt: 1
                            }}
                          >
                            <PaletteIcon sx={{ mr: 1, fontSize: '1rem' }} />
                            Try This Palette
                          </Button>
                        </Paper>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
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