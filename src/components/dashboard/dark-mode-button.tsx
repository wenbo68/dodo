// components/ThemeToggle.tsx
"use client"; // This is a client component

import { useEffect, useState } from "react";
import { LuMoon, LuSunMedium } from "react-icons/lu";

export default function DarkModeButton() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // On component mount, check localStorage for theme preference
    const root = window.document.documentElement;
    const storedTheme = localStorage.getItem("theme");

    if (
      storedTheme === "dark" ||
      (!storedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
      setIsDark(true);
    } else {
      root.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const isDarkMode = root.classList.contains("dark");

    if (isDarkMode) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full p-1 text-neutral-800 transition-colors duration-200 dark:text-neutral-100"
    >
      {isDark ? <LuMoon /> : <LuSunMedium />}
    </button>
  );
}
