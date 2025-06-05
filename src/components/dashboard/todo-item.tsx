"use client";

import { DragEvent, useEffect, useRef, useState } from "react";
import { Item } from "~/types";
import { useItemMutations } from "@/lib/utils/todo-item-utils";
import { motion } from "framer-motion";

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
  // const [isEditingDescription, setIsEditingDescription] = useState(
  //   itemProp.isNew && inSidebar === itemProp.inSidebar,
  // );
  const [description, setDescription] = useState(itemProp.description);

  //create required refs
  // const textareaRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // create required functions

  // const handleItemDescriptionKeyDown = (e: React.KeyboardEvent) => {
  //   if (e.key === "Enter") {
  //     (e.target as HTMLInputElement).blur();
  //     setIsEditingDescription(false);
  //   }
  // };

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

  // useEffect(() => {
  //   if (isEditingDescription && textareaRef.current) {
  //     adjustTextareaHeight(textareaRef.current);
  //     textareaRef.current.focus();
  //   }
  // }, [isEditingDescription, textareaRef, adjustTextareaHeight]);

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
      <motion.div
        ref={descriptionRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={handleDescriptionBlur}
        className={`flex-1 overflow-hidden whitespace-pre-wrap break-words text-sm font-medium outline-none ${itemProp?.isComplete && description !== "" ? "text-gray-400 line-through" : ""}`}
      >
        {description === "" ? " " : description}
      </motion.div>
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
