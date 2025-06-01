"use client"; // Context providers with state must be Client Components

import React, { createContext, useState, useContext, ReactNode } from "react";

interface SidebarContextType {
  isLeftSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  openLeftSidebar: () => void;
  closeLeftSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useLeftSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useLeftSidebar must be used within a LeftSidebarContext");
  }
  return context;
};

export const LeftSidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default: sidebar is closed

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isLeftSidebarOpen: isSidebarOpen,
        toggleLeftSidebar: toggleSidebar,
        openLeftSidebar: openSidebar,
        closeLeftSidebar: closeSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
