"use client";

import TodoItem from "./todo-item";
import { useEffect, useRef, useState } from "react";
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

export default function TodoList({ listProp }: { listProp: ListWithItems }) {
  // fetch requied client-side states
  const { userId } = useAuth();
  const {
    isRightSidebarOpen,
    toggleRightSidebar,
    closeRightSidebar,
    openRightSidebar,
    listId,
    setListId,
  } = useRightSidebar();

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
  const [isEditingTitle, setIsEditingTitle] = useState(listProp.isNew);
  const [title, setTitle] = useState(listProp.title);
  const [activeList, setActiveList] = useState<HTMLElement | null>(null);

  // create required refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // fetch required function
  const { listTitleMutation, pinListMutation, deleteListMutation } =
    useListMutations();
  const { reorderItemsMutation, addItemMutation } = useItemMutations();

  //create required function
  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      element.style.height = "auto"; // Reset height to recalculate scrollHeight
      // element.scrollHeight; // Have to call element.scrollHeight twice for some reason...
      element.style.height = `${element.scrollHeight}px`; // Set height based on content
    }
  };

  const handleListTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
      setIsEditingTitle(false);
    }
  };

  const handleEditList = () => {
    if (listProp.id === listId) {
      toggleRightSidebar();
      // setListId("");
    } else {
      setListId(listProp.id);
      openRightSidebar();
    }
  };

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

  // sync title with prop so that it rerenders in sidebar
  useEffect(() => {
    setTitle(listProp.title);
  }, [listProp.title]);

  // Adjust height of textbox when editing starts
  // or when description changes programmatically
  useEffect(() => {
    if (isEditingTitle && textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
      textareaRef.current.focus(); // Keep autoFocus behavior
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    }
  }, [isEditingTitle, textareaRef, adjustTextareaHeight]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      data-list-id={listProp.id}
      className={`group/list relative mb-2 flex min-w-[250px] flex-col rounded-lg border p-3 shadow-lg ${activeList?.getAttribute("data-list-id") === listProp.id ? "bg-blue-50" : "bg-white"}`}
    >
      <div className="flex justify-between">
        {/* list title: becomes textarea when editing */}
        {isEditingTitle ? (
          <textarea
            ref={textareaRef} // Attach the ref
            value={title}
            onBlur={(e) => {
              setIsEditingTitle(false);
              listTitleMutation.mutate({
                listId: listProp.id,
                newTitle: e.target.value,
              });
            }}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            onKeyDown={handleListTitleKeyDown}
            className="flex-1 resize-none overflow-hidden text-xl font-bold" // Added overflow-hidden and styling
            rows={1} // Start with one row
          />
        ) : (
          <label
            onClick={() => setIsEditingTitle(true)}
            className={`flex-1 overflow-hidden whitespace-pre-wrap break-words text-xl font-bold ${title === "" ? "text-gray-300" : ""}`}
          >
            {title === ""
              ? listProp.isPinned
                ? `--pinned${listProp.position + 1}--`
                : `--list${listProp.position + 1}--`
              : title}
          </label>
        )}

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
            <TodoItem itemProp={item} />
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
          className={`absolute -top-4 left-[37.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg transition-opacity group-hover/list:opacity-100 ${isRightSidebarOpen && listId === listProp.id ? "bg-blue-500 text-white opacity-100" : "bg-gray-200 opacity-0"}`}
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
