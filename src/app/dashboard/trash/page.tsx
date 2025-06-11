"use client";

import { useAuth } from "@/components/context/auth-context";
import { useBotbar } from "@/components/context/botbar-context";
import { useRightSidebar } from "@/components/context/right-sidebar-context";
import { TodoGrid } from "@/components/dashboard/todo/todo-grid";
import { getDeletedListsWithItems } from "@/lib/db/list-utils";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  // fetch requied client-side states
  const { userId } = useAuth();

  // fetch required client-side cache
  const {
    data: lists,
    status,
    error,
  } = useQuery({
    queryKey: ["deletedLists", userId],
    queryFn: () => getDeletedListsWithItems(userId),
  });

  // get requied client-side states
  const { isRightSidebarOpen } = useRightSidebar();
  const { isBotbarOpen } = useBotbar();

  // when loading cache
  if (status === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="animate-pulse text-neutral-800 dark:text-neutral-100">
          Loading...
        </span>
      </div>
    );
  }

  // when error loading cache
  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-neutral-500 dark:text-neutral-400">
          Error: {error.message}
        </span>
      </div>
    );
  }
  // after loading cache succeeds

  return (
    <main
      className={`overflow-y-auto ${isRightSidebarOpen ? "mr-80" : "mr-0"}`}
    >
      <div className={` ${isBotbarOpen ? "mb-80" : "mb-0"} pl-12 pr-10`}>
        <TodoGrid listsProp={lists} />
      </div>
    </main>
  );
}
