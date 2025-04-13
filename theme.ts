"use client";
import { createTheme } from '@mui/material/styles';
import { Manrope } from 'next/font/google';

// Load Manrope font
const manrope = Manrope({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Create theme with Manrope font
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#EAEFF7',
      main: '#003cff',
      dark: '#0000cd',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
  typography: {
    fontFamily: manrope.style.fontFamily,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: manrope.style.fontFamily,
        }
      }
    }
  }
});

export default theme;