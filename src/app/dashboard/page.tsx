"use client";

import { useBotbar } from "@/components/context/botbar-context";
import { useLeftSidebar } from "@/components/context/left-sidebar-context";
import { useRightSidebar } from "@/components/context/right-sidebar-context";
import AddListButton from "@/components/dashboard/add-list-button";
import { TodoGrid } from "@/components/dashboard/todo-grid";

export default function Page() {
  // get requied client-side states
  const { isLeftSidebarOpen } = useLeftSidebar();
  const { isRightSidebarOpen } = useRightSidebar();
  const { isBotbarOpen } = useBotbar();
  return (
    <>
      <AddListButton />
      <main
        className={`overflow-y-auto ${isRightSidebarOpen ? "mr-80" : "mr-0"}`}
      >
        <div className={`${isBotbarOpen ? "mb-96" : "mb-0"} px-12`}>
          <TodoGrid />
        </div>
      </main>
    </>
  );
}
