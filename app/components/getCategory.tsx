'use client';

import React, { useEffect, useState } from 'react';
import { Container, Autocomplete, TextField, Box } from '@mui/material';

const GetCategory: React.FC = () => {
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [listCategoryOptions, setListCategoryOptions] = useState<string[]>([]); // Categories
  const [listSubCategoryOptions, setListSubCategoryOptions] = useState<string[]>([]); // Subcategories
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Selected category
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null); // Selected subcategory
  const [dynamicFields, setDynamicFields] = useState<Record<string, any[]>>({}); // Dynamic fields from API
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

  // Fetch distinct categories once publicToken is available
  useEffect(() => {
    const fetchCategories = async () => {
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
          setError(data.error || 'Failed to fetch categories');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching categories');
      }
    };

    fetchCategories();
  }, [publicToken]);

  // Fetch subcategories when a category is selected
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory || !publicToken) return; // Wait for selection and token

      try {
        const response = await fetch('/api/fetch-distinct-subcategory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': publicToken,
          },
          body: JSON.stringify({ category: selectedCategory }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setListSubCategoryOptions(data.distinctSubCategories || []);
        } else {
          setError(data.error || 'Failed to fetch subcategories');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching subcategories');
      }
    };

    fetchSubCategories();
  }, [selectedCategory, publicToken]);

  // Fetch dynamic fields when a subcategory is selected
  useEffect(() => {
    const fetchDynamicFields = async () => {
      if (!selectedSubCategory || !publicToken) return; // Wait for selection and token

      try {
        const response = await fetch('/api/fetch-filters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': publicToken,
          },
          body: JSON.stringify({ subCategory: selectedSubCategory }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setDynamicFields(data.distinctfieldValues || {}); // Save dynamic fields to state
        } else {
          setError(data.error || 'Failed to fetch dynamic fields');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching dynamic fields');
      }
    };

    fetchDynamicFields();
  }, [selectedSubCategory, publicToken]);

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Autocomplete for Categories */}
      <Autocomplete
        options={listCategoryOptions}
        renderInput={(params) => <TextField {...params} label="List Category" />}
        style={{ marginBottom: '1rem' }}
        onChange={(event, value) => {
          setSelectedCategory(value); // Update state with selected category
        }}
      />
      <Box> 
        {/* Autocomplete for Categories */}
      {/* Autocomplete for Subcategories */}
      <Autocomplete
        options={listSubCategoryOptions}
        renderInput={(params) => <TextField {...params} label="List Sub-Category" />}
        style={{ marginBottom: '1rem' }}
        onChange={(event, value) => {
          setSelectedSubCategory(value); // Update state with selected subcategory
        }}
      />

      {/* Dynamic Autocomplete Components */}
      {Object.keys(dynamicFields).map((field) => (
        <Autocomplete
          key={field}
          options={dynamicFields[field]}
          renderInput={(params) => <TextField {...params} label={field} />}
          style={{ marginBottom: '1rem' }}
        />
      ))}
      </Box>
    </Container>
  );
};

export default GetCategory;