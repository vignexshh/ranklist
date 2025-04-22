'use client';
import * as React from 'react';
import { Container, Autocomplete, TextField , Box} from '@mui/material';
import { useEffect, useState } from 'react';
import  GetCategory  from '@/app/components/getCategory'; 
import GetSubCategory from '@/app/components/getSubCategory';



export default function Dashboard() {
    return (
        <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
            <Box sx={{bgcolor: 'white', padding: '2rem', borderRadius: '8px', width: '100%'}}> 
            {/* category and sub category comes together */}
            <GetSubCategory /> 
            </Box>
        </Container>
    );
}