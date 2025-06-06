"use client";

import { useLeftSidebar } from "@/components/context/left-sidebar-context";
import { useRightSidebar } from "@/components/context/right-sidebar-context";
import AddListButton from "@/components/dashboard/add-list-button";
import { TodoGrid } from "@/components/dashboard/todo-grid";

export default function Page() {
  // get requied client-side states
  const { isLeftSidebarOpen } = useLeftSidebar();
  const { isRightSidebarOpen } = useRightSidebar();

  return (
    <>
      <AddListButton />
      <main
        className={`overflow-y-auto ${isRightSidebarOpen ? "mr-80" : "mr-0"}`}
      >
        <div className="px-14">
          <TodoGrid />
        </div>
      </main>
    </>
  );
}
