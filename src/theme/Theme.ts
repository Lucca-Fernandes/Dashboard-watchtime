import { createTheme } from '@mui/material/styles';

const primaryColor = '#5231ef'; 
const secondaryColor = '#edf7fd'; 
const theme = createTheme({
  palette: {
    mode: 'light', 
    primary: {
      main: primaryColor,
    },
    secondary: {
      main: secondaryColor,
    },
    background: {
      default: '#FFFFFF', 
      paper: secondaryColor, 
    },
    text: {
      primary: '#1a1a1a', 
      secondary: primaryColor, 
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif', 
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', 
          borderRadius: 8, 
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: secondaryColor, 
          padding: '16px', 
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)', 
        },
      },
    },
    MuiTableCell: { 
      styleOverrides: {
        head: {
          backgroundColor: primaryColor, 
          color: '#FFFFFF', 
          fontWeight: 'bold',
        },
        body: {
          color: '#333333', 
        },
      },
    },
  },
});

export default theme;