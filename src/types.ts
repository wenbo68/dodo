import { InferSelectModel } from "drizzle-orm";
import { items, lists } from "./server/db/schema";
import { z } from "zod";

export type List = InferSelectModel<typeof lists>;
export type Item = InferSelectModel<typeof items>;
export type ListWithItems = List & { items: Item[] };

export const listFormSchema = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      description: z.string(),
    }),
  ),
});

export type ListWithItemsView = {
  id?: number;
  tempId?: string;
  title: string;
  items: ItemView[];
};

export type ItemView = {
  id?: number;
  tempId?: string;
  isComplete: boolean;
  description: string;
  position: number;
};

export interface IMenuItem {
  text: string;
  url: string;
}

export interface IBenefit {
  title: string;
  description: string;
  imageSrc: string;
  bullets: IBenefitBullet[];
}

export interface IBenefitBullet {
  title: string;
  description: string;
  icon: JSX.Element;
}

export interface IPricing {
  name: string;
  price: number | string;
  features: string[];
}

export interface IFAQ {
  question: string;
  answer: string;
}

export interface ITestimonial {
  name: string;
  role: string;
  message: string;
  avatar: string;
}

export interface IStats {
  title: string;
  icon: JSX.Element;
  description: string;
}

export interface ISocials {
  facebook?: string;
  github?: string;
  instagram?: string;
  linkedin?: string;
  threads?: string;
  twitter?: string;
  youtube?: string;
  x?: string;
  [key: string]: string | undefined;
}
