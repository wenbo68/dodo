"use client";

import { v4 } from "uuid"; // npm install uuid @types/uuid
import { MdAdd } from "react-icons/md";
import { useAuth } from "../context/auth-context";
import { useListMutations } from "@/lib/utils/todo-list-utils";

export default function AddListButton() {
  const { userId } = useAuth();
  const { addListMutation } = useListMutations();

  return (
    <button
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
        })
      }
      aria-label="Add new list"
    >
      <MdAdd className="text-2xl" />
    </button>
  );
}
