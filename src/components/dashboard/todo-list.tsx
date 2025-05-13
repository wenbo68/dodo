"use client";

import { ListWithItemsView } from "@/types";
import TodoItem from "./todo-item";
import { useEffect, useRef, useState } from "react";
import { deleteItem } from "@/lib/db/item-actions";
import { updateListTitle } from "@/lib/db/list-actions";
import { TiPinOutline } from "react-icons/ti";
import { MdOutlinePlaylistAdd, MdOutlineEditNote } from "react-icons/md";
import { RxTrash } from "react-icons/rx";

export default function TodoList({
  list,
  userId,
  setItemsRef,
  position: positionProp,
  handleDeleteList,
}: {
  list: ListWithItemsView;
  userId: string;
  setItemsRef: (element: HTMLUListElement | null, listId: string) => void;
  position: number;
  handleDeleteList: (listId: number) => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [items, setItems] = useState(list.items);
  //is adding a new item?
  const [isAdding, setIsAdding] = useState({ status: false, tempId: "" });
  const [position, setPosition] = useState(positionProp);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setPosition(positionProp);
  }, [positionProp]);

  // Adjust height when editing starts or description changes programmatically
  useEffect(() => {
    if (isEditingTitle && textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
      textareaRef.current.focus(); // Keep autoFocus behavior
    }
  }, [isEditingTitle, title]); // Rerun when editing starts or description changes

  // Function to adjust textarea height
  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      // element.style.height = 'auto'; // Reset height to recalculate scrollHeight
      element.scrollHeight; // Have to call element.scrollHeight twice for some reason...
      element.style.height = `${element.scrollHeight}px`; // Set height based on content
    }
  };

  // Handler for Add Item button
  const handleAddItem = () => {
    // Add a blank temp item to the list
    const tempId = `temp-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        tempId,
        description: "",
        isComplete: false,
        position: prev.length,
        userId,
        listId: list.id,
      },
    ]);
    setIsAdding({ status: true, tempId });
    console.log("handleAddItem() called");
  };

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
    setIsEditingTitle(true);
  };

  const handleListTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
  };

  const handleListTitleBlur = async () => {
    setIsEditingTitle(false);
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

  const handleEditList = () => {
    // Handle edit list logic here
  };

  return (
    <div
      key={list.id ?? list.tempId}
      className="group/list relative flex min-w-[250px] flex-col rounded-lg border bg-white p-3 shadow-lg"
    >
      <div className="mb-1 flex justify-between">
        {/* list title: becomes textarea when editing */}
        {isEditingTitle ? (
          <textarea
            ref={textareaRef} // Attach the ref
            value={title}
            onChange={handleListTitleChange}
            onBlur={handleListTitleBlur}
            onKeyDown={handleListTitleKeyDown}
            className="flex-1 resize-none overflow-hidden text-xl font-bold" // Added overflow-hidden and styling
            rows={1} // Start with one row
          />
        ) : (
          <label
            onClick={handleListTitleClick}
            className={`flex-1 overflow-hidden whitespace-pre-wrap break-words text-xl font-bold ${title === "" ? "text-gray-300" : ""}`}
          >
            {title === "" ? `List_${position + 1}` : title}
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
            listId={list.id!}
            handleDeleteItem={handleDeleteItem}
            isNew={
              isAdding.status && item.tempId && isAdding.tempId === item.tempId
                ? true
                : false
            }
            setIsAdding={setIsAdding}
          />
        ))}
      </ul>
      {/* pin item button */}
      <button>
        <TiPinOutline className="absolute -top-4 left-[12.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-gray-100 opacity-0 transition-opacity group-hover/list:opacity-100" />
      </button>
      {/* edit item button */}
      <button onClick={() => handleEditList()}>
        <MdOutlineEditNote className="absolute -top-4 left-[37.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-gray-100 opacity-0 transition-opacity group-hover/list:opacity-100" />
      </button>
      {/* add item button */}
      <button onClick={() => handleAddItem()}>
        <MdOutlinePlaylistAdd className="absolute -top-4 left-[62.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-gray-100 opacity-0 transition-opacity group-hover/list:opacity-100" />
      </button>
      {/* delete item button */}
      <button onClick={() => handleDeleteList(list.id!)}>
        <RxTrash className="absolute -top-4 left-[87.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-gray-100 opacity-0 transition-opacity group-hover/list:opacity-100" />
      </button>
    </div>
  );
}
