"use client";

import { ListWithItemsView } from "@/types";
import { MdAdd } from "react-icons/md";

export default function AddListButton({
  handleButtonClick,
}: {
  handleButtonClick: () => void;
}) {
  return (
    <button
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      onClick={handleButtonClick}
      aria-label="Add new list"
    >
      <MdAdd className="text-2xl" />
    </button>
  );
}
