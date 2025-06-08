"use client";

import { DragEvent, useEffect, useRef, useState } from "react";
import { Item } from "~/types";
import { useItemMutations } from "@/lib/utils/todo-item-utils";
import { motion } from "framer-motion";
import { IoMdCheckmark } from "react-icons/io";

export default function TodoItem({
  itemProp,
  inSidebar,
}: {
  itemProp: Item;
  inSidebar: boolean;
}) {
  const {
    deleteItemMutation,
    itemDescriptionMutation,
    itemIsCompleteMutation,
  } = useItemMutations();

  // create component states
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState(false);
  // const [isFocused, setIsFocused] = useState(false);
  const [description, setDescription] = useState(itemProp.description);

  //create required refs
  const descriptionRef = useRef<HTMLDivElement>(null);

  // create required functions
  const handleDragStart = (e: DragEvent, itemId: string) => {
    e.dataTransfer.setData("type", "item");
    e.dataTransfer.setData("itemId", itemId);
  };

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

  const handleDescriptionBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newDescription = e.currentTarget.textContent || "";
    setDescription(newDescription);
    if (newDescription !== itemProp.description) {
      itemDescriptionMutation.mutate({
        itemId: itemProp.id,
        newDescription,
      });
    }
  };

  return (
    <li data-item-id={itemProp.id} className="group flex gap-1">
      {/* Item handle */}
      <div
        draggable="true"
        onDragStart={(e) => handleDragStart(e, itemProp.id)}
        className="item-drag-handle h-4 w-4 translate-y-[1px] cursor-move"
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
      <label className="relative flex translate-y-[1px] cursor-pointer">
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
          disabled={isCheckboxDisabled}
        />
        <span className="absolute text-neutral-300 opacity-0 peer-checked:opacity-100 dark:text-neutral-600">
          <IoMdCheckmark className="pb-0.5 pl-0.5 pr-1" />
        </span>
      </label>
      {/* Item description: becomes textarea when editing*/}
      <motion.div
        ref={descriptionRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        // onFocus={(e) => setIsFocused(true)}
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
        className="h-5 text-xs text-neutral-600 opacity-0 hover:text-gray-800 group-hover:opacity-100 dark:text-gray-300 dark:hover:text-neutral-100"
      >
        X
      </button>
    </li>
  );
}
