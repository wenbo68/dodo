// src/contexts/SidebarContext.tsx
"use client"; // Context providers with state must be Client Components

import React, { createContext, useState, useContext, ReactNode } from "react";

interface SidebarContextType {
  isRightSidebarOpen: boolean;
  toggleRightSidebar: () => void;
  openRightSidebar: () => void;
  closeRightSidebar: () => void;
  listId: string;
  setListId: (id: string) => void; // Add setListId to the interface
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useRightSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error(
      "useRightSidebar must be used within a RightSidebarContext",
    );
  }
  return context;
};

export const RightSidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default: sidebar is closed
  const [listId, setListId] = useState<string>(""); // Add state for listId
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isRightSidebarOpen: isSidebarOpen,
        toggleRightSidebar: toggleSidebar,
        openRightSidebar: openSidebar,
        closeRightSidebar: closeSidebar,
        listId: "",
        setListId: setListId, // Provide the setListId function
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
