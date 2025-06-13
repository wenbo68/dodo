import { IMenuItem, ISocials } from "@/types";

export const footerDetails: {
  subheading: string;
  quickLinks: IMenuItem[];
  email: string;
  telephone: string;
  socials: ISocials;
} = {
  subheading: "Make To-do Great Again",
  quickLinks: [
    {
      text: "Features",
      url: "#features",
    },
    {
      text: "Pricing",
      url: "#pricing",
    },
    {
      text: "FAQ",
      url: "#faq",
    },
  ],
  email: "laboratorymember008@gmail.com",
  telephone: "+82 10-3472-1526",
  socials: {
    github: "https://github.com/wenbo68/dodo",
    // x: 'https://twitter.com/x',
    // twitter: "https://twitter.com/Twitter",
    // facebook: "https://facebook.com",
    // youtube: 'https://youtube.com',
    // linkedin: "https://www.linkedin.com",
    // threads: 'https://www.threads.net',
    // instagram: "https://www.instagram.com",
  },
};
