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

// for temp list/item, the client side cache is the only source of truth
// when updating a temp list/item, we only need to update the client cache
// when the real id is returned, we sync the db with the client side cache for that temp list/item
// if the syncing returns error, we remove that list/item from the client side cache
export default function TodoList({ listProp }: { listProp: ListWithItems }) {
  const { listTitleMutation, pinListMutation, deleteListMutation } =
    useListMutations();
  const { reorderItemsMutation, addItemMutation } = useItemMutations();

  // create component states
  const [title, setTitle] = useState(listProp.title);

  const handleItemDndEnd = (evt: Sortable.SortableEvent) => {
    const itemId = evt.item.getAttribute("data-item-id");
    if (!itemId) {
      console.error("handleItemDndEnd failed: itemId not found");
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
      console.error("handleItemDndEnd failed: index not found");
      return;
    }

    const srcListId = evt.from.getAttribute("data-list-id");
    const destListId = evt.to.getAttribute("data-list-id");
    if (!srcListId || !destListId) {
      console.error("handleItemDndEnd failed: src/dest listId not found");
      return;
    }

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

  // create component states
  // const [isNew, setIsNew] = useState(listProp.id.startsWith("temp-"));
  const [isEditingTitle, setIsEditingTitle] = useState(
    listProp.id.startsWith("temp-"),
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // helper function to adjust textarea height
  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      // element.style.height = 'auto'; // Reset height to recalculate scrollHeight
      element.scrollHeight; // Have to call element.scrollHeight twice for some reason...
      element.style.height = `${element.scrollHeight}px`; // Set height based on content
    }
  };

  // Adjust height of textbox when editing starts
  // or when description changes programmatically
  useEffect(() => {
    if (isEditingTitle && textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
      textareaRef.current.focus(); // Keep autoFocus behavior
    }
  }, [isEditingTitle, textareaRef, adjustTextareaHeight]); // Rerun when editing starts or description changes

  const listRef = useRef<HTMLUListElement>(null);
  // sortable.js for the list
  useEffect(() => {
    if (!listRef.current) return;

    // Initialize Sortable.js for the list
    const sortable = Sortable.create(listRef.current, {
      group: {
        name: "lists", // Give them the same group name
      },
      animation: 150,
      ghostClass: "hidden-ghost",
      handle: ".item-drag-handle",
      onEnd: (evt) => handleItemDndEnd(evt),
    });

    return () => {
      sortable.destroy();
    };
  }, [listRef, handleItemDndEnd, listProp]);

  const handleListTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
      setIsEditingTitle(false);
    }
  };

  const handleEditList = () => {
    // Handle edit list logic here
  };

  return (
    <div
      data-list-id={listProp.id}
      className="group/list relative flex min-w-[250px] flex-col rounded-lg border bg-white p-3 shadow-lg"
    >
      <div className="mb-1 flex justify-between">
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
      <ul ref={listRef} data-list-id={listProp.id}>
        {/* 1 item */}
        {listProp.items.map((item, index) => (
          <TodoItem key={item.id} itemProp={item} />
        ))}
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
          className={`absolute -top-4 left-[12.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg transition-opacity group-hover/list:opacity-100 ${listProp.isPinned ? "bg-blue-500 text-white opacity-100" : "bg-gray-100 opacity-0"}`}
        />
      </button>
      {/* edit list button */}
      <button onClick={() => handleEditList()}>
        <MdOutlineEditNote className="absolute -top-4 left-[37.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-gray-100 opacity-0 transition-opacity group-hover/list:opacity-100" />
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
            },
          })
        }
      >
        <MdOutlinePlaylistAdd className="absolute -top-4 left-[62.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-gray-100 opacity-0 transition-opacity group-hover/list:opacity-100" />
      </button>
      {/* delete list button */}
      <button
        onClick={() => deleteListMutation.mutate({ listId: listProp.id })}
      >
        <RxTrash className="absolute -top-4 left-[87.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-gray-100 opacity-0 transition-opacity group-hover/list:opacity-100" />
      </button>
    </div>
  );
}
