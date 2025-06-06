"use client";

import TodoItem from "./todo-item";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdOutlinePlaylistAdd, MdOutlineEditNote } from "react-icons/md";
import { RxTrash } from "react-icons/rx";
import { LiaMapPinSolid } from "react-icons/lia";
import Sortable from "sortablejs";
import { ListWithItems } from "@/types";
import { useListMutations } from "@/lib/utils/todo-list-utils";
import { useItemMutations } from "@/lib/utils/todo-item-utils";
import { v4 } from "uuid";
import { DragEvent } from "react";
import { ItemDropIndicator } from "./drop-indicator";
import {
  clearIndicators,
  getIndicators,
  getNearestIndicator,
  highlightIndicator,
} from "@/lib/utils/dnd-utils";
import { useAuth } from "../context/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllListsWithItems } from "@/lib/db/list-utils";
import { useRightSidebar } from "../context/right-sidebar-context";
import { motion } from "framer-motion";
import { useBotbar } from "../context/botbar-context";

const BREAKPOINT_WIDTH = 670; // Define your breakpoint

export default function TodoList({
  listProp,
  inSidebar,
}: {
  listProp: ListWithItems;
  inSidebar: boolean;
}) {
  // fetch requied client-side states
  const { userId } = useAuth();
  const {
    isRightSidebarOpen,
    closeRightSidebar,
    openRightSidebar,
    listId,
    setListId: setRightListId,
  } = useRightSidebar();
  const {
    isBotbarOpen,
    closeBotbar,
    openBotbar,
    setListId: setBotListId,
  } = useBotbar();

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
  const [title, setTitle] = useState(listProp.title);
  const [isFocused, setIsFocused] = useState(false);
  const [activeList, setActiveList] = useState<HTMLElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  const titleRef = useRef<HTMLDivElement>(null);
  // const focusedOnce = useRef(false); // This ref is key to let a new list focus only once

  // fetch required function
  const { listTitleMutation, pinListMutation, deleteListMutation } =
    useListMutations();
  const { reorderItemsMutation, addItemMutation } = useItemMutations();

  const handleTitleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newTitle = e.currentTarget.textContent || "";
    setTitle(newTitle);
    setIsFocused(false);
    if (newTitle !== listProp.title) {
      listTitleMutation.mutate({
        listId: listProp.id,
        newTitle,
      });
    }
  };

  // const handleEditList = () => {
  //   if (listProp.id === listId) {
  //     toggleRightSidebar();
  //     setListId("");
  //   } else {
  //     setListId(listProp.id);
  //     openRightSidebar();
  //   }
  // };

  // Memoize the handler to prevent unnecessary re-renders
  const handleEditList = useCallback(() => {
    const isMobile = viewportWidth < BREAKPOINT_WIDTH;
    if (listProp.id === listId) {
      closeBotbar();
      closeRightSidebar();
      setBotListId("");
      setRightListId("");
    } else {
      setBotListId(listProp.id);
      setRightListId(listProp.id);
      if (isMobile) {
        openBotbar();
      } else {
        openRightSidebar();
      }
    }
  }, [
    listProp.id,
    listId,
    setBotListId,
    setRightListId,
    viewportWidth,
    openRightSidebar,
    closeRightSidebar,
    openBotbar,
    closeBotbar,
  ]);

  const handleDragStart = (e: DragEvent, listId: string) => {
    e.dataTransfer.setData("type", "list");
    e.dataTransfer.setData("listId", listId);
  };

  const handleDrop = (e: DragEvent) => {
    if (e.dataTransfer.getData("type") !== "item") return;

    e.preventDefault();

    const dropListEl = e.currentTarget as HTMLElement;
    clearIndicators(dropListEl, `[data-drop-item-id]`);
    setActiveList(null);

    // find target item info: itemId, srccListId, oldIndex
    if (!lists) {
      console.error("handleDrop failed: lists not found in cache");
      return;
    }
    const itemId = e.dataTransfer.getData("itemId");
    if (!itemId) {
      console.error("handleDrop failed: itemId not found in dataTransfer");
      return;
    }
    const targetItem = lists
      .flatMap((list) => list.items)
      .find((item) => item.id === itemId);
    if (!targetItem) {
      console.error("handleDrop failed: targetItem not found in cache");
      return;
    }
    const srcListId = targetItem.listId;
    const oldIndex = targetItem.position;

    // find drop info (from nearest drop indicator): destListId, newIndex
    const destListId = dropListEl.getAttribute("data-list-id");
    if (!destListId) {
      console.error("handleDrop failed: destListId not found");
      return;
    }

    const indicators = getIndicators(e, `[data-drop-item-id]`);
    let dropItemId: string | null = null;
    const { element: nearestIndicator } = getNearestIndicator(e, indicators);
    if (!nearestIndicator) {
      console.error("handleDrop failed: nearestIndicator not found");
      return;
    }
    dropItemId = nearestIndicator.getAttribute("data-drop-item-id");
    if (!dropItemId) {
      console.error("handleDrop failed: dropItemId not found");
      return;
    }
    const dropList = lists.find((list) => list.id === destListId);
    if (!dropList) {
      console.error("handleDrop failed: dropList not found");
      return;
    }
    let newIndex = dropList.items.length;
    // cannot find dropItem if list length === 0
    if (newIndex > 0 && dropItemId !== "last-indicator") {
      const dropItem = dropList.items.find((item) => item.id === dropItemId);
      if (!dropItem) {
        console.error("handleDrop failed: dropItem not found in cache");
        return;
      }
      newIndex = dropItem.position;
    }
    if (srcListId === destListId && newIndex > oldIndex) newIndex--;

    console.log(
      "Item moved: list",
      srcListId,
      " index",
      oldIndex,
      "=> list",
      destListId,
      " index",
      newIndex,
    );

    reorderItemsMutation.mutate({
      itemId,
      srcListId,
      destListId,
      oldIndex,
      newIndex,
    });
  };
  const handleDragOver = (e: DragEvent) => {
    if (e.dataTransfer.getData("type") !== "item") return;
    e.preventDefault();
    highlightIndicator(e, `[data-drop-item-id]`);
    setActiveList(e.currentTarget as HTMLElement);
  };
  const handleDragLeave = (e: DragEvent) => {
    if (e.dataTransfer.getData("type") !== "item") return;
    clearIndicators(e.currentTarget as HTMLElement, `[data-drop-item-id]`);
    setActiveList(null);
  };

  // Sync title with prop to sync with list in sidebar
  useEffect(() => {
    setTitle(listProp.title);
  }, [listProp.title]);

  // Handle initial focus for new lists only once
  useEffect(() => {
    if (listProp.isNew && !inSidebar && titleRef.current) {
      titleRef.current.focus();
    }
  }, [listProp.isNew, inSidebar, titleRef]);

  // Effect to get initial viewport width and listen for resize events
  useEffect(() => {
    // Set initial width
    setViewportWidth(window.innerWidth);

    // Handler for resize event
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      data-list-id={listProp.id}
      className={`group/list relative mb-2 flex min-w-[250px] flex-col rounded-lg border p-3 shadow-lg ${activeList?.getAttribute("data-list-id") === listProp.id ? "bg-blue-50" : "bg-white"}`}
    >
      <div className="flex justify-between">
        <motion.div
          ref={titleRef}
          contentEditable="true"
          suppressContentEditableWarning={true}
          onFocus={(e) => setIsFocused(true)}
          // onInput={handleTitleInput}
          onBlur={handleTitleBlur}
          className={`flex-1 overflow-hidden whitespace-pre-wrap break-words text-xl font-bold outline-none ${title === "" && !isFocused ? "text-gray-300" : ""}`}
        >
          {title || // If title is empty string, use placeholder
            (!isFocused &&
              (listProp.isPinned
                ? `--pinned${listProp.position + 1}--`
                : `--list${listProp.position + 1}--`))}
        </motion.div>

        {/* list handle */}
        <div
          draggable="true"
          onDragStart={(e) => handleDragStart(e, listProp.id)}
          className="list-drag-handle cursor-move"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-500 hover:text-gray-700"
          >
            <circle cx="8" cy="8" r="1" />
            <circle cx="8" cy="16" r="1" />
            <circle cx="16" cy="8" r="1" />
            <circle cx="16" cy="16" r="1" />
          </svg>
        </div>
      </div>
      {/* all items */}
      <ul data-list-id={listProp.id}>
        {/* 1 item */}
        {listProp.items.map((item, index) => (
          <div key={item.id} className="flex flex-col">
            <ItemDropIndicator itemId={item.id} />
            <TodoItem itemProp={item} inSidebar={inSidebar} />
            {index === listProp.items.length - 1 && (
              <ItemDropIndicator itemId={"last-indicator"} />
            )}
          </div>
        ))}
        {listProp.items.length === 0 && (
          <ItemDropIndicator itemId={"empty-list"} />
        )}
      </ul>
      {/* pin list button */}
      <button
        onClick={() =>
          pinListMutation.mutate({
            listId: listProp.id,
            newIsPinned: !listProp.isPinned,
          })
        }
      >
        <LiaMapPinSolid
          className={`absolute -top-4 left-[12.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg transition-opacity group-hover/list:opacity-100 ${listProp.isPinned ? "bg-blue-500 text-white opacity-100" : "bg-gray-200 opacity-0"}`}
        />
      </button>
      {/* edit list button */}
      <button onClick={() => handleEditList()}>
        <MdOutlineEditNote
          className={`absolute -top-4 left-[37.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg transition-opacity group-hover/list:opacity-100 ${(isRightSidebarOpen || isBotbarOpen) && listId === listProp.id ? "bg-blue-500 text-white opacity-100" : "bg-gray-200 opacity-0"}`}
        />
      </button>
      {/* add item button */}
      <button
        onClick={() =>
          addItemMutation.mutate({
            itemProp: {
              listId: listProp.id,
              id: v4(),
              position: listProp.items.length,
              createdAt: new Date(Date.now()),
              updatedAt: new Date(Date.now()),
              description: "",
              isComplete: false,
              isNew: true,
              inSidebar,
            },
          })
        }
      >
        <MdOutlinePlaylistAdd className="absolute -top-4 left-[62.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-gray-200 opacity-0 transition-opacity group-hover/list:opacity-100" />
      </button>
      {/* delete list button */}
      <button
        onClick={() => deleteListMutation.mutate({ listId: listProp.id })}
      >
        <RxTrash className="absolute -top-4 left-[87.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-gray-200 opacity-0 transition-opacity group-hover/list:opacity-100" />
      </button>
    </div>
  );
}
