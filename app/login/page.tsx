// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { Button, Box, Typography } from "@mui/material";  
export default function LoginPage() {
  return (
    <Box>
        <Typography>Login with Google</Typography>
      <Button onClick={() => signIn("google",{ callbackUrl: "/rank" })}>Sign in</Button>
    </Box>
  );
}
