"use Client";
import { useState } from "react";
import useSWR from "swr";
import { Autocomplete, TextField, CircularProgress, Box } from "@mui/material";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CategoryAutocomplete(){

    const { data: categories, error, isLoading} = useSWR<string[]>("/api/category", fetcher);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleCategoryChange = async (_event:any, newValue:string | null) => {
        setSelectedCategory(newValue);

        if(newValue){
            try{
                const response = await fetch("/api/sub-category", {
                    method: "POST",
                    headers:{
                        "Content-Type":"application/json",
                    },
                    body: JSON.stringify({category:newValue}),
                });

                const result = await response.json();
                console.log("Sub Category response:", result);

            } catch (error) {
                console.error("Failed to send category:", error);
            }
        }
    };

    if (isLoading) return <CircularProgress/>;
    if (error) return <Box>Failed to load categories</Box>

    return(

        <Autocomplete
            options={categories || []}
            value={selectedCategory}
            onChange={handleCategoryChange}
            renderInput={(params) => (
                <TextField {...params} label="Category" variant="filled" />
            )}
            sx={{ width: 300 }}
        />
    );
}