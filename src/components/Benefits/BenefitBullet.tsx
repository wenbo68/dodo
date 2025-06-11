import { motion } from "framer-motion";

import type { IBenefitBullet } from "@/types";
import { childVariants } from "./BenefitSection";

const BenefitBullet: React.FC<IBenefitBullet> = ({
  title,
  description,
  icon,
}: IBenefitBullet) => {
  return (
    <motion.div
      className="mt-8 flex flex-col items-center gap-3 lg:flex-row lg:items-start lg:gap-5"
      variants={childVariants}
    >
      <div className="mx-auto mt-3 flex w-fit flex-shrink-0 justify-center lg:mx-0">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-semibold">{title}</h4>
        <p className="text-base text-foreground-accent">{description}</p>
      </div>
    </motion.div>
  );
};

export default BenefitBullet;
