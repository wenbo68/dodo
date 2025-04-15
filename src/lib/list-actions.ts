'use server'

import { db } from "~/server/db";
import { items, lists } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { ListWithItemsView } from "~/types";

export async function addListWithItems({
  userId,
  title,
  items: userItems,
}: {
  userId: string;
  title: string;
  items: Array<{ description: string }>;
}): Promise<ListWithItemsView> {
  try {
    return await db.transaction(async (tx) => {
      // Shift all existing lists down by 1
      await tx.update(lists)
        .set({ position: sql`${lists.position} + 1` })
        .where(eq(lists.userId, userId));

      //add new list at position 0
      const [list] = await tx.insert(lists).values({
        userId,
        title,
        position: 0
      }).returning();

      if (!list) {
        throw new Error("Could not add list to db");
      }

      //add items to new list
      const listItems = await tx.insert(items).values(
        userItems.map((item, index) => ({
          listId: list.id,
          description: item.description,
          position: index
        }))
      ).returning();

      return {
        id: list.id,
        title: list.title,
        items: listItems.map((item, index) => ({
          id: item.id,
          isComplete: item.isComplete,
          description: item.description,
        })),
      };

    });
  } catch (error) {
    throw new Error(`addListWithItems() failed: ${error}`);
  }
  // revalidatePath("/dashboard");
}