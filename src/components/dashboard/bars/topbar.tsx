"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { LuAlignJustify } from "react-icons/lu";
import { useLeftSidebar } from "../../context/left-sidebar-context";
import DarkModeButton from "../dark-mode-button";

export default function Topbar() {
  const { toggleLeftSidebar } = useLeftSidebar();

  return (
    <div className="fixed z-30 flex flex-col items-center gap-3 p-4">
      <button onClick={toggleLeftSidebar}>
        <LuAlignJustify
          size={24}
          className="text-neutral-800 dark:text-neutral-100"
        />
      </button>
      <DarkModeButton />
    </div>
  );
}
