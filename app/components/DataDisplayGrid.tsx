'use client';

import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';

interface DataDisplayGridProps {
  publicToken: string | null;
  selectedCategory: string | null;
  selectedSubCategory: string | null;
  dynamicFieldValues: Record<string, string | null>;
}

const DataDisplayGrid: React.FC<DataDisplayGridProps> = ({
  publicToken,
  selectedCategory,
  selectedSubCategory,
  dynamicFieldValues,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  const searchParams = useSearchParams();

  // Generate filter query based on selections
  const generateFilterQuery = () => {
    const filters: Record<string, any> = {};
    
    if (selectedCategory) {
      filters.listCategory = selectedCategory;
    }
    
    if (selectedSubCategory) {
      filters.listSubCategory = selectedSubCategory;
    }
    
    // Add dynamic field filters
    Object.entries(dynamicFieldValues).forEach(([field, value]) => {
      if (value) {
        filters[field] = value;
      }
    });
    
    return filters;
  };

  // Fetch data from API
  const fetchData = async () => {
    if (!publicToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filters = generateFilterQuery();
      
      // Only fetch if we have at least a category selected
      if (!selectedCategory) {
        setData([]);
        setTotalCount(0);
        return;
      }
      
      const response = await fetch('/api/fetch-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': publicToken,
        },
        body: JSON.stringify({
          filters,
          page: paginationModel.page + 1, // API usually expects 1-based index
          pageSize: paginationModel.pageSize,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setData(result.data);
        setTotalCount(result.totalCount || result.data.length);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when any selection changes
  useEffect(() => {
    // Debounce to prevent rapid successive calls
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [publicToken, selectedCategory, selectedSubCategory, JSON.stringify(dynamicFieldValues), paginationModel]);

  // Generate columns dynamically based on the first data item
  const generateColumns = (): GridColDef[] => {
    if (data.length === 0) return [];
    
    const sampleItem = data[0];
    return Object.keys(sampleItem).map((key) => ({
      field: key,
      headerName: key,
      flex: 1,
      minWidth: 150,
    }));
  };

  return (
    <Box sx={{ height: '70vh', width: '100%', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Results
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <DataGrid
        rows={data}
        columns={generateColumns()}
        loading={loading}
        pageSizeOptions={[5, 10, 25, 50]}
        paginationModel={paginationModel}
        paginationMode="server"
        rowCount={totalCount}
        onPaginationModelChange={setPaginationModel}
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        sx={{
          '& .MuiDataGrid-cell': {
            whiteSpace: 'normal',
            wordWrap: 'break-word',
          },
        }}
      />
    </Box>
  );
};

export default DataDisplayGrid;