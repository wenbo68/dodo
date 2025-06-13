import React from "react";
import Image from "next/image";

import AppStoreButton from "./AppStoreButton";
import PlayStoreButton from "./PlayStoreButton";

import { heroDetails } from "@/data/hero";

const Hero: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center bg-white px-5 pb-0 pt-32 dark:bg-neutral-800 md:pt-40"
    >
      <div className="text-center">
        <h1 className="mx-auto max-w-lg text-4xl font-bold text-neutral-800 dark:text-neutral-100 md:max-w-2xl md:text-6xl md:leading-tight">
          {heroDetails.heading}
        </h1>
        <p className="mx-auto mt-10 max-w-lg text-neutral-800 dark:text-neutral-100">
          {heroDetails.subheading}
        </p>
        {/* <div className="mt-10 bg-white px-1 pt-1"> */}
        <Image
          src={heroDetails.centerImageSrc}
          width={718 / 2}
          height={912 / 2}
          quality={100}
          sizes=""
          priority={true}
          unoptimized={true}
          alt="app mockup"
          className="z-10 mx-auto mt-12 rounded-t-2xl"
        />
        {/* </div> */}
      </div>
    </section>
  );
};

export default Hero;
