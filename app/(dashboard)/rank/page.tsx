// app/medical-data/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Autocomplete, Box, Container, Paper, Typography, 
  TextField, CircularProgress, Skeleton, Grid
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export default function MedicalDataPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);
  
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  const [fieldOptions, setFieldOptions] = useState<Record<string, string[]>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string | null>>({});
  const [loadingFieldOptions, setLoadingFieldOptions] = useState<Record<string, boolean>>({});
  
  // Dynamic filterableFields state instead of constant
  const [filterableFields, setFilterableFields] = useState<string[]>([]);
  const [defaultColumns, setDefaultColumns] = useState<GridColDef[]>([]);

  // Initial load for data and fields structure
  useEffect(() => {
    // Initial data fetch to get structure
    const initializeDataStructure = async () => {
      try {
        const response = await fetch(`/api/medical-data?page=0&pageSize=1`);
        const result = await response.json();
        
        if (response.ok && result.data && result.data.length > 0) {
          // Get field names from the first record
          const sampleRecord = result.data[0];
          const fieldNames = Object.keys(sampleRecord).filter(key => 
            key !== "_id" && key !== "id"
          );
          
          // Set filterable fields - we'll make fields with string values filterable
          const potentialFilterFields = fieldNames.filter(field => 
            typeof sampleRecord[field] === 'string' || 
            sampleRecord[field] === null || 
            sampleRecord[field] === undefined
          );
          setFilterableFields(potentialFilterFields);
          
          // Create default columns
          const generatedColumns: GridColDef[] = fieldNames.map(field => ({
            field,
            headerName: field,
            // Customize based on field characteristics
            width: ["SNo", "Rank", "Remarks"].includes(field) ? 100 : undefined,
            flex: field.toLowerCase().includes("institute") ? 1.5 : 1,
          }));
          setDefaultColumns(generatedColumns);
          
          // Now fetch distinct values for each filterable field
          await fetchAllFieldOptions(potentialFilterFields);
        }
      } catch (error) {
        console.error("Failed to initialize data structure:", error);
      }
    };
    
    initializeDataStructure();
  }, []);

  // Main data fetch when filters change
  useEffect(() => {
    fetchData();
  }, [page, selectedCategory, selectedSubcategory, selectedFilters]);

  // Fetch field options when category/subcategory changes
  useEffect(() => {
    if ((selectedCategory || selectedSubcategory) && filterableFields.length > 0) {
      fetchAllFieldOptions(filterableFields);
    }
  }, [selectedCategory, selectedSubcategory, filterableFields]);

  // New function to fetch all field options in parallel
  const fetchAllFieldOptions = async (fields: string[]) => {
    fields.forEach(field => {
      setLoadingFieldOptions(prev => ({ ...prev, [field]: true }));
    });
    
    try {
      // Create an array of promises for all field value fetches
      const fetchPromises = fields.map(field => fetchFieldValuesInternal(field));
      
      // Wait for all to complete
      await Promise.all(fetchPromises);
    } catch (error) {
      console.error("Error fetching field options:", error);
    }
  };

  const fetchFieldValuesInternal = async (field: string) => {
    try {
      let url = `/api/field-values?field=${encodeURIComponent(field)}`;
      
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedSubcategory) url += `&subcategory=${encodeURIComponent(selectedSubcategory)}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (response.ok) {
        setFieldOptions(prev => ({ ...prev, [field]: result.values || [] }));
      }
    } catch (error) {
      console.error(`Failed to fetch values for ${field}:`, error);
    } finally {
      setLoadingFieldOptions(prev => ({ ...prev, [field]: false }));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build URL with all filters
      let url = `/api/medical-data?page=${page}&pageSize=${pageSize}`;
      
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedSubcategory) url += `&subcategory=${encodeURIComponent(selectedSubcategory)}`;
      
      // Add any additional filters
      Object.entries(selectedFilters).forEach(([field, value]) => {
        if (value) url += `&${encodeURIComponent(field)}=${encodeURIComponent(value)}`;
      });
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (response.ok) {
        const processedData = result.data.map((item: any, index: number) => ({
          id: item._id?.$oid || `row-${index}`,
          ...item
        }));
        setData(processedData);
        setTotal(result.metadata.total);
        setCategories(result.metadata.categories || []);
        setSubcategories(result.metadata.subcategories || []);
        
        // If we haven't set filterable fields yet and have data, set them now
        if (filterableFields.length === 0 && processedData.length > 0) {
          const fieldNames = Object.keys(processedData[0]).filter(key => 
            key !== "id" && key !== "_id"
          );
          // Prefer string fields for filtering
          const stringFields = fieldNames.filter(field => 
            typeof processedData[0][field] === 'string' || 
            processedData[0][field] === null
          );
          setFilterableFields(stringFields);
          
          // Also fetch options for these fields
          await fetchAllFieldOptions(stringFields);
        }
        
        // Even if we already have filterable fields, update distinct values based on the new data
        if (processedData.length > 0 && !selectedCategory && !selectedSubcategory) {
          const distinctValues: Record<string, Set<string>> = {};
          
          // Process the current data to extract distinct values for each field
          filterableFields.forEach(field => {
            distinctValues[field] = new Set();
            processedData.forEach(item => {
              if (item[field] && typeof item[field] === 'string') {
                distinctValues[field].add(item[field]);
              }
            });
          });
          
          // Update the field options with new distinct values from current page
          Object.entries(distinctValues).forEach(([field, valueSet]) => {
            const values = Array.from(valueSet);
            if (values.length > 0) {
              setFieldOptions(prev => ({ 
                ...prev, 
                [field]: [...new Set([...(prev[field] || []), ...values])].sort()
              }));
            }
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldValues = async (field: string) => {
    setLoadingFieldOptions(prev => ({ ...prev, [field]: true }));
    await fetchFieldValuesInternal(field);
  };

  const handleCategoryChange = (_: any, value: string | null) => {
    setSelectedCategory(value);
    setSelectedSubcategory(null);
    setSelectedFilters({});
    setPage(0);
  };

  const handleSubcategoryChange = (_: any, value: string | null) => {
    setSelectedSubcategory(value);
    setSelectedFilters({});
    setPage(0);
  };

  const handleFieldFilterChange = (field: string) => (_: any, value: string | null) => {
    setSelectedFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  // Use useMemo to generate columns based on data
  const columns = useMemo(() => {
    // If we have data, generate columns dynamically from the data structure
    if (data.length > 0) {
      return Object.keys(data[0])
        .filter(key => key !== "id" && key !== "_id")
        .map(key => ({
          field: key,
          headerName: key,
          flex: key.toLowerCase().includes("institute") ? 1.5 : 1,
          width: ["SNo", "Rank", "Remarks"].includes(key) ? 100 : undefined,
        }));
    }
    // Otherwise return the default columns we generated at initialization
    return defaultColumns;
  }, [data, defaultColumns]);

  return (
    <Container maxWidth="xl">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>Medical Data Explorer</Typography>
        
        {/* Filter Panel */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={3}>
            {/* Category Filter */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={categories}
                value={selectedCategory}
                onChange={handleCategoryChange}
                renderInput={(params) => (
                  <TextField {...params} label="Category" variant="outlined" fullWidth />
                )}
              />
            </Grid>
            
            {/* Subcategory Filter */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={subcategories}
                value={selectedSubcategory}
                onChange={handleSubcategoryChange}
                disabled={!selectedCategory}
                renderInput={(params) => (
                  <TextField {...params} label="Subcategory" variant="outlined" fullWidth />
                )}
              />
            </Grid>
            
            {/* Dynamic Field Filters */}
            {filterableFields.map(field => (
              <Grid item xs={12} md={4} key={field}>
                <Autocomplete
                  options={fieldOptions[field] || []}
                  value={selectedFilters[field] || null}
                  onChange={handleFieldFilterChange(field)}
                  loading={loadingFieldOptions[field]}
                  renderInput={(params) => (
                    <TextField  
                      {...params} 
                      label={field} 
                      variant="outlined" 
                      fullWidth 
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingFieldOptions[field] && <CircularProgress size={20} />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
        
        {/* Data Table */}
        <Paper sx={{ height: 600, width: '100%' }}>
          {loading && filterableFields.length === 0 ? (
            <Box p={3}>
              <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={500} />
            </Box>
          ) : (
            <DataGrid
              rows={data}
              columns={columns}
              loading={loading}
              rowCount={total}
              pageSizeOptions={[100]}
              paginationModel={{ page, pageSize }}
              paginationMode="server"
              onPaginationModelChange={(model) => setPage(model.page)}
              disableRowSelectionOnClick
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
}