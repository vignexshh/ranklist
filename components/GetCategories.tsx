"use client";
import { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress, Box, Stack } from "@mui/material";
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
    setDynamicSelections((prev) => ({ ...prev, [key]: value }));
    // Optionally, send updated filters to server here
  };

  if (loadingCategories) return <CircularProgress />;
  if (categoryError) return <Box>Failed to load categories</Box>;

  return (
    <Stack spacing={3} width={300}>
      <Autocomplete
        options={categories || []}
        value={selectedCategory}
        onChange={handleCategoryChange}
        renderInput={(params) => (
          <TextField {...params} label="Category" variant="filled" />
        )}
      />

      <Autocomplete
        options={subcategories}
        value={selectedSubCategory}
        onChange={handleSubCategoryChange}
        renderInput={(params) => (
          <TextField {...params} label="Subcategory" variant="filled" />
        )}
        disabled={!selectedCategory}
      />

      {/* Dynamically render Autocompletes for each distinct field */}
      {Object.entries(distinctFields).map(([key, options]) => (
        <Autocomplete
          key={key}
          options={options}
          value={dynamicSelections[key] || null}
          onChange={(_e, value) => handleDynamicSelection(key, value)}
          renderInput={(params) => (
            <TextField {...params} label={key} variant="filled" />
          )}
        />
      ))}
    </Stack>
  );
}
