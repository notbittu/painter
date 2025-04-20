import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Paper, Button, Slider, TextField, ToggleButtonGroup, ToggleButton, CircularProgress, Chip, IconButton, Divider, Tooltip } from '@mui/material';
import { HexColorPicker, RgbColorPicker } from 'react-colorful';
import { colord, extend, random } from 'colord';
import namesPlugin from 'colord/plugins/names';
import cmykPlugin from 'colord/plugins/cmyk';
import labPlugin from 'colord/plugins/lab';
import a11yPlugin from 'colord/plugins/a11y';
import { styled, Theme, useTheme } from '@mui/material/styles';
import { 
  ContentCopy as CopyIcon, 
  Refresh as RefreshIcon,
  BrightnessMedium as BrightnessIcon,
  FormatColorFill as FormatColorFillIcon,
  Tune as TuneIcon,
  Check as CheckIcon,
  Autorenew as AutorenewIcon,
  Palette as PaletteIcon,
  FlipCameraAndroid as FlipCameraIcon,
  ViewInAr as Vision360Icon,
  Brightness4 as ShadowTrackingIcon
} from '@mui/icons-material';

// Extend colord with plugins
extend([namesPlugin, cmykPlugin, labPlugin, a11yPlugin]);

const ColorSwatch = styled(Box)(({ theme }: { theme: Theme }) => ({
  width: '100%',
  height: 200,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%)',
    backgroundSize: '20px 20px',
    opacity: 0.3,
    pointerEvents: 'none',
  }
}));

// New component for color format display with copy functionality
const ColorFormatDisplay = ({ label, value, onCopy }: { label: string, value: string, onCopy: () => void }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 1500);
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2">{label}:</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', mr: 1 }}>{value}</Typography>
        <IconButton size="small" onClick={handleCopy} color={copied ? "success" : "default"}>
          {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Box>
  );
};

// Interface for color intensity settings
interface ColorIntensity {
  brightness: number;
  saturation: number;
  opacity: number;
}

const ColorPickerPage = () => {
  const theme = useTheme();
  const [color, setColor] = useState('#3f51b5');
  const [colorFormat, setColorFormat] = useState<'hex' | 'rgb'>('hex');
  const [palette, setPalette] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [colorIntensity, setColorIntensity] = useState<ColorIntensity>({
    brightness: 100,
    saturation: 100,
    opacity: 100
  });
  const [shadowTracking, setShadowTracking] = useState(false);
  const [vision360, setVision360] = useState(false);
  
  const colorInfo = colord(color);
  
  // Create complementary palette
  const createPalette = () => {
    const c = colord(color);
    const newPalette = [
      c.lighten(0.2).toHex(),  // Lighter
      color,                   // Base color
      c.darken(0.2).toHex(),   // Darker
      c.rotate(180).toHex(),   // Complementary
      c.rotate(120).toHex(),   // Triadic 1
      c.rotate(240).toHex(),   // Triadic 2
      c.rotate(30).toHex(),    // Analogous 1
      c.rotate(330).toHex(),   // Analogous 2
    ];
    setPalette(newPalette);
  };
  
  // Generate AI color suggestions
  const generateAiSuggestions = () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const baseColor = colord(color);
      
      // Generate harmonious colors with slight variations in hue, saturation, and lightness
      const suggestions = [
        random().toHex(),
        baseColor.rotate(Math.random() * 30 - 15).saturate(Math.random() * 0.2).toHex(),
        baseColor.rotate(Math.random() * 30 + 15).saturate(Math.random() * 0.2 - 0.1).toHex(),
        baseColor.rotate(Math.random() * 30 + 45).saturate(Math.random() * 0.3).toHex(),
        baseColor.darken(0.1 + Math.random() * 0.1).toHex(),
        baseColor.lighten(0.1 + Math.random() * 0.1).toHex(),
      ];
      
      setAiSuggestions(suggestions);
      setIsGenerating(false);
    }, 1500);
  };
  
  // Apply color intensity settings
  useEffect(() => {
    let adjustedColor = colorInfo;
    
    // Apply brightness
    if (colorIntensity.brightness > 100) {
      adjustedColor = adjustedColor.lighten((colorIntensity.brightness - 100) / 100);
    } else if (colorIntensity.brightness < 100) {
      adjustedColor = adjustedColor.darken((100 - colorIntensity.brightness) / 100);
    }
    
    // Apply saturation
    if (colorIntensity.saturation > 100) {
      adjustedColor = adjustedColor.saturate((colorIntensity.saturation - 100) / 50);
    } else if (colorIntensity.saturation < 100) {
      adjustedColor = adjustedColor.desaturate((100 - colorIntensity.saturation) / 50);
    }
    
    // Don't update the color directly to avoid infinite loop
    // We just display the adjusted color in the UI
  }, [colorIntensity, color]);
  
  // Handle color intensity change
  const handleIntensityChange = (property: keyof ColorIntensity) => (event: Event, value: number | number[]) => {
    setColorIntensity({
      ...colorIntensity,
      [property]: value as number
    });
  };
  
  // Handle copy notification
  const handleCopy = () => {
    setNotificationText('Copied to clipboard!');
    setTimeout(() => setNotificationText(''), 2000);
  };
  
  // Toggle shadow tracking feature
  const toggleShadowTracking = () => {
    setShadowTracking(!shadowTracking);
    setNotificationText(`Shadow tracking ${!shadowTracking ? 'enabled' : 'disabled'}`);
    setTimeout(() => setNotificationText(''), 2000);
  };
  
  // Toggle Vision 360 feature
  const toggleVision360 = () => {
    setVision360(!vision360);
    setNotificationText(`NFD Vision 360 ${!vision360 ? 'enabled' : 'disabled'}`);
    setTimeout(() => setNotificationText(''), 2000);
  };

  // Get adjusted color with applied intensity settings
  const getAdjustedColor = () => {
    let adjustedColor = colorInfo;
    
    // Apply brightness
    if (colorIntensity.brightness > 100) {
      adjustedColor = adjustedColor.lighten((colorIntensity.brightness - 100) / 100);
    } else if (colorIntensity.brightness < 100) {
      adjustedColor = adjustedColor.darken((100 - colorIntensity.brightness) / 100);
    }
    
    // Apply saturation
    if (colorIntensity.saturation > 100) {
      adjustedColor = adjustedColor.saturate((colorIntensity.saturation - 100) / 50);
    } else if (colorIntensity.saturation < 100) {
      adjustedColor = adjustedColor.desaturate((100 - colorIntensity.saturation) / 50);
    }
    
    // Apply opacity (for display purposes)
    const finalColor = adjustedColor.alpha(colorIntensity.opacity / 100);
    
    return finalColor;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Advanced Color Picker
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
        Choose the perfect color for your space with our AI-enhanced interactive color tools
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, mb: 4, borderRadius: 2, position: 'relative' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Select Your Color
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <ToggleButtonGroup
                value={colorFormat}
                exclusive
                onChange={(e, value) => value && setColorFormat(value)}
                size="small"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="hex">HEX</ToggleButton>
                <ToggleButton value="rgb">RGB</ToggleButton>
              </ToggleButtonGroup>
              
              {colorFormat === 'hex' ? (
                <HexColorPicker color={color} onChange={setColor} style={{ width: '100%', height: 250 }} />
              ) : (
                <RgbColorPicker color={colord(color).toRgb()} onChange={(rgb) => setColor(colord(rgb).toHex())} style={{ width: '100%', height: 250 }} />
              )}
            </Box>
            
            {/* Smart features */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Tooltip title="Shadow Tracking">
                <IconButton 
                  color={shadowTracking ? "primary" : "default"} 
                  onClick={toggleShadowTracking}
                  sx={{ border: shadowTracking ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent' }}
                >
                  <ShadowTrackingIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="NFD Vision 360">
                <IconButton 
                  color={vision360 ? "primary" : "default"} 
                  onClick={toggleVision360}
                  sx={{ border: vision360 ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent' }}
                >
                  <Vision360Icon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh Color">
                <IconButton onClick={() => setColor(random().toHex())}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Adjust Intensity">
                <IconButton>
                  <TuneIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <TextField 
                fullWidth
                label="Hex Color" 
                value={color} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColor(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Typography gutterBottom>
                Color Name: {colorInfo.toName({ closest: true })}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    onClick={createPalette}
                    startIcon={<PaletteIcon />}
                  >
                    Generate Palette
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    fullWidth 
                    onClick={generateAiSuggestions}
                    startIcon={isGenerating ? <CircularProgress size={16} color="inherit" /> : <AutorenewIcon />}
                    disabled={isGenerating}
                  >
                    AI Suggestions
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          
          {/* Color Intensity Controls */}
          <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Color Intensity Controls
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography id="brightness-slider" gutterBottom>
                Brightness: {colorIntensity.brightness}%
              </Typography>
              <Slider
                value={colorIntensity.brightness}
                onChange={handleIntensityChange('brightness')}
                aria-labelledby="brightness-slider"
                min={50}
                max={150}
                valueLabelDisplay="auto"
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography id="saturation-slider" gutterBottom>
                Saturation: {colorIntensity.saturation}%
              </Typography>
              <Slider
                value={colorIntensity.saturation}
                onChange={handleIntensityChange('saturation')}
                aria-labelledby="saturation-slider"
                min={0}
                max={200}
                valueLabelDisplay="auto"
              />
            </Box>
            
            <Box>
              <Typography id="opacity-slider" gutterBottom>
                Opacity: {colorIntensity.opacity}%
              </Typography>
              <Slider
                value={colorIntensity.opacity}
                onChange={handleIntensityChange('opacity')}
                aria-labelledby="opacity-slider"
                min={20}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 2, mb: 4, position: 'relative' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Preview
            </Typography>
            
            <ColorSwatch sx={{ 
              bgcolor: getAdjustedColor().toRgbString(),
              boxShadow: shadowTracking ? '0px 10px 20px rgba(0,0,0,0.2), inset 0 -5px 10px rgba(0,0,0,0.1), inset 0 5px 10px rgba(255,255,255,0.3)' : undefined,
              background: vision360 ? `linear-gradient(135deg, ${getAdjustedColor().toRgbString()} 0%, ${getAdjustedColor().lighten(0.1).toRgbString()} 50%, ${getAdjustedColor().darken(0.1).toRgbString()} 100%)` : getAdjustedColor().toRgbString(),
              mb: 3 
            }} />
            
            {notificationText && (
              <Chip 
                label={notificationText} 
                color="success" 
                size="small" 
                sx={{ 
                  position: 'absolute', 
                  top: 20, 
                  right: 20,
                  animation: 'fadeIn 0.3s ease-in'
                }} 
              />
            )}
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Color Formats</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <ColorFormatDisplay
                label="HEX"
                value={getAdjustedColor().toHex().toUpperCase()}
                onCopy={handleCopy}
              />
              
              <ColorFormatDisplay
                label="RGB"
                value={getAdjustedColor().toRgbString()}
                onCopy={handleCopy}
              />
              
              <ColorFormatDisplay
                label="HSL"
                value={getAdjustedColor().toHslString()}
                onCopy={handleCopy}
              />
              
              <ColorFormatDisplay
                label="CMYK"
                value={getAdjustedColor().toCmykString()}
                onCopy={handleCopy}
              />
              
              <ColorFormatDisplay
                label="LAB"
                value={getAdjustedColor().toLab().toString()}
                onCopy={handleCopy}
              />
            </Box>
            
            {palette.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Color Palette
                </Typography>
                <Grid container spacing={2}>
                  {palette.map((c, index) => (
                    <Grid item xs={3} key={index}>
                      <Box 
                        sx={{ 
                          bgcolor: c, 
                          height: 80, 
                          borderRadius: 1, 
                          mb: 1,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 3
                          }
                        }}
                        onClick={() => setColor(c)}
                      />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {c.toUpperCase()}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
          
          {aiSuggestions.length > 0 && (
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                AI Color Suggestions
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Smart suggestions based on your selected color:
              </Typography>
              
              <Grid container spacing={2}>
                {aiSuggestions.map((c, index) => (
                  <Grid item xs={4} key={index}>
                    <Box 
                      sx={{ 
                        bgcolor: c, 
                        height: 100, 
                        borderRadius: 2, 
                        mb: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: 1,
                        position: 'relative',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: 3
                        },
                        '&:hover .color-info': {
                          opacity: 1
                        }
                      }}
                      onClick={() => setColor(c)}
                    >
                      <Box 
                        className="color-info"
                        sx={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          left: 0, 
                          right: 0, 
                          p: 1, 
                          bgcolor: 'rgba(0,0,0,0.7)', 
                          color: 'white',
                          opacity: 0,
                          transition: 'opacity 0.2s ease',
                          borderBottomLeftRadius: 2,
                          borderBottomRightRadius: 2
                        }}
                      >
                        <Typography variant="caption" component="div">
                          {colord(c).toName({ closest: true }) || c.toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 4, mt: 6, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Popular Colors
        </Typography>
        <Grid container spacing={2}>
          {['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', 
            '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107',
            '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'].map((c) => (
            <Grid item xs={6} sm={4} md={2} lg={1} key={c}>
              <Box 
                sx={{ 
                  bgcolor: c, 
                  height: 50, 
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.05)' },
                  transition: 'transform 0.2s ease'
                }}
                onClick={() => setColor(c)}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ColorPickerPage; 