"use client";

import { DragEvent, useEffect, useRef, useState } from "react";
import TodoList from "./todo-list";
import { useAuth } from "../context/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllListsWithItems } from "@/lib/db/list-utils";
import AddListButton from "./add-list-button";
import Sortable from "sortablejs";
import { useListMutations } from "@/lib/utils/todo-list-utils";
import { ListDropIndicator } from "./drop-indicator";
import {
  clearIndicators,
  getIndicators,
  getNearestIndicator,
  highlightIndicator,
} from "@/lib/utils/dnd-utils";

export function TodoGrid() {
  // fetch requied client-side states
  const { userId } = useAuth();

  // fetch required client-side cache
  const queryClient = useQueryClient();
  const {
    data: lists,
    status,
    error,
  } = useQuery({
    queryKey: ["lists", userId],
    queryFn: () => getAllListsWithItems(userId),
  });

  // create component states
  const [activeGrid, setActiveGrid] = useState<HTMLElement | null>(null);

  //fetch required functions
  const { reorderListsMutation } = useListMutations();

  //create required functions
  const handleDrop = (e: DragEvent) => {
    if (e.dataTransfer.getData("type") !== "list") return;

    e.preventDefault();

    const dropGridEl = e.currentTarget as HTMLElement;
    clearIndicators(dropGridEl, `[data-drop-list-id]`);
    setActiveGrid(null);

    // find target list info: listId, isPinnedStart, oldIndex
    if (!lists) {
      console.error("handleDrop failed: lists not found in cache");
      return;
    }
    const listId = e.dataTransfer.getData("listId");
    if (!listId) {
      console.error("handleDrop failed: listId not found in dataTransfer");
      return;
    }
    const targetList = lists.find((list) => list.id === listId);
    if (!targetList) {
      console.error("handleDrop failed: targetList not found in cache");
      return;
    }
    const isPinnedStart = targetList.isPinned;
    const oldIndex = targetList.position;

    // find drop info (from nearest drop indicator): isPinnedEnd, newIndex
    const isPinnedEnd = dropGridEl.getAttribute("data-pinned") === "true";

    const indicators = getIndicators(e, `[data-drop-list-id]`);
    let dropListId: string | null = null;
    const { element: nearestIndicator } = getNearestIndicator(e, indicators);
    if (!nearestIndicator) {
      console.error("handleDrop failed: nearestIndicator not found");
      return;
    }
    dropListId = nearestIndicator.getAttribute("data-drop-list-id");
    if (!dropListId) {
      console.error("handleDrop failed: dropListId not found");
    }

    let newIndex: number = lists.filter(
      (list) => list.isPinned === isPinnedEnd,
    ).length;
    if (dropListId !== "last-indicator") {
      const dropList = lists.find((list) => list.id === dropListId);
      if (!dropList) {
        console.error("handleDrop failed: dropList not found in cache");
        return;
      }
      newIndex = dropList.position;
    }
    if (isPinnedStart === isPinnedEnd && newIndex > oldIndex) newIndex--;

    console.log(
      `List moved: ${isPinnedStart ? "pinned" : "unpinned"} index${oldIndex} to ${isPinnedEnd ? "pinned" : "unpinned"} index${newIndex}`,
    );

    reorderListsMutation.mutate({
      listId,
      isPinnedStart,
      isPinnedEnd,
      oldIndex,
      newIndex,
    });
  };
  const handleDragOver = (e: DragEvent) => {
    if (e.dataTransfer.getData("type") !== "list") return;
    e.preventDefault();
    setActiveGrid(e.currentTarget as HTMLElement);
    highlightIndicator(e, `[data-drop-list-id]`);
  };
  const handleDragLeave = (e: DragEvent) => {
    if (e.dataTransfer.getData("type") !== "list") return;
    clearIndicators(e.currentTarget as HTMLElement, `[data-drop-list-id]`);
    setActiveGrid(null);
  };

  // when loading cache
  if (status === "pending") {
    return <span>Loading...</span>;
  }
  // when error loading cache
  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }
  // after loading cache succeeds

  const pinnedLists = lists.filter((list) => list.isPinned === true);
  const regularLists = lists.filter((list) => list.isPinned === false);

  return (
    <>
      <div className="flex flex-col gap-1">
        {pinnedLists.length > 0 && (
          /* grid containing pinned todo lists */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            data-pinned={true}
            className={`grid w-full grid-cols-[repeat(auto-fit,250px)] justify-center gap-3 rounded-xl py-7 pr-5 ${activeGrid?.getAttribute("data-pinned") === "true" ? "border-blue-500 bg-blue-50" : "border-transparent"}`}
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
          <hr className="border-t border-gray-300" />
        )}

        {regularLists.length > 0 && (
          /* grid containing regular todo lists */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            data-pinned={false}
            className={`grid w-full grid-cols-[repeat(auto-fit,250px)] justify-center gap-3 rounded-xl py-8 pr-5 ${activeGrid?.getAttribute("data-pinned") === "false" ? "border-blue-500 bg-blue-50" : "border-transparent"} `}
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
    </>
  );
}
