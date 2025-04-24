'use client';
// need to use client component to use hooks
import React, { useEffect, useState } from 'react';
import { Container, Autocomplete, TextField, Box, Grid, CircularProgress } from '@mui/material';

const GetCategory: React.FC = () => {
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [listCategoryOptions, setListCategoryOptions] = useState<string[]>([]);
  const [listSubCategoryOptions, setListSubCategoryOptions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [dynamicFields, setDynamicFields] = useState<Record<string, any[]>>({});
  
  const [error, setError] = useState<string | null>(null);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [loadingDynamicFields, setLoadingDynamicFields] = useState(false);

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
        style={{ marginBottom: '1rem' }}
        onChange={(event, value) => {
          setSelectedCategory(value);
        }}
        loading={loadingCategories}
      />

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
        style={{ marginBottom: '1rem' }}
        onChange={(event, value) => {
          setSelectedSubCategory(value);
        }}
        loading={loadingSubCategories}
      />

      <Box>
        <Grid spacing={5}>
          {Object.keys(dynamicFields).map((field) => (
            <Autocomplete
              key={field}
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
              style={{ marginBottom: '1rem' }}
              loading={loadingDynamicFields}
            />
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default GetCategory;