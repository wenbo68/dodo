"use client";

import { DragEvent, useEffect, useRef, useState } from "react";
import { Item } from "~/types";
import { useItemMutations } from "@/lib/utils/todo-item-utils";

export default function TodoItem({ itemProp }: { itemProp: Item }) {
  const {
    deleteItemMutation,
    itemDescriptionMutation,
    itemIsCompleteMutation,
  } = useItemMutations();

  // create component states
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(itemProp.description);

  // use ref if ui doesn't depend on the var (ie item.id isn't displayed in ui)
  // also, state setter is always async (ie the state is not updated immediately)
  // so if you need to use the updated state immediately after setting it, use ref
  // using a var (via let) doesn't work
  // because functions created before the assignment of the var will only see the old value

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
    if (isEditingDescription && textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
      textareaRef.current.focus(); // Keep autoFocus behavior
    }
  }, [isEditingDescription, textareaRef, adjustTextareaHeight]); // Rerun when editing starts or description changes

  const handleItemDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
      setIsEditingDescription(false);
    }
  };

  const handleDragStart = (e: DragEvent, itemId: string) => {
    e.dataTransfer.setData("type", "item");
    e.dataTransfer.setData("itemId", itemId);
  };

  return (
    <li data-item-id={itemProp.id} className="group flex gap-1 py-1">
      {/* Item handle */}
      <div
        draggable="true"
        onDragStart={(e) => handleDragStart(e, itemProp.id)}
        className="item-drag-handle h-4 w-4 cursor-move"
      >
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
        checked={itemProp?.isComplete ?? false}
        onChange={(e) => {
          //disable checkbox for 500ms
          setIsCheckboxDisabled(true);
          setTimeout(() => setIsCheckboxDisabled(false), 500);
          itemIsCompleteMutation.mutate({
            itemId: itemProp.id,
            newIsComplete: e.target.checked,
          });
        }}
        disabled={isCheckboxDisabled}
      />
      {/* Item description: becomes textarea when editing*/}
      {isEditingDescription ? (
        <textarea
          ref={textareaRef} // Attach the ref
          value={description}
          onBlur={(e) => {
            setIsEditingDescription(false);
            itemDescriptionMutation.mutate({
              itemId: itemProp.id,
              newDescription: e.target.value,
            });
          }}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleItemDescriptionKeyDown}
          className="flex-1 resize-none overflow-hidden text-sm font-medium" // Added overflow-hidden and styling
          rows={1} // Start with one row
          // autoFocus // autoFocus is handled by useEffect now
        />
      ) : (
        <label
          onClick={() => setIsEditingDescription(true)}
          className={`flex-1 overflow-hidden whitespace-pre-wrap break-words text-sm font-medium ${itemProp?.isComplete && description !== "" ? "text-gray-400 line-through" : ""}`}
        >
          {description === "" ? " " : description}
        </label>
      )}
      <button
        onClick={() =>
          deleteItemMutation.mutate({
            listId: itemProp.listId,
            itemId: itemProp.id,
          })
        }
        className="h-5 text-xs text-gray-600 opacity-0 transition-opacity hover:text-gray-950 group-hover:opacity-100"
      >
        X
      </button>
    </li>
  );
}
