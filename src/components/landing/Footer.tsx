import Link from "next/link";
import React from "react";
import { FaFingerprint } from "react-icons/fa";

import { siteDetails } from "@/data/siteDetails";
import { footerDetails } from "@/data/footer";
import { getPlatformIconByName } from "@/lib/utils/utils";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-10 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 md:grid-cols-3">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <FaFingerprint className="h-5 w-5 min-w-fit md:h-7 md:w-7" />
            <h3 className="manrope cursor-pointer text-xl font-semibold">
              {siteDetails.siteName}
            </h3>
          </Link>
          <p className="mt-3.5 text-foreground-accent">
            {footerDetails.subheading}
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-lg font-semibold">Quick Links</h4>
          <ul className="text-foreground-accent">
            {footerDetails.quickLinks.map((link) => (
              <li key={link.text} className="mb-2">
                <Link href={link.url} className="hover:text-foreground">
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-lg font-semibold">Contact Us</h4>

          {footerDetails.email && (
            <a
              href={`mailto:${footerDetails.email}`}
              className="block text-foreground-accent hover:text-foreground"
            >
              Email: {footerDetails.email}
            </a>
          )}

          {footerDetails.telephone && (
            <a
              href={`tel:${footerDetails.telephone}`}
              className="block text-foreground-accent hover:text-foreground"
            >
              Phone: {footerDetails.telephone}
            </a>
          )}

          {footerDetails.socials && (
            <div className="mt-5 flex flex-wrap items-center gap-5">
              {Object.keys(footerDetails.socials).map((platformName) => {
                if (platformName && footerDetails.socials[platformName]) {
                  return (
                    <Link
                      href={footerDetails.socials[platformName]}
                      key={platformName}
                      aria-label={platformName}
                    >
                      {getPlatformIconByName(platformName)}
                    </Link>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
      {/* <div className="px-6 mt-8 md:text-center text-foreground-accent">
                <p>Copyright &copy; {new Date().getFullYear()} {siteDetails.siteName}. All rights reserved.</p>
                <p className="mt-2 text-sm text-gray-500">Made with &hearts; by <a href="https://nexilaunch.com" target="_blank">Nexi Launch</a></p>
                <p className="mt-2 text-sm text-gray-500">UI kit by <a href="https://ui8.net/youthmind/products/fintech-finance-mobile-app-ui-kit" target="_blank">Youthmind</a></p>
            </div> */}
    </footer>
  );
};

export default Footer;
