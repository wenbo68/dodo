"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { LuAlignJustify } from "react-icons/lu";
import { useLeftSidebar } from "../context/left-sidebar-context";

export default function Topbar() {
  const { toggleLeftSidebar } = useLeftSidebar();

  return (
    <div className="fixed z-30 flex items-center gap-2 p-4">
      <button onClick={toggleLeftSidebar}>
        <LuAlignJustify size={24} />
      </button>
    </div>
  );
}
