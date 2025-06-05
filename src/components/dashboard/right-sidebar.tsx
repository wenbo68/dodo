"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/auth-context";
import { useRightSidebar } from "../context/right-sidebar-context";
import TodoList from "./todo-list";
import { getAllListsWithItems } from "@/lib/db/list-utils";

export default function RightSidebar() {
  const { userId } = useAuth();
  const { isRightSidebarOpen, closeRightSidebar, listId } = useRightSidebar(); // `listId` comes from here

  const queryClient = useQueryClient();
  const {
    data: lists,
    status,
    error,
  } = useQuery({
    queryKey: ["lists", userId],
    queryFn: () => getAllListsWithItems(userId),
  });

  const list = lists?.find((list) => list.id === listId);

  return (
    <div
      // ref={sidebarRef} // Attach the ref here
      className={`fixed right-0 top-0 h-full w-72 overflow-y-auto bg-blue-50 px-3 py-7 transition-transform duration-500 ${isRightSidebarOpen ? "translate-x-0" : "translate-x-72"}`}
    >
      {list && <TodoList listProp={list} />}
    </div>
  );
}
