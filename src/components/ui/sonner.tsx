"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        style: {
          background: "#0F172A",
          border: "1px solid #1E293B",
          color: "#F8FAFC"
        }
      }}
    />
  );
}
