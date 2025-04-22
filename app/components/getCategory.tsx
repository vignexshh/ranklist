'use client';

import React, { useEffect, useState } from 'react';
import { Container, Autocomplete, TextField } from '@mui/material';

const GetCategory: React.FC = () => {
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [listCategoryOptions, setListCategoryOptions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // State for selected value
  const [error, setError] = useState<string | null>(null);

  // Fetch public token once
  useEffect(() => {
    const fetchPublicToken = async () => {
      try {
        const response = await fetch('/api/public/access-key');
        const data = await response.json();

        if (response.ok && data.publicToken) {
          setPublicToken(data.publicToken); // Save token to state
        } else {
          setError(data.error || 'Failed to fetch public token');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching token');
      }
    };

    fetchPublicToken();
  }, []);

  // Fetch distinct data once publicToken is available
  useEffect(() => {
    const fetchData = async () => {
      if (!publicToken) return; // Wait for token

      try {
        const response = await fetch('/api/fetch-distinct-data', {
          headers: {
            'x-api-key': publicToken,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setListCategoryOptions(data.distinctData?.listCategory || []);
        } else {
          setError(data.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      }
    };

    fetchData();
  }, [publicToken]);

  // Send selected value to API
  useEffect(() => {
    const sendSelectedValue = async () => {
      if (!selectedCategory) return; // Wait for a selection

      try {
        const response = await fetch('/api/handle-selected-category', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ category: selectedCategory }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Failed to send selected category:', data.error);
        } else {
          console.log('Category successfully sent to API:', data);
        }
      } catch (err) {
        console.error('Error sending selected category:', err);
      }
    };

    sendSelectedValue();
  }, [selectedCategory]);

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <Autocomplete
        options={listCategoryOptions}
        renderInput={(params) => <TextField {...params} label="List Category" />}
        style={{ marginBottom: '1rem' }}
        onChange={(event, value) => {
          setSelectedCategory(value); // Update state with selected value
        }}
      />
    </Container>
  );
};

export default GetCategory;