"use client";
import Image from "next/image";
import clsx from "clsx";
import { motion, Variants } from "framer-motion";

import BenefitBullet from "./BenefitBullet";
import SectionTitle from "../landing/SectionTitle";
import type { IBenefit } from "@/types";

interface Props {
  benefit: IBenefit;
  imageAtRight?: boolean;
}

const containerVariants: Variants = {
  offscreen: {
    opacity: 0,
    y: 100,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.2,
      duration: 0.9,
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

export const childVariants = {
  offscreen: {
    opacity: 0,
    x: -50,
  },
  onscreen: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      bounce: 0.2,
      duration: 1,
    },
  },
};

const BenefitSection: React.FC<Props> = ({ benefit, imageAtRight }: Props) => {
  const { title, description, imageSrc, videoSrc, bullets } = benefit;

  // Define default dimensions for both image and video
  const defaultWidth = 1468;
  const defaultHeight = 850;

  return (
    <section className="benefit-section">
      <motion.div
        className="mb-24 flex flex-col flex-wrap items-center justify-center gap-2 lg:flex-row lg:flex-nowrap lg:gap-20"
        variants={containerVariants}
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true }}
      >
        <div
          className={clsx("flex w-full max-w-lg flex-wrap items-center", {
            "justify-start": imageAtRight,
            "justify-end lg:order-1": !imageAtRight,
          })}
        >
          <div className="w-full text-center lg:text-left">
            <motion.div
              className="flex w-full flex-col"
              variants={childVariants}
            >
              <SectionTitle>
                <h3 className="lg:max-w-2xl">{title}</h3>
              </SectionTitle>

              <p className="mx-auto mt-1.5 leading-normal text-foreground-accent lg:ml-0">
                {description}
              </p>
            </motion.div>

            <div className="mx-auto w-full lg:ml-0">
              {bullets.map((item, index) => (
                <BenefitBullet
                  key={index}
                  title={item.title}
                  icon={item.icon}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={clsx("mt-5 lg:mt-0", { "lg:order-2": imageAtRight })}>
          <div
            className={clsx("flex w-fit", {
              "justify-start": imageAtRight,
              "justify-end": !imageAtRight,
            })}
          >
            {/* Conditional Rendering: Render video if videoSrc exists, otherwise render Image */}
            {videoSrc ? (
              <div className="rounded-lg bg-white p-1">
                <video
                  width={defaultWidth} // Use explicit width/height for video
                  height={defaultHeight} // Helps prevent layout shift for video
                  autoPlay // Autoplay the video
                  loop // Loop the video continuously
                  muted // Mute the video (essential for autoplay in most browsers)
                  playsInline // Important for mobile devices to play inline
                  className="rounded-2xl shadow-lg lg:ml-0" // Add styling as needed
                >
                  <source src={videoSrc} type="video/webm" />
                  {/* Fallback for browsers that don't support WebM */}
                  {/* You might want to provide an MP4 version here as well for broader compatibility */}
                  {/* <source src={videoSrc.replace('.webm', '.mp4')} type="video/mp4" /> */}
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : imageSrc ? (
              <Image
                src={imageSrc}
                alt={title} /* Use the title for alt text for better context */
                width={defaultWidth} // Use explicit width/height for Image
                height={defaultHeight} // Helps prevent layout shift for Image
                quality={100}
                className="rounded-2xl shadow-lg lg:ml-0" // Add styling as needed
              />
            ) : (
              // Fallback if neither image nor video is provided
              <div className="flex h-[762px] w-[384px] items-center justify-center rounded-lg bg-gray-200 text-gray-500">
                No Media
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default BenefitSection;
