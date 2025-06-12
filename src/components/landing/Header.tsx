"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { HiOutlineXMark, HiBars3 } from "react-icons/hi2";
import { FaFingerprint } from "react-icons/fa";

import Container from "./Container";
import { siteDetails } from "@/data/siteDetails";
import { menuItems } from "@/data/menuItems";
import DarkModeButton from "../dashboard/dark-mode-button";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true); // Scrolling up
      } else {
        setIsVisible(false); // Scrolling down
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`dark:bg-backgrounddark fixed left-0 top-0 z-50 mx-auto w-full bg-background transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <Container className="!px-0">
        <nav className="dark:bg-backgrounddark mx-auto flex items-center justify-between bg-background px-5 py-2 shadow-md md:bg-transparent md:shadow-none">
          <div className="flex justify-between gap-10">
            {/* Logo */}
            <Link href="/" className="flex -translate-y-0.5 items-center gap-2">
              <FaFingerprint className="h-7 w-7 min-w-fit text-neutral-800 dark:text-white" />
              <span className="manrope cursor-pointer text-xl font-semibold text-foreground dark:text-white">
                {siteDetails.siteName}
              </span>
            </Link>

            {/* Desktop Menu */}
            <ul className="hidden space-x-6 md:flex">
              {menuItems.map((item) => (
                <li key={item.text}>
                  <Link href={item.url} className="text-foreground-accent">
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
            <DarkModeButton />
          </div>

          <Link
            href={{
              pathname: "/api/auth/signin",
              query: { callbackUrl: "/dashboard" },
            }}
            className="hidden rounded-full bg-primary px-8 py-2 text-background transition-colors md:block"
          >
            Sign In
          </Link>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-neutral-800 dark:text-white md:hidden"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <HiOutlineXMark className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <HiBars3 className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile Menu with Transition */}
      <Transition
        show={isOpen}
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div
          id="mobile-menu"
          className="bg-white shadow-lg dark:bg-neutral-800 md:hidden"
        >
          <ul className="flex flex-col space-y-4 px-6 pb-6 pt-1">
            {menuItems.map((item) => (
              <li key={item.text}>
                <Link
                  href={item.url}
                  className="block text-foreground dark:text-neutral-100"
                  onClick={toggleMenu}
                >
                  {item.text}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/api/auth/signin"
                className="block w-fit rounded-full bg-primary px-5 py-2 text-black dark:text-neutral-100"
                onClick={toggleMenu}
              >
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </Transition>
    </header>
  );
};

export default Header;
