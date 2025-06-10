"use client";

import { DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { Item } from "~/types";
import { useItemMutations } from "@/lib/utils/todo-item-mutations";
import { motion } from "framer-motion";
import { IoMdCheckmark } from "react-icons/io";
import { useItemDnd } from "@/lib/utils/todo-item-dnd";
import { set } from "zod";

export default function TodoItem({
  itemProp,
  inSidebar,
  isReadOnly,
}: {
  itemProp: Item;
  inSidebar: boolean;
  isReadOnly: boolean;
}) {
  const {
    deleteItemMutation,
    itemDescriptionMutation,
    itemIsCompleteMutation,
  } = useItemMutations();

  // create component states
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState(false);
  const [description, setDescription] = useState(itemProp.description);
  const [isFocused, setIsFocused] = useState(false);

  //create required refs
  const descriptionRef = useRef<HTMLDivElement>(null);

  // fetch required functions
  const { handleDragStart } = useItemDnd();

  // create required functions
  const handleDescriptionBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      setIsFocused(false);

      const newDescription = e.currentTarget.textContent || "";
      setDescription(newDescription);
      if (newDescription !== itemProp.description) {
        itemDescriptionMutation.mutate({
          itemId: itemProp.id,
          newDescription,
        });
      }
    },
    [
      setIsFocused,
      setDescription,
      itemProp.description,
      itemProp.id,
      itemDescriptionMutation,
    ],
  );

  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      element.style.height = "auto"; // Reset height to recalculate scrollHeight
      element.style.height = `${element.scrollHeight}px`; // Set height based on content
    }
  };

  useEffect(() => {
    setDescription(itemProp.description);
  }, [itemProp.description]);

  useEffect(() => {
    if (
      itemProp.isNew &&
      itemProp.inSidebar === inSidebar &&
      descriptionRef.current
    ) {
      descriptionRef.current.focus();
    }
  }, [itemProp.isNew, itemProp.inSidebar, inSidebar, descriptionRef]);

  return (
    <li data-item-id={itemProp.id} className="group flex gap-1">
      {/* Item handle */}
      <div
        draggable={!isReadOnly}
        onDragStart={
          isReadOnly ? undefined : (e) => handleDragStart(e, itemProp.id)
        }
        className={`item-drag-handle h-4 w-4 translate-y-[1px] ${isReadOnly ? "" : "cursor-move"}`}
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
          className={`${itemProp.isComplete ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-800 dark:text-neutral-100"}`}
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
      <label
        className={`relative flex translate-y-[1px] ${isReadOnly ? "cursor-default" : "cursor-pointer"} `}
      >
        <input
          type="checkbox"
          className={`peer h-4 w-4 appearance-none rounded border border-neutral-800 bg-transparent checked:border-neutral-300 dark:border-neutral-100 dark:checked:border-neutral-600`}
          id="custom-checkbox"
          checked={itemProp?.isComplete ?? false}
          onChange={(e) => {
            setIsCheckboxDisabled(true);
            setTimeout(() => setIsCheckboxDisabled(false), 500);
            itemIsCompleteMutation.mutate({
              itemId: itemProp.id,
              newIsComplete: e.target.checked,
            });
          }}
          disabled={isCheckboxDisabled || isReadOnly}
        />
        <span className="absolute text-neutral-300 opacity-0 peer-checked:opacity-100 dark:text-neutral-600">
          <IoMdCheckmark className="pb-0.5 pl-0.5 pr-1" />
        </span>
      </label>
      {/* Item description: becomes textarea when editing*/}
      <motion.div
        ref={descriptionRef}
        contentEditable={!isReadOnly}
        suppressContentEditableWarning={true}
        onFocus={isReadOnly ? undefined : (e) => setIsFocused(true)}
        onBlur={handleDescriptionBlur}
        className={`flex-1 overflow-hidden whitespace-pre-wrap break-words text-sm font-medium outline-none ${
          itemProp.isComplete
            ? "text-neutral-300 line-through dark:text-neutral-600" // Completed item text in dark mode
            : "text-neutral-800 dark:text-neutral-100" // Normal item text in dark mode
        }`}
      >
        {description}
      </motion.div>
      <button
        onClick={() =>
          deleteItemMutation.mutate({
            listId: itemProp.listId,
            itemId: itemProp.id,
          })
        }
        className={`h-5 text-xs font-bold text-neutral-600 opacity-0 hover:text-gray-800 group-hover:opacity-100 dark:text-gray-300 dark:hover:text-neutral-100 ${isReadOnly ? "hidden" : "group-hover:opacity-100"} ${isFocused ? "opacity-100" : "opacity-0"}`}
      >
        X
      </button>
    </li>
  );
}
