import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';


export default function Dashboard() {


  return (
    //container 01 - pack category filter
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', mt: 3, justifyContent: 'space-around', alignItems: 'center', width: '100%' }}>
        <Box sx={{ borderRadius:5, p: 10, bgcolor: 'primary.light' }}>
          <Typography>
            Welcome to the Toolpad orders!
          </Typography>
        </Box>
        <Box sx={{ border: 2, p: 10 }}>
          <Typography>
            This is the analyse rank page.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
