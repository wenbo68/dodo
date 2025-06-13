import { ctaDetails } from "@/data/cta";

import AppStoreButton from "./AppStoreButton";
import PlayStoreButton from "./PlayStoreButton";
import Link from "next/link";

const CTA: React.FC = () => {
  return (
    <section id="cta" className="mb-5 mt-0 lg:my-0">
      <div className="relative z-10 mx-auto h-full w-full py-12 sm:py-20">
        <div className="h-full w-full">
          <div className="flex h-full flex-col items-center justify-center px-5 text-center text-neutral-800 dark:text-white">
            <h2 className="mb-4 max-w-2xl text-2xl font-semibold sm:text-3xl md:text-5xl md:leading-tight">
              {ctaDetails.heading}
            </h2>

            <p className="mx-auto max-w-xl md:px-5">{ctaDetails.subheading}</p>

            {/* <div className="mt-4 flex flex-col items-center sm:flex-row sm:gap-4">
              <AppStoreButton />
              <PlayStoreButton />
            </div> */}
            <Link
              href={{
                pathname: "/api/auth/signin",
                query: { callbackUrl: "/dashboard" },
              }}
              className="mt-4 rounded-full bg-primary px-8 py-2 text-background transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
