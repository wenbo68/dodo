"use client"; // Context providers with state must be Client Components

import React, { createContext, useState, useContext, ReactNode } from "react";

interface SidebarContextType {
  isBotbarOpen: boolean;
  toggleBotbar: () => void;
  openBotbar: () => void;
  closeBotbar: () => void;
  listId: string;
  setListId: (id: string) => void; // Add setListId to the interface
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useBotbar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useBotbar must be used within a BotbarProvider");
  }
  return context;
};

export const BotbarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default: sidebar is closed
  const [listId, setListId] = useState<string>(""); // Add state for listId
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isBotbarOpen: isSidebarOpen,
        toggleBotbar: toggleSidebar,
        openBotbar: openSidebar,
        closeBotbar: closeSidebar,
        listId,
        setListId,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
