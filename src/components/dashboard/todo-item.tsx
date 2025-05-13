"use client";

import { useEffect, useRef, useState } from "react";
import {
  addItem,
  updateItemDescription,
  updateItemIsComplete,
} from "~/lib/db/item-actions";
import { ItemView } from "~/types";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

export default function TodoItem({
  item,
  userId,
  listId,
  handleDeleteItem,
  isNew,
  setIsAdding,
}: {
  item: ItemView;
  userId: string;
  listId: number;
  handleDeleteItem: (itemId: number, itemPosition: number) => void;
  isNew: boolean;
  setIsAdding: React.Dispatch<
    React.SetStateAction<{ status: boolean; tempId: string }>
  >;
}) {
  // const [itemId, setItemId] = useState(item.id);
  const [isComplete, setIsComplete] = useState(item.isComplete ?? false);
  const [description, setDescription] = useState(item.description ?? "");
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);

  // use ref if ui doesn't depend on the var (ie itemId isn't displayed in ui)
  // also, state setter is always async (ie the state is not updated immediately)
  // so if you need to use the updated state immediately after setting it, use ref
  // using a var (via let) doesn't work
  // because functions created before the assignment of the var will only see the old value
  const itemIdRef = useRef(item.id ?? -1);
  // Update both state and ref when changing ID
  const setItemIdRef = (newId: number) => {
    itemIdRef.current = newId;
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for the textarea
  // Function to adjust textarea height
  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      element.scrollHeight; // Have to call element.scrollHeight twice for some reason...
      element.style.height = `${element.scrollHeight}px`; // Set height based on content
    }
  };
  // useEffect is run immediately after the rerender caused by the state change
  // state setter called (async) -> state updates -> rerender -> useEffect runs
  // Adjust height when editing starts or description changes programmatically
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
      textareaRef.current.focus(); // Keep autoFocus behavior
    }
  }, [isEditing, description]); // Rerun when editing starts or description changes

  const handleCheckboxChange = async () => {
    console.log("checkbox change");

    const newIsComplete = !isComplete;
    setIsComplete(newIsComplete); // Optimistically update the UI -> db update is in useEffect

    setIsCheckboxDisabled(true);
    setTimeout(() => setIsCheckboxDisabled(false), 500);

    const release = await mutex.acquire();
    try {
      console.log("initiating db write");
      await updateItemIsComplete(userId, itemIdRef.current, newIsComplete);
    } catch (error) {
      setIsComplete(!newIsComplete); // Revert the UI if the update fails
      console.error("useEffect failed: ", error);
    } finally {
      release();
      console.log("db write done");
    }
  };

  const handleItemDescriptionClick = () => {
    setIsEditing(true);
  };

  const handleItemDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDescription(e.target.value);
  };

  //only make the function async if you need to await something in backend
  const handleItemDescriptionBlur = async () => {
    // need to finish handleItemDescriptionBlur before handleCheckboxChange
    // or else there would be no correct item id
    const release = await mutex.acquire();

    setIsEditing(false);
    //if this is newly added and blurred, reset the adding state in list
    if (isNew) {
      setIsAdding({ status: false, tempId: "" });
      try {
        setItemIdRef(
          await addItem(userId, listId, description, isComplete, item.position),
        );
        console.log("itemId: ", itemIdRef.current); // returns undefined but why? i set the state to new value just above...
      } catch (error) {
        console.error("handleItemDescriptionBlur failed: ", error);
      } finally {
        release();
        console.log("blur done");
      }
      return;
    }
    if (description !== item.description) {
      try {
        // Call your update description API here
        await updateItemDescription(itemIdRef.current, description);
      } catch (error) {
        console.error("handleDescriptionBlur failed: ", error);
        setDescription(item.description); // revert on error
      } finally {
        release();
        console.log("blur done");
      }
    }
  };

  const handleItemDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <li className="group flex gap-1 border-b border-gray-100 py-1 last:border-0">
      {/* Item handle */}
      <div className="item-drag-handle h-4 w-4 cursor-move">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-500 hover:text-gray-950"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </div>
      {/* Item checkbox */}
      <input
        type="checkbox"
        className="peer h-4 w-4 flex-shrink-0 rounded"
        checked={isComplete}
        onChange={handleCheckboxChange}
        disabled={isCheckboxDisabled}
      />
      {/* Item description: becomes textarea when editing*/}
      {isEditing ? (
        <textarea
          ref={textareaRef} // Attach the ref
          value={description}
          onChange={handleItemDescriptionChange}
          onBlur={handleItemDescriptionBlur}
          onKeyDown={handleItemDescriptionKeyDown}
          className="flex-1 resize-none overflow-hidden text-sm font-medium" // Added overflow-hidden and styling
          rows={1} // Start with one row
          // autoFocus // autoFocus is handled by useEffect now
        />
      ) : (
        <label
          onClick={handleItemDescriptionClick}
          className={`flex-1 overflow-hidden whitespace-pre-wrap break-words text-sm font-medium ${isComplete && description !== "" ? "text-gray-400 line-through" : ""}`}
        >
          {description === "" ? " " : description}
        </label>
      )}
      <button
        onClick={() => handleDeleteItem(itemIdRef.current, item.position)}
        className="h-5 text-xs text-gray-600 opacity-0 transition-opacity hover:text-gray-950 group-hover:opacity-100"
      >
        X
      </button>
    </li>
  );
}
