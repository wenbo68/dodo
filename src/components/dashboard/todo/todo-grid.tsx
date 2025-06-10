"use client";

import { useState } from "react";
import TodoList from "./todo-list";
import { useAuth } from "../../context/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllListsWithItems,
  getDeletedListsWithItems,
} from "@/lib/db/list-utils";
import { ListDropIndicator } from "./drop-indicator";
import { useListDnd } from "@/lib/utils/todo-list-dnd";
import { List, ListWithItems } from "@/types";

export function TodoGrid({ listsProp }: { listsProp: ListWithItems[] }) {
  // create component states
  const [activeGrid, setActiveGrid] = useState<HTMLElement | null>(null);

  //fetch required functions
  const { handleDrop, handleDragLeave, handleDragOver } = useListDnd();

  const pinnedLists = listsProp.filter((list) => list.isPinned === true);
  const regularLists = listsProp.filter((list) => list.isPinned === false);

  return (
    <div className="flex flex-col gap-1">
      {pinnedLists.length > 0 && (
        /* grid containing pinned todo lists */
        <div
          onDrop={(e) => handleDrop(e, setActiveGrid)}
          onDragOver={(e) => handleDragOver(e, setActiveGrid)}
          onDragLeave={(e) => handleDragLeave(e, setActiveGrid)}
          data-pinned={true}
          className={`my-5 grid w-full grid-cols-[repeat(auto-fit,250px)] justify-center gap-3 rounded-xl py-5 pr-6 ${
            activeGrid?.getAttribute("data-pinned") === "true"
              ? "bg-blue-50 dark:bg-neutral-700" // Dark mode for active pinned grid
              : "" // Border remains transparent
          }`}
        >
          {/* 1 list */}
          {pinnedLists.map((list, index) => (
            <div key={list.id} className="flex">
              <ListDropIndicator listId={list.id} />
              <TodoList listProp={list} inSidebar={false} />
              {index === pinnedLists.length - 1 && (
                <ListDropIndicator listId={"last-indicator"} />
              )}
            </div>
          ))}
        </div>
      )}

      {pinnedLists.length > 0 && regularLists.length > 0 && (
        /* Horizontal separator */
        <hr className="border-t border-gray-300 dark:border-neutral-500" />
      )}

      {regularLists.length > 0 && (
        /* grid containing regular todo lists */
        <div
          onDrop={(e) => handleDrop(e, setActiveGrid)}
          onDragOver={(e) => handleDragOver(e, setActiveGrid)}
          onDragLeave={(e) => handleDragLeave(e, setActiveGrid)}
          data-pinned={false}
          className={`my-5 grid w-full grid-cols-[repeat(auto-fit,250px)] justify-center gap-3 rounded-xl py-5 pr-6 ${
            activeGrid?.getAttribute("data-pinned") === "false"
              ? "bg-blue-50 dark:bg-neutral-700" // Dark mode for active regular grid
              : "" // Border remains transparent
          } `}
        >
          {/* 1 list */}
          {regularLists.map((list, index) => (
            <div key={list.id} className="flex">
              <ListDropIndicator listId={list.id} />
              <TodoList listProp={list} inSidebar={false} />
              {index === regularLists.length - 1 && (
                <ListDropIndicator listId={"last-indicator"} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
