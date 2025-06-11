import Link from "next/link";
// import AddList from "@/components/dashboard/add-list";
import {
  getAllListsWithItems,
  getDeletedListsWithItems,
  // getListsWithItems,
} from "~/lib/db/list-utils";
import { auth } from "~/server/auth";
import { AppProvider } from "@/components/context/app-provider";
import RightSidebar from "@/components/dashboard/bars/right-sidebar";
import React from "react";
// import AddListButton from "@/components/dashboard/add-list-button";
// Import necessary items from TanStack Query for server-side
import {
  QueryClient,
  dehydrate, // Function to dehydrate the state
  // Use HydrationBoundary in v5+, not Hydrate
  // Use Hydrate in v4
  // HydrationBoundary,
} from "@tanstack/react-query";
import Topbar from "@/components/dashboard/bars/topbar";
import LeftSidebar from "@/components/dashboard/bars/left-sidebar";
import Botbar from "@/components/dashboard/bars/botbar";
import { Toaster } from "react-hot-toast"; // Import Toaster

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || !session.user) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-neutral-800">
        <button className="w-20 rounded-lg border shadow-md dark:border-neutral-100 dark:bg-neutral-800">
          <Link
            href={{
              pathname: "/api/auth/signin",
              query: { callbackUrl: "/dashboard" },
            }}
            className="dark:text-white"
          >
            Sign In
          </Link>
        </button>
      </div>
    );
  }

  // --- Server-Side Data Fetching and Prefetching ---

  // 1. Create a new QueryClient instance for *this* server request
  const queryClient = new QueryClient();

  // 2. Prefetch the data using the server-side queryClient
  // This runs the queryFn on the server and stores the result in the server-side cache
  await queryClient.prefetchQuery({
    queryKey: ["userLists", session.user.id], // Use the same key as you will on the client
    queryFn: () => getAllListsWithItems(session.user.id), // Call your server data fetching function
  });

  await queryClient.prefetchQuery({
    queryKey: ["deletedLists", session.user.id], // Key for trashed lists
    queryFn: () => getDeletedListsWithItems(session.user.id), // Fetch trashed lists
  });

  // 3. Get the dehydrated state from the server-side queryClient
  // This state contains the results of the prefetching
  const dehydratedState = dehydrate(queryClient);

  // 4. Pass the dehydrated state to the client-side provider
  // This will hydrate the client-side cache with the server-side data

  // --- Server-Side Data Fetching and Prefetching DONE ---

  return (
    <div className="flex min-h-screen flex-col gap-1">
      {/* Wrap the client-side provider (AppProvider) around your children and other client components.
        Pass the dehydrated state to the provider (or directly to HydrationBoundary if the provider wraps it).
        In v5+, the AppProvider usually renders HydrationBoundary internally,
        and the dehydrated state is automatically picked up if done in the root layout.
        For clarity and v4 compatibility, explicitly passing is often shown.
      */}
      <AppProvider
        session={session}
        userId={session.user.id}
        /* For v4: */ dehydratedState={dehydratedState}
      >
        {/* Client components that need data (like your page content or sidebar) 
          will now use useQuery with the same queryKey.
          They will find the data in the cache (hydrated from the server) instantly.*/}
        <Topbar />
        <Botbar />
        <LeftSidebar />
        <RightSidebar /> {/* Make sure EditListSidebar is 'use client' */}
        {children} {/* Your page.tsx content */}
        <Toaster position="bottom-center" />
      </AppProvider>
    </div>
  );
}
