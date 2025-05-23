"use client";

import { useQuery } from "@apollo/client";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useState, useMemo } from "react";
import { GET_PAGINATED_ALLOTMENTS } from "@/lib/graphql/queries";

interface Allotment {
  _id: string;
  listCategory: string;
  listSubCategory: string;
  otherFields: Record<string, any>;
}

export default function AllotmentsTable() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, loading, error } = useQuery(GET_PAGINATED_ALLOTMENTS, {
    variables: { skip: page * pageSize, limit: pageSize },
    fetchPolicy: "cache-and-network",
  });

  const rows = useMemo(() => {
    return (
      data?.allotments.map((a: Allotment) => ({
        id: a._id,
        listCategory: a.listCategory,
        listSubCategory: a.listSubCategory,
        ...a.otherFields,
      })) || []
    );
  }, [data]);

  // Dynamically generate columns
  const columns: GridColDef[] = useMemo(() => {
    if (rows.length === 0) return [];

    const sample = rows[0];
    return Object.keys(sample).map((key) => ({
      field: key,
      headerName: key,
      width: 200,
    }));
  }, [rows]);

  const handlePageChange = (model: GridPaginationModel) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        paginationMode="server"
        paginationModel={{ page, pageSize }}
        rowCount={100000} // estimated or dynamic later
        onPaginationModelChange={handlePageChange}
        loading={loading}
      />
      {error && <p>Error loading data: {error.message}</p>}
    </div>
  );
}
