"use client";
import { useEffect, useState } from "react";
import { Autocomplete, Grid, TextField, CircularProgress, Box, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import useSWR from "swr";

interface DistinctFields {
  [key: string]: string[];
}

interface GenerateFiltersProps {
  selectedCategory: string | null;
  selectedSubCategory: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GetCategories() {
  const { data: categories, error: categoryError, isLoading: loadingCategories } = useSWR<string[]>("/api/category", fetcher);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [distinctFields, setDistinctFields] = useState<DistinctFields>({});
  const [dynamicSelections, setDynamicSelections] = useState<{ [key: string]: string | null }>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>([]);

  // Handle category change
  const handleCategoryChange = async (_event: any, newValue: string | null) => {
    setSelectedCategory(newValue);
    setSelectedSubCategory(null); // reset subcategory on category change

    if (newValue) {
      try {
        const response = await fetch("/api/subcategory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedCategory: newValue }),
        });

        const result = await response.json();
        setSubcategories(result.subCategories || []);
        console.log("Fetched subcategories:", result.subCategories);
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
      }
    } else {
      setSubcategories([]);
    }
  };9

  const sendFiltersToServer = async (category: string | null, subCategory: string | null) => {
    try {
      await fetch("/api/filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedCategory: category, selectedSubCategory: subCategory }),
      });
      console.log("Sent filters to server:", { selectedCategory: category, selectedSubCategory: subCategory });
    } catch (error) {
      console.error("Failed to send filters to server:", error);
    }
  };

  const handleSubCategoryChange = async (_event: any, newValue: string | null) => {
    setSelectedSubCategory(newValue);
    console.log("Selected subcategory:", newValue);
    await sendFiltersToServer(selectedCategory, newValue);

    // Fetch distinct fields for dynamic filters
    if (selectedCategory && newValue) {
      try {
        const response = await fetch("/api/filters", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedCategory, selectedSubCategory: newValue }),
        });
        const result = await response.json();
        setDistinctFields(result.distinctFields || {});
        // Reset dynamic selections
        setDynamicSelections({});
      } catch (error) {
        console.error("Failed to fetch distinct fields:", error);
      }
    } else {
      setDistinctFields({});
      setDynamicSelections({});
    }
  };

  // Handle dynamic filter selection
  const handleDynamicSelection = (key: string, value: string | null) => {
    setDynamicSelections((prev) => {
      const updatedSelections = { ...prev, [key]: value };
      // Send updated dynamic selections to /api/query-filters
      fetch("/api/query-filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedCategory,
          selectedSubCategory,
          filters: updatedSelections,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Query filters response:", data);
        })
        .catch((err) => {
          console.error("Failed to send query filters:", err);
        });
      return updatedSelections;
    });
  };

  // Fetch data from /api/query-filters whenever dynamicSelections, selectedCategory, or selectedSubCategory changes
  useEffect(() => {
    if (selectedCategory && selectedSubCategory) {
      fetch("/api/query-filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedCategory,
          selectedSubCategory,
          filters: dynamicSelections,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data && Array.isArray(data.data)) {
            setTableData(data.data);
            // Dynamically set columns based on keys of first object
            if (data.data.length > 0) {
              setTableColumns(Object.keys(data.data[0]));
            } else {
              setTableColumns([]);
            }
          } else {
            setTableData([]);
            setTableColumns([]);
          }
        })
        .catch((err) => {
          setTableData([]);
          setTableColumns([]);
          console.error("Failed to fetch table data:", err);
        });
    } else {
      setTableData([]);
      setTableColumns([]);
    }
  }, [selectedCategory, selectedSubCategory, dynamicSelections]);

  if (loadingCategories) return <CircularProgress />;
  if (categoryError) return <Box>Failed to load categories</Box>;

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        alignItems="flex-start"
        sx={{ width: "100%" }}
        gap={1}
      >
        <Autocomplete
          options={categories || []}
          value={selectedCategory}
          onChange={handleCategoryChange}
          sx={{ minWidth: 250, flex: 1 }}
          renderInput={(params) => (
        <TextField {...params} label="Category" variant="outlined" fullWidth />
          )}
        />

        <Autocomplete
          options={subcategories}
          value={selectedSubCategory}
          onChange={handleSubCategoryChange}
          sx={{ minWidth: 250, flex: 1 }}
          renderInput={(params) => (
        <TextField {...params} label="Subcategory" variant="outlined" fullWidth />
          )}
          disabled={!selectedCategory}
        />
      </Stack>

      <Box>
        
        <Grid container spacing={2}>
          {Object.entries(distinctFields)
            .filter(([key]) => {
              const ignoreList = (process.env.NEXT_PUBLIC_TABLE_IGNORE_LIST || "_id,createdAt,updatedAt")
          .split(",")
          .map((s) => s.trim());
              return !ignoreList.includes(key);
            })
            .map(([key, options], idx) => (
              <Grid item xs={12} sm={6} key={key}>
          <Autocomplete
            options={options}
            value={dynamicSelections[key] || null}
            onChange={(_e, value) => handleDynamicSelection(key, value)}
            renderInput={(params) => (
              <TextField {...params} label={key} variant="outlined" />
            )}
          />
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Dynamically render MUI Table for API data */}
      {tableData.length > 0 && tableColumns.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {tableColumns
                  .filter((col) => {
                  const ignoreList = (process.env.NEXT_PUBLIC_TABLE_IGNORE_LIST || "_id,createdAt,updatedAt")
                    .split(",")
                    .map((s) => s.trim());
                  return !ignoreList.includes(col);
                  })
                  .map((col) => (
                  <TableCell key={col}>{col}</TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, idx) => (
                <TableRow key={idx}>
                  {tableColumns
                  .filter((col) => {
                  const ignoreList = (process.env.NEXT_PUBLIC_TABLE_IGNORE_LIST || "_id,createdAt,updatedAt")
                    .split(",")
                    .map((s) => s.trim());
                  return !ignoreList.includes(col);
                  })
                  .map((col) => (
                    <TableCell key={col}>{row[col]?.toString() ?? ""}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
