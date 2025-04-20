import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      background: 'linear-gradient(90deg, #6366f1, #ec4899)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.1rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(231, 235, 240, 0.8)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '10px',
          padding: '8px 16px',
          transition: 'all 0.3s ease',
          boxShadow: 'none',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 70%)',
            transform: 'translateX(-100%)',
          },
          '&:hover::after': {
            transform: 'translateX(100%)',
            transition: 'transform 0.6s ease-in-out',
          },
        },
        contained: {
          backgroundImage: 'linear-gradient(to right, #6366f1, #ec4899)',
          '&:hover': {
            backgroundImage: 'linear-gradient(to right, #4f46e5, #db2777)',
            boxShadow: '0px 6px 15px rgba(99, 102, 241, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.06)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(240, 240, 250, 0.9)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.09)',
            transform: 'translateY(-5px) scale(1.01)',
          },
        },
        elevation1: {
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.04)',
        },
        elevation2: {
          boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          borderRadius: '16px',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'linear-gradient(225deg, rgba(99, 102, 241, 0.15), transparent 80%)',
            borderTopRightRadius: '16px',
            zIndex: 0,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            background: 'rgba(99, 102, 241, 0.1)',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
          backgroundAttachment: 'fixed',
          scrollBehavior: 'smooth',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          padding: '0 16px',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          boxShadow: '0px 2px 6px rgba(99, 102, 241, 0.3)',
          '&:hover': {
            boxShadow: '0px 3px 8px rgba(99, 102, 241, 0.5)',
          },
        },
        track: {
          background: 'linear-gradient(to right, #6366f1, #ec4899)',
          border: 'none',
        },
      },
    },
  },
});

export default theme; 