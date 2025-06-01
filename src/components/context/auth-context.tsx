// src/contexts/SidebarContext.tsx
"use client"; // Context providers with state must be Client Components

import React, { createContext, useState, useContext, ReactNode } from "react";

interface AuthContextType {
  userId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) => {
  return (
    <AuthContext.Provider
      value={{
        userId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
