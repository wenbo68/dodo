"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth-context";
import { useRightSidebar } from "../../context/right-sidebar-context";
import TodoList from "../todo/todo-list";
import { getAllListsWithItems } from "@/lib/db/list-utils";

export default function RightSidebar() {
  const { userId } = useAuth();
  const { isRightSidebarOpen, listId } = useRightSidebar(); // `listId` comes from here

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
      className={`fixed right-0 top-0 h-full w-80 overflow-y-auto bg-white px-6 py-10 dark:bg-neutral-800 ${isRightSidebarOpen ? "translate-x-0" : "translate-x-80"}`}
    >
      {list && <TodoList listProp={list} inSidebar={true} />}
    </div>
  );
}
