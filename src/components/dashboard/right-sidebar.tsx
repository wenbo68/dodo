"use client";
import { useEffect, useRef } from "react";
import { useRightSidebar } from "../context/right-sidebar-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getListWithItems } from "@/lib/db/list-utils";

export default function RightSidebar() {
  // get required client side state/hook
  const { isRightSidebarOpen, closeRightSidebar, listId } = useRightSidebar();
  // get required client side cache
  const queryClient = useQueryClient();

  // get sidebar as ref
  const sidebarRef = useRef<HTMLDivElement>(null);
  // when user click outside of sidebar, close it
  // no need to update ui or db, as the TodoList component will handle that
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeRightSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <div
      className={`fixed right-0 top-0 z-50 h-full w-72 bg-blue-50 transition-transform duration-300 ${isRightSidebarOpen ? "translate-x-0" : "translate-x-72"}`}
    >
      {/* <TodoList /> */}
    </div>
  );
}
