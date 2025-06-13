import {
  FiBarChart2,
  FiBriefcase,
  FiDollarSign,
  FiLock,
  FiPieChart,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";

import { IBenefit } from "@/types";

export const benefits: IBenefit[] = [
  {
    title: "Drag Anything, Drop Anywhere",
    description:
      "Drop items on different lists. Drop lists on different areas.",
    bullets: [
      //   {
      //     title: "Intelligent Categorization",
      //     description:
      //       "Automatically sorts your transactions for crystal-clear insights.",
      //     icon: <FiBarChart2 size={26} />,
      //   },
    ],
    videoSrc: "/videos/dnd-video.webm",
  },
  {
    title: "Edit Mode",
    description:
      "Click the edit button to pin a list to the sidebar. Editing & referencing made easy.",
    bullets: [
      //   {
      //     title: "Micro-Investing",
      //     description: "Begin with as little as $1 and watch your money grow.",
      //     icon: <FiDollarSign size={26} />,
      //   },
    ],
    videoSrc: "/videos/edit-mode-video.webm",
  },
];
