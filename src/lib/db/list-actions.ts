'use server'

import { db } from "~/server/db";
import { items, lists } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { and, eq, gt, gte, lt, lte, ne, sql } from "drizzle-orm";
import { ListWithItemsView } from "~/types";
import { userMutex } from "../utils/user-mutex";

export async function addListWithItems({
  userId,
  title,
  items: userItems,
}: {
  userId: string;
  title: string;
  items: Array<{ description: string }>;
}): Promise<ListWithItemsView> {
  const release = await userMutex.acquire(userId);
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

      console.log("list: ", list);
      console.log("items empty? ", userItems.length===0);
      //add items to new list
      const listItems = userItems.length===0? []: await tx.insert(items).values(
        userItems.map((item, index) => ({
          listId: list.id,
          description: item.description,
          position: index
        }))
      ).returning();

      return {
        id: list.id,
        title: list.title,
        items: listItems.map((item) => ({
          id: item.id,
          isComplete: item.isComplete,
          description: item.description,
        })),
      };

    });
  } catch (error) {
    console.error("addListWithItems() failed:", error);
    throw new Error(`addListWithItems() failed: ${String(error)}`);
  } finally {
    release();
  }
  // revalidatePath("/dashboard");
}

export async function updateListPosition({
  oldPosition,
  newPosition
}: {
  oldPosition: number
  newPosition: number
}) {
  const [oldList, newList] = await Promise.all([
    db.query.lists.findFirst({
      where: eq(lists.position, oldPosition)
    }),
    db.query.lists.findFirst({
      where: eq(lists.position, newPosition)
    })
  ])

  if (!oldList || !newList) throw new Error('Cannot find lists in db')
  
  try{
    await db.transaction(async (tx) => {
      // Update active list's position to the target position
      await tx.update(lists)
        .set({ position: newPosition })
        .where(eq(lists.position, oldPosition));

      if (oldPosition > newPosition) {
        // Moving up: increment positions between newList.position and original position - 1
        await tx.update(lists)
          .set({ position: sql`${lists.position} + 1` })
          .where(and(
            ne(lists.id, oldList.id),
            gte(lists.position, newPosition),
            lt(lists.position, oldPosition)
          ));
      } else {
        // Moving down: decrement positions between original position + 1 and overList.position
        await tx.update(lists)
          .set({ position: sql`${lists.position} - 1` })
          .where(and(
            ne(lists.id, oldList.id),
            gt(lists.position, oldPosition),
            lte(lists.position, newPosition)
          ));
      }
    });
  }catch(error){
    throw new Error('Could not update list positions in db')
  }
  // revalidatePath("/dashboard");
}