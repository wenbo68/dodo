import { InferSelectModel } from "drizzle-orm";
import { items, lists } from "./server/db/schema";
import { z } from "zod";



export type List = InferSelectModel<typeof lists>;
export type Item = InferSelectModel<typeof items>;
export type ListWithItems = List & {items: Item[]};

export const listFormSchema = z.object({
  title: z.string(),
  items: z.array(z.object({
    description: z.string()
  }))
})

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
}