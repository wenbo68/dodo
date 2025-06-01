"use client";

import { useLeftSidebar } from "@/components/context/left-sidebar-context";
import { useRightSidebar } from "@/components/context/right-sidebar-context";
import { TodoGrid } from "@/components/dashboard/todo-grid";

export default function Page() {
  // get requied client-side states
  const { isLeftSidebarOpen } = useLeftSidebar();
  const { isRightSidebarOpen } = useRightSidebar();

  return (
    <main
      className={`overflow-y-auto transition-transform duration-300 ${isLeftSidebarOpen ? "mr-72 translate-x-72" : "translate-x-0"} ${isRightSidebarOpen ? "mr-72" : "mr-0"}`}
    >
      <div className="px-10 pb-4 pt-4">
        <TodoGrid />
      </div>
    </main>
  );
}
