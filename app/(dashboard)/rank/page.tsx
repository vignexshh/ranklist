'use client';
import * as React from 'react';
import { Container, Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import GetCategories from '@/components/GetCategories';

export default function Dashboard() {

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Box sx={{ bgcolor: 'white', padding: '2rem', borderRadius: '8px' }}>
        <GetCategories/>
      </Box>
    </Container>
  );
}
