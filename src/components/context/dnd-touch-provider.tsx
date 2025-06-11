// src/components/context/dnd-touch-provider.tsx
"use client"; // Keep this! It's essential for the component itself to be client-side.

import { useEffect } from "react";

export function DragDropTouchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Dynamically import the polyfill ONLY when the component mounts on the client
    // This ensures it never runs on the server.
    void import("drag-drop-touch"); // Add 'void' here
  }, []); // Empty dependency array means this runs once after the initial render

  return <>{children}</>;
}
