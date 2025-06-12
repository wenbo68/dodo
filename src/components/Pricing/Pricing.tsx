import PricingColumn from "./PricingColumn";

import { tiers } from "@/data/pricing";

const Pricing: React.FC = () => {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-${tiers.length} gap-8 pb-10 lg:pt-10`}
    >
      {tiers.map((tier, index) => (
        <PricingColumn key={tier.name} tier={tier} highlight={true} />
      ))}
    </div>
  );
};

export default Pricing;
