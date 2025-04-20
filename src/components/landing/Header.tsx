'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Transition } from '@headlessui/react';
import { HiOutlineXMark, HiBars3 } from 'react-icons/hi2';
import { FaFingerprint } from 'react-icons/fa';

import Container from './Container';
import { siteDetails } from '@/data/siteDetails';
import { menuItems } from '@/data/menuItems';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full mx-auto bg-transparent md:absolute">
            <Container className="!px-0">
                <nav className="flex items-center justify-between px-5 py-2 mx-auto bg-white shadow-md md:shadow-none md:bg-transparent md:py-10">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <FaFingerprint className="text-foreground min-w-fit w-7 h-7" />
                        <span className="text-xl font-semibold cursor-pointer manrope text-foreground">
                            {siteDetails.siteName}
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <ul className="hidden space-x-6 md:flex">
                        {menuItems.map(item => (
                            <li key={item.text}>
                                <Link href={item.url} className="transition-colors text-foreground hover:text-foreground-accent">
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link
                                href={{
                                    pathname: "/api/auth/signin",
                                    query: { callbackUrl: "/dashboard" },
                                }}
                                className="px-8 py-3 text-black transition-colors rounded-full bg-primary hover:bg-primary-accent"
                            >
                            Log In
                            </Link>
                        </li>
                    </ul>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="flex items-center justify-center w-10 h-10 text-black rounded-full bg-primary focus:outline-none"
                            aria-controls="mobile-menu"
                            aria-expanded={isOpen}
                        >
                            {isOpen ? (
                                <HiOutlineXMark className="w-6 h-6" aria-hidden="true" />
                            ) : (
                                <HiBars3 className="w-6 h-6" aria-hidden="true" />
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
                    <ul className="flex flex-col px-6 pt-1 pb-6 space-y-4">
                        {menuItems.map(item => (
                            <li key={item.text}>
                                <Link href={item.url} className="block text-foreground hover:text-primary" onClick={toggleMenu}>
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link href="#cta" className="block px-5 py-2 text-black rounded-full bg-primary hover:bg-primary-accent w-fit" onClick={toggleMenu}>
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
