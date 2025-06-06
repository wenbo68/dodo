"use client";

import { v4 } from "uuid"; // npm install uuid @types/uuid
import { MdAdd } from "react-icons/md";
import { useAuth } from "../context/auth-context";
import { useListMutations } from "@/lib/utils/todo-list-utils";
import { useLeftSidebar } from "../context/left-sidebar-context";

export default function AddListButton() {
  const { userId } = useAuth();
  const { addListMutation } = useListMutations();
  const { isLeftSidebarOpen } = useLeftSidebar();

  return (
    <button
      className={`${isLeftSidebarOpen ? "hidden" : ""} fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-colors hover:bg-blue-600`}
      onClick={() =>
        addListMutation.mutate({
          id: v4(),
          userId,
          title: "",
          position: 0,
          isPinned: false,
          createdAt: new Date(Date.now()),
          updatedAt: new Date(Date.now()),
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
