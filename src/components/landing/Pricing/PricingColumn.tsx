import clsx from "clsx";
import { BsFillCheckCircleFill } from "react-icons/bs";

import type { IPricing } from "@/types";

interface Props {
  tier: IPricing;
  highlight?: boolean;
}

const PricingColumn: React.FC<Props> = ({ tier, highlight }: Props) => {
  const { name, price, features } = tier;

  return (
    <div
      className={clsx(
        "mx-auto w-full max-w-sm rounded-xl border border-neutral-200 bg-white dark:border-neutral-400 dark:bg-neutral-800",
        { "shadow-lg": highlight },
      )}
    >
      <div className="rounded-t-xl border-b border-neutral-200 p-6">
        <h3 className="mb-4 text-2xl font-semibold">{name}</h3>
        <p className="mb-6 text-3xl font-bold md:text-5xl">
          <span
            className={clsx({
              "text-neutral-800 dark:text-neutral-100": highlight,
            })}
          >
            {typeof price === "number" ? `$${price}` : price}
          </span>
          {typeof price === "number" && (
            <span className="text-lg font-normal text-neutral-600 dark:text-neutral-300">
              /mo
            </span>
          )}
        </p>
        <button
          className={clsx("w-full rounded-full px-4 py-3 transition-colors", {
            "bg-blue-500 text-neutral-100 hover:bg-blue-400": highlight,
            "bg-hero-background hover:bg-neutral-200": !highlight,
          })}
        >
          Get Started
        </button>
      </div>
      <div className="flex flex-col gap-5 p-6">
        <p className="font-bold">FEATURES</p>
        {/* <p className="mb-5 text-foreground-accent">
          Everything in basic, plus...
        </p> */}
        <ul className="mb-0 flex flex-col gap-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <BsFillCheckCircleFill className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
              <span className="text-neutral-800 dark:text-neutral-100">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PricingColumn;
