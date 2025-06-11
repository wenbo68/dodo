"use client";

import { useEffect, useRef } from "react";
import { useLeftSidebar } from "../../context/left-sidebar-context";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../context/auth-context";
import { signOut } from "next-auth/react";
import { LuAlignJustify, LuPower, LuTrash, LuUser } from "react-icons/lu";
import { usePathname } from "next/navigation";

export default function LeftSidebar() {
  const { session } = useAuth();
  const { isLeftSidebarOpen, closeLeftSidebar } = useLeftSidebar();
  const pathname = usePathname();

  const sidebarRef = useRef<HTMLElement>(null); // Create a ref for the sidebar

  useEffect(() => {
    // Function to handle clicks outside the sidebar
    const handleClickOutside = (event: MouseEvent) => {
      // If the sidebar is open and the click is outside the sidebarRef element
      if (
        isLeftSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeLeftSidebar(); // Close the sidebar
      }
    };

    // Add event listener to the document when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLeftSidebarOpen, closeLeftSidebar]); // Re-run effect if these dependencies change

  return (
    <>
      {/* Overlay */}
      {isLeftSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent opacity-50" // Darker opacity in dark mode
          onClick={closeLeftSidebar} // Close sidebar when overlay is clicked
        ></div>
      )}
      <nav
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col gap-7 bg-white p-4 dark:bg-neutral-800 ${isLeftSidebarOpen ? "translate-x-0" : "-translate-x-72"}`}
      >
        {/* Profile Photo */}
        <div className="flex items-end gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-full shadow-lg">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "Profile Photo"}
                fill
                sizes="32px"
                className="object-cover"
              />
            )}
          </div>

          <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
            {" "}
            {/* Dark mode for name */}
            {session.user.name?.split(" ")[0]}
          </span>
        </div>

        <div className="flex flex-col items-start gap-1 px-2">
          <Link
            href={"/dashboard"}
            className={`flex w-full items-center gap-3 rounded-lg px-2 py-1 text-neutral-800 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-700 ${
              pathname === "/dashboard"
                ? "bg-neutral-100 dark:bg-neutral-700" // Active link in dark mode
                : "bg-white dark:bg-neutral-800" // Inactive link in dark mode
            }`}
            onClick={closeLeftSidebar} // Close sidebar when link is clicked
          >
            <LuAlignJustify />
            <span className="text-base">Lists</span>
          </Link>

          <Link
            href={"/dashboard/trash"}
            className={`flex w-full items-center gap-3 rounded-lg px-2 py-1 text-neutral-800 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-700 ${
              pathname === "/dashboard/trash"
                ? "bg-neutral-100 dark:bg-neutral-700" // Active link in dark mode
                : "bg-white dark:bg-neutral-800" // Inactive link in dark mode
            }`}
            onClick={closeLeftSidebar} // Close sidebar when link is clicked
          >
            <LuTrash />
            <span className="text-base">Trash</span>
          </Link>

          <button
            className="flex w-full items-center gap-3 rounded-lg px-2 py-1 text-neutral-800 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-700"
            onClick={async () => {
              await signOut({
                redirectTo: "/api/auth/signin?callbackUrl=/dashboard",
              });
            }}
          >
            <LuUser />
            <span className="text-base">Switch account</span>
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-lg px-2 py-1 text-neutral-800 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-700"
            onClick={async () => {
              await signOut({ redirectTo: "/" });
            }}
          >
            <LuPower />
            <span className="text-base">Sign out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
