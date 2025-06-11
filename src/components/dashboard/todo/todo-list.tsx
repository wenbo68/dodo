"use client";

import TodoItem from "./todo-item";
import { useCallback, useEffect, useRef, useState } from "react";
import { LiaMapPinSolid } from "react-icons/lia";
import { ListWithItems } from "@/types";
import { useListMutations } from "@/lib/utils/todo-list-mutations";
import { useItemMutations } from "@/lib/utils/todo-item-mutations";
import { v4 } from "uuid";
import { ItemDropIndicator } from "./drop-indicator";
import { useRightSidebar } from "../../context/right-sidebar-context";
import { useBotbar } from "../../context/botbar-context";
import { LuPen, LuTrash } from "react-icons/lu";
import { IoAdd } from "react-icons/io5";
import { useItemDnd } from "@/lib/utils/todo-item-dnd";
import { useListDnd } from "@/lib/utils/todo-list-dnd";
import { CgRedo } from "react-icons/cg";
import toast from "react-hot-toast";

const USE_BOTBAR_WIDTH = 670;

export default function TodoList({
  listProp,
  loc,
}: {
  listProp: ListWithItems;
  loc: string;
}) {
  // variables
  const isReadOnly = listProp.deletedAt !== null;

  // fetch requied client-side states
  const {
    isRightSidebarOpen,
    closeRightSidebar,
    openRightSidebar,
    listId: rightListId,
    setListId: setRightListId,
  } = useRightSidebar();
  const {
    isBotbarOpen,
    closeBotbar,
    openBotbar,
    listId: botListId,
    setListId: setBotListId,
  } = useBotbar();

  // create component states
  const [title, setTitle] = useState(listProp.title);
  const [isFocused, setIsFocused] = useState(false);
  const [isActive, setIsActive] = useState<HTMLElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [showMobileActions, setShowMobileActions] = useState(false);

  // create required ref
  const listRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // fetch required function
  const {
    listTitleMutation,
    pinListMutation,
    recoverListMutation,
    deleteListMutation,
  } = useListMutations();
  const { addItemMutation } = useItemMutations();
  const { handleDragStart } = useListDnd();
  const { handleDrop, handleDragOver, handleDragLeave } = useItemDnd();

  // create required functions
  const handleOnFocus = useCallback(() => {
    if (titleRef.current) {
      titleRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
    setIsFocused(true);
  }, [setIsFocused]);

  const handleTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const newTitle = e.currentTarget.textContent || "";
      setTitle(newTitle);
      setIsFocused(false);
      if (newTitle !== listProp.title) {
        listTitleMutation.mutate({
          listId: listProp.id,
          newTitle,
        });
      }
    },
    [setTitle, setIsFocused, listProp.title, listProp.id, listTitleMutation],
  );

  const handleEditList = useCallback(() => {
    const useBotbar = viewportWidth < USE_BOTBAR_WIDTH;
    if (
      loc === "page" &&
      listProp.id !== rightListId &&
      listProp.id !== botListId
    ) {
      // click edit in page AND list is not in edit mode => open bot or sidebar
      if (useBotbar) {
        setBotListId(listProp.id);
        openBotbar();
      } else {
        setRightListId(listProp.id);
        openRightSidebar();
      }
    } else if (loc === "sidebar" || listProp.id === rightListId) {
      // click edit in sidebar OR click edit in page (but the list is in edit mode) => clear and close sidebar
      closeRightSidebar();
      setRightListId("");
    } else if (loc === "botbar" || listProp.id === botListId) {
      // click edit in botbar OR click edit in page (but the list is in edit mode) => clear and close botbar
      closeBotbar();
      setBotListId("");
    }
  }, [
    viewportWidth,
    loc,
    listProp.id,
    rightListId,
    botListId,
    setBotListId,
    setRightListId,
    openBotbar,
    openRightSidebar,
    closeBotbar,
    closeRightSidebar,
  ]);

  // Sync title with prop to sync with list in sidebar
  useEffect(() => {
    setTitle(listProp.title);
  }, [listProp.title]);

  // Handle initial focus for new lists only once
  useEffect(() => {
    if (listProp.isNew && loc === "page" && titleRef.current) {
      // if list is new and in page, focus on title
      titleRef.current.focus();
    }
  }, [listProp.isNew, loc, titleRef]);

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
  }, [setViewportWidth]); // Empty dependency array means this runs once on mount and cleans up on unmount

  // when clicking outside the list, list options disappear
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setShowMobileActions(false);
      }
    };
    // Add event listener to the document when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowMobileActions]); // Re-run effect if these dependencies change

  return (
    <div
      ref={listRef}
      onDrop={isReadOnly ? undefined : (e) => handleDrop(e, setIsActive)}
      onDragOver={
        isReadOnly ? undefined : (e) => handleDragOver(e, setIsActive)
      }
      onDragLeave={
        isReadOnly ? undefined : (e) => handleDragLeave(e, setIsActive)
      }
      data-list-id={listProp.id}
      onTouchStart={(e) => setShowMobileActions(!showMobileActions)}
      className={`group/list relative mb-2 flex min-w-[250px] max-w-[250px] flex-col gap-0 rounded-lg border border-neutral-200 p-3 shadow-lg dark:border-neutral-300 ${
        isActive?.getAttribute("data-list-id") === listProp.id
          ? "bg-blue-50 dark:bg-neutral-700" // Dark mode for active list
          : "bg-white dark:bg-neutral-800" // Dark mode for inactive list
      }`}
    >
      <div className="mb-1 flex items-start justify-between">
        <div
          ref={titleRef}
          contentEditable={!isReadOnly}
          suppressContentEditableWarning={true}
          onFocus={isReadOnly ? undefined : handleOnFocus}
          onBlur={isReadOnly ? undefined : handleTitleBlur}
          className={`flex-1 overflow-hidden whitespace-pre-wrap break-words text-xl font-bold outline-none ${
            title === "" && !isFocused
              ? "text-gray-300 dark:text-neutral-600" // Dark mode for placeholder text
              : "text-gray-800 dark:text-neutral-100" // Dark mode for actual title text
          } ${isReadOnly ? "cursor-default" : "cursor-text"}`}
        >
          {title || // If title is empty string, use placeholder
            (!isFocused &&
              (listProp.isPinned
                ? `--pinned${listProp.position + 1}--`
                : `--list${listProp.position + 1}--`))}
        </div>

        {/* list handle */}
        <div
          draggable={!isReadOnly}
          onDragStart={(e) => handleDragStart(e, listProp.id)}
          className={`list-drag-handle ${isReadOnly ? "" : "cursor-move"}`}
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
            className="text-neutral-300 dark:text-neutral-500" // Dark mode for handle icon
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
          <div key={item.id} className="flex flex-col gap-1">
            <ItemDropIndicator itemId={item.id} />
            <TodoItem itemProp={item} loc={loc} isReadOnly={isReadOnly} />
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
          isReadOnly
            ? undefined
            : pinListMutation.mutate({
                listId: listProp.id,
                newIsPinned: !listProp.isPinned,
              })
        }
      >
        <LiaMapPinSolid
          className={`absolute -top-4 left-[12.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-white text-neutral-800 transition-opacity ${isReadOnly ? "cursor-default" : "group-hover/list:opacity-100"} dark:bg-neutral-800 dark:text-neutral-100 ${
            listProp.isPinned
              ? "opacity-100"
              : showMobileActions && listProp.deletedAt === null
                ? "opacity-100"
                : "opacity-0"
          }`}
        />
      </button>
      {/* edit list button */}
      <button onClick={() => handleEditList()}>
        <LuPen
          className={`absolute -top-4 left-[37.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-white p-1 text-neutral-800 transition-opacity ${isReadOnly ? "" : "group-hover/list:opacity-100"} dark:bg-neutral-800 dark:text-neutral-100 ${
            (isRightSidebarOpen && listProp.id === rightListId) ||
            (isBotbarOpen && listProp.id === botListId)
              ? "opacity-100" // Active edit state remains same
              : showMobileActions && !isReadOnly
                ? "opacity-100"
                : "opacity-0" // Dark mode for inactive edit icon
          }`}
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
              loc,
            },
          })
        }
      >
        <IoAdd
          className={`absolute -top-4 left-[62.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-white text-neutral-800 transition-opacity ${isReadOnly ? "" : "group-hover/list:opacity-100"} dark:bg-neutral-800 dark:text-neutral-100 ${showMobileActions && listProp.deletedAt === null ? "opacity-100" : "opacity-0"}`} // Dark mode for add item icon
        />
      </button>
      {/* delete list button */}
      <button
        onClick={() => {
          if (!isReadOnly) deleteListMutation.mutate({ listId: listProp.id });
          else recoverListMutation.mutate({ listId: listProp.id });
          // close side/botbar if the list is in edit mode
          if (listProp.id === rightListId) {
            setRightListId("");
            closeRightSidebar();
          } else if (listProp.id === botListId) {
            setBotListId("");
            closeBotbar();
          }
          // Show toast notification
          toast.custom((t) => (
            <div
              className={`rounded-lg border-neutral-100 bg-neutral-800 px-4 py-2 text-base text-neutral-100 shadow-lg dark:border-neutral-800 dark:bg-neutral-100 dark:text-neutral-800`}
            >
              {isReadOnly ? "List recovered" : "List moved to trash"}
            </div>
          ));
        }}
      >
        {isReadOnly ? (
          <CgRedo
            className={`absolute -top-4 left-[87.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-white text-neutral-800 opacity-0 transition-opacity group-hover/list:opacity-100 dark:bg-neutral-800 dark:text-neutral-100 ${showMobileActions ? "opacity-100" : "opacity-0"}`} // Dark mode for delete icon
          />
        ) : (
          <LuTrash
            className={`absolute -top-4 left-[87.5%] h-7 w-7 -translate-x-1/2 transform rounded-lg bg-white p-1 text-neutral-800 opacity-0 transition-opacity group-hover/list:opacity-100 dark:bg-neutral-800 dark:text-neutral-100 ${showMobileActions ? "opacity-100" : "opacity-0"}`} // Dark mode for delete icon
          />
        )}
      </button>
    </div>
  );
}
