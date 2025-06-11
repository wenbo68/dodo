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
        "mx-auto w-full max-w-sm rounded-xl border border-gray-200 bg-white lg:max-w-full",
        { "shadow-lg": highlight },
      )}
    >
      <div className="rounded-t-xl border-b border-gray-200 p-6">
        <h3 className="mb-4 text-2xl font-semibold">{name}</h3>
        <p className="mb-6 text-3xl font-bold md:text-5xl">
          <span className={clsx({ "text-secondary": highlight })}>
            {typeof price === "number" ? `$${price}` : price}
          </span>
          {typeof price === "number" && (
            <span className="text-lg font-normal text-gray-600">/mo</span>
          )}
        </p>
        <button
          className={clsx("w-full rounded-full px-4 py-3 transition-colors", {
            "bg-primary hover:bg-primary-accent": highlight,
            "bg-hero-background hover:bg-gray-200": !highlight,
          })}
        >
          Get Started
        </button>
      </div>
      <div className="mt-1 p-6">
        <p className="mb-0 font-bold">FEATURES</p>
        <p className="mb-5 text-foreground-accent">
          Everything in basic, plus...
        </p>
        <ul className="mb-8 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <BsFillCheckCircleFill className="mr-2 h-5 w-5 text-secondary" />
              <span className="text-foreground-accent">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PricingColumn;
