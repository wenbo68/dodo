// src/contexts/SidebarContext.tsx
"use client"; // Context providers with state must be Client Components

import type { Session } from "next-auth";
import React, { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  session: Session;
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
  session,
}: {
  children: ReactNode;
  userId: string;
  session: Session;
}) => {
  return (
    <AuthContext.Provider
      value={{
        session,
        userId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
