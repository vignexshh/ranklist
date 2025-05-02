'use client';

import React, { useEffect, useState } from 'react';
import { Container, Autocomplete, TextField, Box, Grid, CircularProgress, Typography } from '@mui/material';
import DataDisplayGrid from './DataDisplayGrid';

const GetCategory: React.FC = () => {
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [listCategoryOptions, setListCategoryOptions] = useState<string[]>([]);
  const [listSubCategoryOptions, setListSubCategoryOptions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [dynamicFields, setDynamicFields] = useState<Record<string, any[]>>({});
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string | null>>({});
  const [error, setError] = useState<string | null>(null);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [loadingDynamicFields, setLoadingDynamicFields] = useState(false);

  // Reset dependent selections when parent selection changes
  useEffect(() => {
    if (selectedCategory !== null && selectedSubCategory !== null) {
      setSelectedSubCategory(null);
      setDynamicFields({});
      setDynamicFieldValues({});
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubCategory !== null) {
      setDynamicFieldValues({});
    }
  }, [selectedSubCategory]);

  // Fetch public token
  useEffect(() => {
    const fetchPublicToken = async () => {
      try {
        const response = await fetch('/api/public/access-key');
        const data = await response.json();

        if (response.ok && data.publicToken) {
          setPublicToken(data.publicToken);
        } else {
          setError(data.error || 'Failed to fetch public token');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching token');
      }
    };

    fetchPublicToken();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!publicToken) return;

      setLoadingCategories(true);
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
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [publicToken]);

  // Fetch subcategories
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory || !publicToken) return;

      setLoadingSubCategories(true);
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
      } finally {
        setLoadingSubCategories(false);
      }
    };

    fetchSubCategories();
  }, [selectedCategory, publicToken]);

  // Fetch dynamic fields
  useEffect(() => {
    const fetchDynamicFields = async () => {
      if (!selectedSubCategory || !publicToken) return;

      setLoadingDynamicFields(true);
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
          setDynamicFields(data.distinctfieldValues || {});
          // Initialize field values with null
          const initialValues: Record<string, string | null> = {};
          Object.keys(data.distinctfieldValues || {}).forEach(field => {
            initialValues[field] = null;
          });
          setDynamicFieldValues(initialValues);
        } else {
          setError(data.error || 'Failed to fetch dynamic fields');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching dynamic fields');
      } finally {
        setLoadingDynamicFields(false);
      }
    };

    fetchDynamicFields();
  }, [selectedSubCategory, publicToken]);

  return (
    <Container maxWidth="xl" style={{ marginTop: '2rem' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              options={listCategoryOptions}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="List Category"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingCategories ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              fullWidth
              onChange={(event, value) => {
                setSelectedCategory(value);
              }}
              loading={loadingCategories}
              value={selectedCategory}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              options={listSubCategoryOptions}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="List Sub-Category"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingSubCategories ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              fullWidth
              onChange={(event, value) => {
                setSelectedSubCategory(value);
              }}
              loading={loadingSubCategories}
              value={selectedSubCategory}
              disabled={!selectedCategory}
            />
          </Grid>
        </Grid>
      </Box>

      {Object.keys(dynamicFields).length > 0 && (
        <Box sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(dynamicFields).map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                <Autocomplete
                  options={dynamicFields[field]}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={field}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingDynamicFields ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  fullWidth
                  onChange={(event, value) => {
                    setDynamicFieldValues(prev => ({
                      ...prev,
                      [field]: value
                    }));
                  }}
                  loading={loadingDynamicFields}
                  value={dynamicFieldValues[field] || null}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <DataDisplayGrid
        publicToken={publicToken}
        selectedCategory={selectedCategory}
        selectedSubCategory={selectedSubCategory}
        dynamicFieldValues={dynamicFieldValues}
      />
    </Container>
  );
};

export default GetCategory;