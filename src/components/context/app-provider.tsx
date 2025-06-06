// app/providers.tsx
"use client"; // <-- Make sure this is a client component

import {
  QueryClient,
  QueryClientProvider,
  // Use HydrationBoundary instead of Hydrate in v5+
  // Use Hydrate in v4
  HydrationBoundary,
} from "@tanstack/react-query";
import React from "react";
import { RightSidebarProvider } from "./right-sidebar-context";
import { AuthProvider } from "./auth-context";
import { LeftSidebarProvider } from "./left-sidebar-context";
import { Session } from "next-auth";
import { BotbarProvider } from "./botbar-context";

// Create a client
// Use a state to ensure the client is not recreated on every render
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching data on the client immediately.
        staleTime: 120 * 1000, // data is considered fresh for 60 seconds
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is to make sure we share the same client among components
    // on the client side.
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface AppProviderProps {
  children: React.ReactNode;
  session: Session;
  userId: string;
  // The dehydrated state passed from the server
  // In v5 this is implicit in HydrationBoundary, you might not need to pass it explicitly here
  // For v4, you would pass it: dehydratedState: unknown;
  dehydratedState: unknown;
}

export function AppProvider({
  children,
  session,
  userId,
  dehydratedState,
}: AppProviderProps) {
  // NOTE: This is generally not recommended for apps that use Server Components
  // often. It's better to create the client in a single root file
  // like layout.tsx and pass it down, or use the getQueryClient() pattern above.

  // const [queryClient] = useState(() => new QueryClient({ ... })); // Use getQueryClient() instead
  // Use the getQueryClient() pattern to ensure the same client is used on the browser
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Wrap the children with HydrationBoundary */}
      {/* In v5+, dehydratedState prop is not needed here if using the root layout setup */}
      <HydrationBoundary state={dehydratedState}>
        {/* Wrap children with React Context, which contains client side states, here */}
        <AuthProvider session={session} userId={userId}>
          <LeftSidebarProvider>
            <RightSidebarProvider>
              <BotbarProvider>{children}</BotbarProvider>
            </RightSidebarProvider>
          </LeftSidebarProvider>
        </AuthProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
