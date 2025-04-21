'use client';
import * as React from 'react';
import { Container, Autocomplete, TextField , Box} from '@mui/material';
import { useEffect, useState } from 'react';



export default function getCategories() {
    const [listCategoryOptions, setListCategoryOptions] = useState<string[]>([]);
    const [listSubCategoryOptions, setListSubCategoryOptions] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/fetch-distinct-data', {
                    headers: {
                        'x-api-key':'h-K55jxxYYojvnrk2Ng9UtBCRlhk02jAxVqLoAiRqY34jKHhTTLPpY2fuynaFsiScyoDTajW6dS9TuX6iSsbGkGZ5C8htPuRcoY9cSWh5fV70vdK7AUwC1SN9nSoeI6', // Replace with your public API key
                    },
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setListCategoryOptions(data.distinctData?.listCategory || []);
                    setListSubCategoryOptions(data.distinctData?.listSubCategory || []);
                } else {
                    setError(data.error || 'Failed to fetch data');
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('An unexpected error occurred');
            }
        };

        fetchData();
    }, []);

    return (
        <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
            

            <Autocomplete
                options={listCategoryOptions}
                renderInput={(params) => <TextField {...params} label="List Category" />}
                style={{ marginBottom: '1rem' }}
            />

            <Autocomplete
                options={listSubCategoryOptions}
                renderInput={(params) => <TextField {...params} label="List Sub-Category" />}
            />
        </Container>
    );
}