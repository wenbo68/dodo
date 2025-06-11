"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth-context";
import { useBotbar } from "../../context/botbar-context";
import { getAllListsWithItems } from "@/lib/db/list-utils";
import TodoList from "../todo/todo-list";

export default function Botbar() {
  const { userId } = useAuth();
  const { isBotbarOpen, listId } = useBotbar(); // `listId` comes from here

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
      className={`fixed bottom-0 left-0 z-30 flex h-[340px] w-full items-start justify-center overflow-y-auto bg-blue-50 py-10 pl-14 pr-12 dark:bg-neutral-700 ${isBotbarOpen ? "translate-y-0" : "translate-y-[340px]"}`}
    >
      {list && <TodoList listProp={list} loc={"botbar"} />}
    </div>
  );
}
