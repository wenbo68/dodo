"use client";

import { ItemView, ListWithItemsView } from "@/types";
import TodoItem from "./todo-item";
import { useEffect, useRef, useState } from "react";
import { it } from "node:test";
import { deleteItem } from "@/lib/db/item-actions";
import { set } from "zod";
import { updateListTitle } from "@/lib/db/list-actions";

export default function TodoList({
  list,
  userId,
  setItemsRef,
}: {
  list: ListWithItemsView;
  userId: string;
  setItemsRef: (element: HTMLUListElement | null, listId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [items, setItems] = useState(list.items);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to adjust textarea height
  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      // element.style.height = 'auto'; // Reset height to recalculate scrollHeight
      element.scrollHeight; // Have to call element.scrollHeight twice for some reason...
      element.style.height = `${element.scrollHeight}px`; // Set height based on content
    }
  };

  // Adjust height when editing starts or description changes programmatically
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
      textareaRef.current.focus(); // Keep autoFocus behavior
    }
  }, [isEditing, title]); // Rerun when editing starts or description changes

  const handleDeleteItem = async (itemId: number, itemPosition: number) => {
    // Find the index and item before deleting
    const index = itemPosition;
    const deletedItem = items[index];

    // Optimistically update the UI
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

    try {
      // delete item in db
      await deleteItem(itemId);
    } catch (error) {
      console.error("handleDeleteItem() failed:", error);
      // Revert the UI at the original position
      setItems((prevItems) => {
        const newItems = [...prevItems];
        newItems.splice(index, 0, deletedItem);
        return newItems;
      });
    }
  };

  const handleListTitleClick = () => {
    setIsEditing(true);
  };

  const handleListTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
  };

  const handleListTitleBlur = async () => {
    setIsEditing(false);
    if (title !== list.title) {
      try {
        // Call your update description API here
        await updateListTitle(list.id!, title);
      } catch (error) {
        console.error("handleListTitleBlur() failed: ", error);
        setTitle(list.title); // revert on error
      }
    }
  };

  const handleListTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div
      key={list.id ?? list.tempId}
      className="relative flex min-w-[250px] flex-col rounded-lg border bg-white p-3 shadow-lg"
    >
      <div className="mb-1 flex justify-between">
        {/* list title: becomes textarea when editing */}
        {isEditing ? (
          <textarea
            ref={textareaRef} // Attach the ref
            value={title}
            onChange={handleListTitleChange}
            onBlur={handleListTitleBlur}
            onKeyDown={handleListTitleKeyDown}
            className="flex-1 resize-none overflow-hidden text-xl font-bold" // Added overflow-hidden and styling
            rows={1} // Start with one row
            // autoFocus // autoFocus is handled by useEffect now
          />
        ) : (
          // <h3
          //   onClick={handleListTitleClick}
          //   className="flex-1 overflow-hidden whitespace-pre-wrap break-words text-lg font-semibold"
          // >
          //   {list.title}
          // </h3>
          <label
            onClick={handleListTitleClick}
            className="flex-1 overflow-hidden whitespace-pre-wrap break-words text-xl font-bold"
          >
            {title}
          </label>
        )}

        {/* list handle */}
        <div className="list-drag-handle cursor-move">
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
      <ul ref={(el) => setItemsRef(el, String(list.id ?? list.tempId))}>
        {/* 1 item */}
        {items.map((item) => (
          <TodoItem
            key={item.id ?? item.tempId}
            item={item}
            userId={userId}
            handleDeleteItem={handleDeleteItem}
          />
        ))}
      </ul>
      {/* add item button */}
      <button
        onClick={() => {}}
        className="absolute -bottom-3 w-16 rounded-lg bg-gray-200 text-sm"
      >
        Add Item
      </button>
    </div>
  );
}
