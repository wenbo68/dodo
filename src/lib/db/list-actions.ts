"use server";

import { db } from "~/server/db";
import { items, lists } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { and, eq, gt, gte, lt, lte, ne, sql } from "drizzle-orm";
import { ListWithItemsView } from "~/types";
import { userMutex } from "../utils/user-mutex";

export async function deleteList(listId: number) {
  try {
    await db.transaction(async (tx) => {
      // Delete all items associated with the list
      await tx.delete(items).where(eq(items.listId, listId));
      // Delete the list itself
      await tx.delete(lists).where(eq(lists.id, listId));
    });
  } catch (error) {
    throw new Error("deleteList() failed: " + String(error));
  }
  // revalidatePath("/dashboard");
}

export async function updateListTitle(listId: number, newTitle: string) {
  try {
    await db.update(lists).set({ title: newTitle }).where(eq(lists.id, listId));
  } catch (error) {
    throw new Error("updateListTitle() failed: " + String(error));
  }
}

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
      await tx
        .update(lists)
        .set({ position: sql`${lists.position} + 1` })
        .where(eq(lists.userId, userId));

      //add new list at position 0
      const [list] = await tx
        .insert(lists)
        .values({
          userId,
          title,
          position: 0,
        })
        .returning();

      if (!list) {
        throw new Error("Could not add list to db");
      }

      //add items to new list
      const listItems =
        userItems.length === 0
          ? []
          : await tx
              .insert(items)
              .values(
                userItems.map((item, index) => ({
                  listId: list.id,
                  description: item.description,
                  position: index,
                })),
              )
              .returning();

      return {
        id: list.id,
        title: list.title,
        items: listItems.map((item) => ({
          id: item.id,
          isComplete: item.isComplete,
          description: item.description,
          position: item.position,
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
  userId,
  oldPosition,
  newPosition,
}: {
  userId: string;
  oldPosition: number;
  newPosition: number;
}) {
  const [targetList] = await Promise.all([
    db.query.lists.findFirst({
      where: and(eq(lists.userId, userId), eq(lists.position, oldPosition)),
    }),
  ]);

  if (!targetList)
    throw new Error(
      "updateListPosition() failed: could not find target list in db",
    );

  try {
    await db.transaction(async (tx) => {
      // Update target list's position to the new position
      await tx
        .update(lists)
        .set({ position: newPosition })
        .where(and(eq(lists.position, oldPosition), eq(lists.userId, userId)));

      if (oldPosition > newPosition) {
        // Moving up: increment positions between newList.position and original position - 1
        await tx
          .update(lists)
          .set({ position: sql`${lists.position} + 1` })
          .where(
            and(
              eq(lists.userId, userId),
              ne(lists.id, targetList.id),
              gte(lists.position, newPosition),
              lt(lists.position, oldPosition),
            ),
          );
      } else {
        // Moving down: decrement positions between original position + 1 and overList.position
        await tx
          .update(lists)
          .set({ position: sql`${lists.position} - 1` })
          .where(
            and(
              eq(lists.userId, userId),
              ne(lists.id, targetList.id),
              gt(lists.position, oldPosition),
              lte(lists.position, newPosition),
            ),
          );
      }
    });
  } catch (error) {
    throw new Error(
      "updateListPosition() failed: could not update list positions in db",
    );
  }
  // revalidatePath("/dashboard");
}
