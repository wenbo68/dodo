"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Transition } from "@headlessui/react";
import { HiOutlineXMark, HiBars3 } from "react-icons/hi2";
import { FaFingerprint } from "react-icons/fa";

import Container from "./Container";
import { siteDetails } from "@/data/siteDetails";
import { menuItems } from "@/data/menuItems";
import DarkModeButton from "../dashboard/dark-mode-button";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 mx-auto w-full bg-transparent md:absolute">
      <Container className="!px-0">
        <nav className="mx-auto flex items-center justify-between bg-background px-5 py-2 shadow-md dark:bg-neutral-800 md:bg-transparent md:py-4 md:shadow-none">
          <div className="flex justify-between gap-10">
            {/* Logo */}
            <Link href="/" className="flex -translate-y-0.5 items-center gap-2">
              <FaFingerprint className="h-7 w-7 min-w-fit text-foreground dark:text-white" />
              <span className="manrope cursor-pointer text-xl font-semibold text-foreground">
                {siteDetails.siteName}
              </span>
            </Link>

            {/* Desktop Menu */}
            <ul className="hidden space-x-6 md:flex">
              {menuItems.map((item) => (
                <li key={item.text}>
                  <Link
                    href={item.url}
                    className="text-foreground-accent hover:text-foreground"
                  >
                    {item.text}
                  </Link>
                </li>
              ))}
              <li></li>
            </ul>
          </div>

          <div className="flex gap-6">
            <DarkModeButton />
            <Link
              href={{
                pathname: "/api/auth/signin",
                query: { callbackUrl: "/dashboard" },
              }}
              className="hidden rounded-full bg-primary px-8 py-3 text-background transition-colors hover:bg-primary-accent md:block"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-black focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
              ) : (
                <HiBars3 className="h-6 w-6" aria-hidden="true" />
              )}
              <span className="sr-only">Toggle navigation</span>
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
        <div id="mobile-menu" className="bg-white shadow-lg md:hidden">
          <ul className="flex flex-col space-y-4 px-6 pb-6 pt-1">
            {menuItems.map((item) => (
              <li key={item.text}>
                <Link
                  href={item.url}
                  className="block text-foreground hover:text-primary"
                  onClick={toggleMenu}
                >
                  {item.text}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="#cta"
                className="block w-fit rounded-full bg-primary px-5 py-2 text-black hover:bg-primary-accent"
                onClick={toggleMenu}
              >
                Get Started
              </Link>
            </li>
          </ul>
        </div>
      </Transition>
    </header>
  );
};

export default Header;
