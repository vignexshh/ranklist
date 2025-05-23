'use client';
import * as React from 'react';
import { Container, Autocomplete, TextField , Box} from '@mui/material';
import { useEffect, useState } from 'react';
import GetCategories from '@/components/GetCategories';



export default function Dashboard() {
    return (
        <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
            <Box sx={{bgcolor: 'white', padding: '2rem', borderRadius: '8px', width: '100%'}}>
            <GetCategories/>
            </Box>
        </Container>
    );
}