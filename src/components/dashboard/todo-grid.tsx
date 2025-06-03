"use client";

import { useEffect, useRef } from "react";
import TodoList from "./todo-list";
import { useAuth } from "../context/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllListsWithItems } from "@/lib/db/list-utils";
import AddListButton from "./add-list-button";
import Sortable from "sortablejs";
import { useListMutations } from "@/lib/utils/todo-list-utils";

export function TodoGrid() {
  // get requied client-side states
  const { userId } = useAuth();
  // get required client-side cache
  const queryClient = useQueryClient();
  const {
    data: lists,
    status,
    error,
  } = useQuery({
    queryKey: ["lists", userId],
    queryFn: () => getAllListsWithItems(userId),
  });

  const { reorderListsMutation } = useListMutations();

  // handle sortable onEnd event
  const handleListDndEnd = (evt: Sortable.SortableEvent) => {
    const listId = evt.item.getAttribute("data-list-id");
    console.log("evt.item:", evt.item); // <--- Add this
    console.log("data-list-id value:", listId); // <--- Add this
    if (!listId) {
      console.error("handleListDndEnd failed: listID not found");
      return;
    }

    const oldIndex = evt.oldIndex;
    const newIndex = evt.newIndex;
    if (
      oldIndex === undefined ||
      oldIndex === null ||
      newIndex === undefined ||
      newIndex === null
    ) {
      console.error("handleListDndEnd failed: index not found");
      return;
    }

    const isPinnedStart = "true" === evt.from.getAttribute("data-pinned"); // src grid
    const isPinnedEnd = "true" === evt.to.getAttribute("data-pinned"); // dest grid

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

  // create ref for sortablejs for pinned lists
  const pinnedGridRef = useRef<HTMLDivElement>(null);
  // sortable.js for the pinned grid
  useEffect(() => {
    if (!pinnedGridRef.current) return;

    const sortablePinned = Sortable.create(pinnedGridRef.current, {
      // group: {
      //   name: "grids", // Give them the same group name
      // },
      animation: 200,
      ghostClass: "opacity-0",
      handle: ".list-drag-handle",
      onEnd: (evt) => handleListDndEnd(evt),
    });

    return () => {
      sortablePinned.destroy();
    };
  }, [pinnedGridRef, handleListDndEnd, lists]);

  // create ref for sortablejs for regular lists
  const regularGridRef = useRef<HTMLDivElement>(null);
  // sortable.js for the regular grid
  useEffect(() => {
    if (!regularGridRef.current) return;

    // Initialize Sortable.js on the grid container for list sorting
    const sortableRegular = Sortable.create(regularGridRef.current, {
      // group: {
      //   name: "grids", // Same group name as the pinned grid
      // },
      animation: 200,
      ghostClass: "opacity-0",
      handle: ".list-drag-handle",
      onEnd: (evt) => handleListDndEnd(evt),
    });

    return () => {
      sortableRegular.destroy();
    };
  }, [regularGridRef, handleListDndEnd, lists]);

  // when loading cache
  if (status === "pending") {
    return <span>Loading...</span>;
  }
  // when error loading cache
  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }
  // after loading cache succeeds

  return (
    <div className="flex flex-col gap-10">
      <AddListButton />
      {/* grid containing pinned todo lists */}
      <div
        ref={pinnedGridRef}
        data-pinned={true}
        className={`grid w-full grid-cols-[repeat(auto-fit,250px)] justify-center gap-3`}
      >
        {/* 1 list */}
        {lists
          .filter((list) => list.isPinned === true)
          .map((list, index) => (
            <TodoList key={list.id} listProp={list} />
          ))}
      </div>

      {/* Horizontal separator */}
      <hr className="border-t border-gray-300" />

      {/* grid containing regular todo lists */}
      <div
        ref={regularGridRef}
        data-pinned={false}
        className={`grid w-full grid-cols-[repeat(auto-fit,250px)] justify-center gap-3`}
      >
        {/* 1 list */}
        {lists
          .filter((list) => list.isPinned === false)
          .map((list, index) => (
            <TodoList key={list.id} listProp={list} />
          ))}
      </div>
    </div>
  );
}
