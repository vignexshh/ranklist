'use client';
import * as React from 'react';
import { Container, Box, CircularProgress, Button, Avatar } from '@mui/material';
import { useEffect, useState } from 'react';
import GetCategories from '@/components/GetCategories';
import { useSession, signOut } from "next-auth/react"

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Box>Loading...</Box>
  if (!session) return <Box>Access Denied</Box>

  return (
    <Container maxWidth={false} disableGutters style={{ width: '100%', margin: 0, padding: 0 }}>
      <Box sx={{ bgcolor: 'white', width: '100%', minHeight: '100vh', p: 4 }}>

        <Box>Welcome {session.user?.name}</Box>
        <Box>
          <Avatar
            alt={session.user?.name ?? 'User'}
            src={typeof session.user?.image === 'string' && session.user.image.trim() !== '' ? session.user.image : undefined}
          />
        </Box>
        <Box> <Button onClick={() => signOut()}>Sign Out</Button></Box>
        <GetCategories />
      </Box>
    </Container>
  );
}
