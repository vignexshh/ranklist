"use client";
import { useSession } from "next-auth/react";

export default function TestSession() {
  const { data: session, status } = useSession();

  return (
    <pre>
      Status: {status}
      {"\n"}
      Session: {JSON.stringify(session, null, 2)}
    </pre>
  );
}
