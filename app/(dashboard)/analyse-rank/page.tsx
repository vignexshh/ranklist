import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Autocomplete } from '@mui/material';


export default function Dashboard() {


  return (
    //container 01 - pack category filter
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', mt: 3, alignItems: 'center', width: '100%', gap: 2 }}>
        <Box sx={{border:1, borderColor:"grey.300", borderRadius:5, p: 10, bgcolor: 'white' }}>
          <Typography>
            Welcome to the Toolpad orders!
          </Typography>
        </Box>
        <Box sx={{borderRadius:5, p: 10, bgcolor: 'white'}}>
          <Typography>
            This is the analyse rank page.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
