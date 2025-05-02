import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemText, Alert, CircularProgress, Autocomplete, TextField } from '@mui/material';

const GetCategoryData: React.FC = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [subcategories, setsubCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const tokenResponse = await axios.get('/api/public/access-key');
                const { publicToken } = tokenResponse.data;

                const response = await axios.get('/api/list-categories', {
                    headers: { 'x-api-key': publicToken },
                });

                setCategories(response.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch categories');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = async (value: string | null) => {
        setSelectedCategory(value); // Update the selected category state
        if (!value) return;
        setLoading(true);
        try {
            const tokenResponse = await axios.get('/api/public/access-key');
            const { publicToken } = tokenResponse.data;

            const response = await axios.post(
                '/api/list-sub-categories',
                { category: value },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': publicToken,
                    },
                }
            );

            const { subCategories: distinctSubCategories } = response.data;
            setsubCategories(distinctSubCategories);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch sub categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubCategoryChange = async (value: string | null) => {
        if (!value) return;
        setLoading(true);
        try {
            const tokenResponse = await axios.get('/api/public/access-key');
            const { publicToken } = tokenResponse.data;

            await axios.post(
                '/api/other-categories',
                { subCategory: value },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': publicToken,
                    },
                }
            );
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit sub category');
        } finally {
            setLoading(false);
        }
    };
// error logs and loading state
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box mt={2}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box mt={2} display="flex" flexDirection="row" justifyContent="space-between" gap='20px' >
            <Autocomplete
            options={categories}
            value={selectedCategory} // Bind the selected category state
            renderInput={(params) => (
                <TextField {...params} label="Select a circular category" variant="outlined" />
            )}
            getOptionLabel={(option) => option}
            style={{ width: 300, marginBottom: '1rem' }}
            onChange={(event, value) => handleCategoryChange(value)}
            />
            <Autocomplete
            options={subcategories}
            renderInput={(params) => (
                <TextField {...params} label="Select a circular sub category" variant="outlined" />
            )}
            getOptionLabel={(option) => option}
            style={{ width: 300 }}
            onChange={(event, value) => handleSubCategoryChange(value)}
            />
        </Box>
    );
};

export default GetCategoryData;
