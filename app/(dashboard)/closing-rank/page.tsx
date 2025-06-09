'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getDocuments } from '@/app/actions/data'; // Your fetch function

interface DocumentData {
  _id: string;
  [key: string]: any;
}

export default function HomePage() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDocuments('closing_ranks');

        if (data.length > 0) {
          const ignoreFields = ['_id', 'createdAt', 'updatedAt', 'listCategory', 'listSubCategory']; // Add any fields you want to hide
          const keys = Object.keys(data[0]).filter((key) => !ignoreFields.includes(key));
          const gridColumns: GridColDef[] = keys.map((key) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            width: 150,
            flex: 1,
          }));
          setColumns(gridColumns);
        }

        setDocuments(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!documents.length) return <Typography>No data found.</Typography>;

  return (
    <Box sx={{ height: 600, width: '100%', mt: 4 }}>
      <DataGrid
        rows={documents.map((doc, idx) => {
          const ignoreFields = ['_id', 'createdAt', 'updatedAt'];
          const filteredDoc = { ...doc };
          ignoreFields.forEach((field) => delete filteredDoc[field]);
          // Ensure each row has a unique 'id' property
          return {
            ...filteredDoc,
            id: doc._id || doc.id || doc.ID || idx, // fallback to index if no id
          };
        })}
        columns={columns}
        getRowId={(row) => row.id}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        pageSizeOptions={[10, 25, 50, 100]}
        autoHeight
      />
    </Box>
  );
}
