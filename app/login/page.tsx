// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div>
      <h2>Login with Google</h2>
      <button onClick={() => signIn("google",{ callbackUrl: "/rank" })}>Sign in</button>
    </div>
  );
}
