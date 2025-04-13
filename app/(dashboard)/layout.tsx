import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Fullscreen } from '@mui/icons-material';

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <PageContainer sx={{ bgcolor: 'primary.light', width: '100%' }}>{props.children}</PageContainer>
    </DashboardLayout>
  );
}  
