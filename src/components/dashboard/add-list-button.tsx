"use client";

import { v4 } from "uuid"; // npm install uuid @types/uuid
import { MdAdd } from "react-icons/md";
import { useAuth } from "../context/auth-context";
import { useListMutations } from "@/lib/utils/todo-list-mutations";
import { useLeftSidebar } from "../context/left-sidebar-context";
import { useBotbar } from "../context/botbar-context";

export default function AddListButton() {
  const { userId } = useAuth();
  const { addListMutation } = useListMutations();
  const { isLeftSidebarOpen } = useLeftSidebar();
  const { isBotbarOpen } = useBotbar();

  return (
    <button
      className={`${isBotbarOpen ? "-translate-y-[340px]" : "translate-y-0"} fixed bottom-4 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-colors hover:bg-blue-600`}
      onClick={() =>
        addListMutation.mutate({
          id: v4(),
          userId,
          title: "",
          position: 0,
          isPinned: false,
          createdAt: new Date(Date.now()),
          updatedAt: new Date(Date.now()),
          deletedAt: null,
          items: [],
          isNew: true,
        })
      }
      aria-label="Add new list"
    >
      <MdAdd className="text-2xl" />
    </button>
  );
}
