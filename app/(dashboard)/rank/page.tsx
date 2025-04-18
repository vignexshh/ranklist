// app/medical-data/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Autocomplete, Box, Container, Paper, Typography, 
  TextField, CircularProgress, Skeleton, Grid
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

// Fields we want to show as filter options
const filterableFields = ["SNo", "Rank", "Allotted Quota", "Course", 
                        "Allotted Category", "Candidate Category", "Remarks"];

// Default columns to show before data is loaded
const defaultColumns: GridColDef[] = [
  { field: "SNo", headerName: "S.No", width: 100 },
  { field: "Rank", headerName: "Rank", width: 120 },
  { field: "Allotted Quota", headerName: "Allotted Quota", flex: 1 },
  { field: "Allotted Institute", headerName: "Allotted Institute", flex: 1.5 },
  { field: "Course", headerName: "Course", flex: 1 },
  { field: "Allotted Category", headerName: "Allotted Category", flex: 1 },
  { field: "Candidate Category", headerName: "Candidate Category", flex: 1 },
  { field: "Remarks", headerName: "Remarks", width: 120 },
  { field: "listCategory", headerName: "List Category", flex: 1 },
  { field: "listSubCategory", headerName: "List Subcategory", flex: 1 },
];

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

  // Initial load and whenever filters change
  useEffect(() => {
    fetchData();
  }, [page, selectedCategory, selectedSubcategory, selectedFilters]);

  // Fetch field options when category/subcategory changes
  useEffect(() => {
    if (selectedCategory) {
      filterableFields.forEach(field => {
        fetchFieldValues(field);
      });
    }
  }, [selectedCategory, selectedSubcategory]);

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
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldValues = async (field: string) => {
    setLoadingFieldOptions(prev => ({ ...prev, [field]: true }));
    try {
      let url = `/api/field-values?field=${encodeURIComponent(field)}`;
      
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedSubcategory) url += `&subcategory=${encodeURIComponent(selectedSubcategory)}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (response.ok) {
        setFieldOptions(prev => ({ ...prev, [field]: result.values }));
      }
    } catch (error) {
      console.error(`Failed to fetch values for ${field}:`, error);
    } finally {
      setLoadingFieldOptions(prev => ({ ...prev, [field]: false }));
    }
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
    if (data.length === 0) return defaultColumns;
    
    return Object.keys(data[0])
      .filter(key => key !== "id" && key !== "_id")
      .map(key => ({
        field: key,
        headerName: key,
        flex: 1,
        minWidth: 150
      }));
  }, [data]);

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
            {selectedCategory && filterableFields.map(field => (
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
        </Paper>
      </Box>
    </Container>
  );
}