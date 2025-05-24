'use client';
import * as React from 'react';
import { Container, Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import GetCategories from '@/components/GetCategories';

export default function Dashboard() {

  return (
    <Container maxWidth={false} disableGutters style={{ width: '100%', margin: 0, padding: 0 }}>
      <Box sx={{ bgcolor: 'white', width: '100%', minHeight: '100vh', p: 4 }}>
      <GetCategories />
      </Box>
    </Container>
  );
}
