import { IFAQ } from "@/types";
import { siteDetails } from "./siteDetails";

export const faqs: IFAQ[] = [
  {
    question: `Can I sign up/in with username & password?`,
    answer:
      "Unfortunately not. Currently, we do not support authentication via credentials (tranditional username/password) for security reasons. You must have a Google or GitHub account to sign in.",
  },
  {
    question: `Who should I reach out to for technical support?`,
    answer:
      "Absolutely! Please reach out to laboratorymember008@gmail.com for any inqueries/requests.",
  },
  {
    question: "How many to-do lists/items can I add?",
    answer: `Infinite!`,
  },
  {
    question: "How long do deleted lists stay in the trash?",
    answer: "Each deleted list stays in the trash for 7 days.",
  },
];
