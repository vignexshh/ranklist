import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LinearProgress from '@mui/material/LinearProgress'
import type { Navigation } from '@toolpad/core/AppProvider';
import theme from '../theme';
import { log } from 'console';
import type { Metadata } from 'next';
import SessionProviderWrapper from "@/components/SessionProviderWrapper";


const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: '',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'analyse-rank',
    title: 'Anaylse Rank',
    icon: <ShoppingCartIcon />,
  },
];

const BRANDING = {
  title: 'Medical Hunt',
  logo: <img src="/favicon.png" alt="MUI logo" />
  
};


export const metadata: Metadata = {
  title: 'My App',
  description: 'A cool Next.js app.',
};


export default function RootLayout(props: { children: React.ReactNode }) {


  return (
    <html lang="en" data-toolpad-color-scheme="light" suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.png'/>
         </head>
      <body>
        <SessionProviderWrapper> 
     
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <React.Suspense fallback={<LinearProgress />}>
              <NextAppProvider
                navigation={NAVIGATION}
                branding={BRANDING}
                theme={theme}
              >
                {props.children}
              </NextAppProvider>
            </React.Suspense>
          </AppRouterCacheProvider>
          </SessionProviderWrapper>
     
      </body>
    </html>
  );
}
