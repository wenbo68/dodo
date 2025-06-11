"use server";
import { and, eq, ne, gte, lt, gt, lte, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { items } from "~/server/db/schema";
import { Item } from "@/types";

export async function addItem(itemProp: Item) {
  if (itemProp.position < 0)
    throw new Error("addItem() failed: item position cannot be less than 0");
  try {
    await db.insert(items).values({
      id: itemProp.id,
      listId: itemProp.listId,
      description: itemProp.description,
      isComplete: itemProp.isComplete,
      position: itemProp.position,
    });
    // .returning();
    // return newList.id;
  } catch (error) {
    throw new Error("addItem() failed: " + String(error));
  }
}

export async function updateItem(itemProp: Item) {
  //find target item to be updated
  const [targetItem] = await Promise.all([
    db.query.items.findFirst({
      where: eq(items.id, itemProp.id),
    }),
  ]);
  if (!targetItem)
    throw new Error("updateItem() failed: could not find target item in db");

  try {
    if (itemProp.isComplete !== targetItem.isComplete) {
      await updateItemIsComplete(itemProp.id, itemProp.isComplete);
    }
    if (itemProp.description !== targetItem.description) {
      await updateItemDescription(itemProp.id, itemProp.description);
    }
    if (
      itemProp.position !== targetItem.position ||
      itemProp.listId !== targetItem.listId
    ) {
      await updateItemPositionAndListId(
        targetItem.listId,
        itemProp.listId,
        targetItem.position,
        itemProp.position,
      );
    }
  } catch (error) {
    throw new Error("updateItem() failed: " + String(error));
  }
}

export async function deleteItem(itemId: string) {
  //find target item to be deleted
  const [targetItem] = await Promise.all([
    db.query.items.findFirst({
      where: eq(items.id, itemId),
    }),
  ]);
  if (!targetItem)
    throw new Error("deleteItem() failed: could not find target item in db");

  try {
    await db.transaction(async (tx) => {
      // Delete the item
      await tx.delete(items).where(eq(items.id, itemId));

      // Move up: Update positions of items below the deleted item to fill the gap
      await tx
        .update(items)
        .set({ position: sql`${items.position} - 1` })
        .where(
          and(
            eq(items.listId, targetItem.listId),
            gt(items.position, targetItem.position),
          ),
        );
    });
    // await tx.delete(items).where(eq(items.id, itemId));
  } catch (error) {
    throw new Error("deleteItem() failed: " + String(error));
  }
}

export async function updateItemDescription(
  itemId: string,
  newDescription: string,
) {
  try {
    await db
      .update(items)
      .set({ description: newDescription })
      .where(eq(items.id, itemId));
  } catch (error) {
    throw new Error("updateItemDescription() failed: " + String(error));
  }
}

export async function updateItemIsComplete(
  itemId: string,
  newIsComplete: boolean,
) {
  try {
    await db
      .update(items)
      .set({ isComplete: newIsComplete })
      .where(eq(items.id, itemId));
  } catch (error) {
    throw new Error("updateItemIsComplete() failed: " + String(error));
  }
}

export async function updateItemPositionAndListId(
  srcListId: string,
  destListId: string,
  oldPosition: number,
  newPosition: number,
) {
  const [targetItem] = await Promise.all([
    db.query.items.findFirst({
      where: and(eq(items.position, oldPosition), eq(items.listId, srcListId)),
    }),
  ]);
  if (!targetItem)
    throw new Error(
      "updateItemPosition() failed: could not find target item in db",
    );

  try {
    await db.transaction(async (tx) => {
      // reordering within the same list
      if (srcListId === destListId) {
        const listId = srcListId;

        // item moved up
        if (newPosition < oldPosition) {
          // move down items between newPosition (inclusive) and oldPosition
          await tx
            .update(items)
            .set({ position: sql`${items.position} + 1` })
            .where(
              and(
                eq(items.listId, listId),
                gte(items.position, newPosition),
                lt(items.position, oldPosition),
              ),
            );
          // item moved down
        } else if (oldPosition < newPosition) {
          // move up items between oldPosition and newPosition (inclusive)
          await tx
            .update(items)
            .set({ position: sql`${items.position} - 1` })
            .where(
              and(
                eq(items.listId, listId),
                gt(items.position, oldPosition),
                lte(items.position, newPosition),
              ),
            );
        }
        // Update target item's position
        await tx
          .update(items)
          .set({ position: newPosition })
          .where(eq(items.id, targetItem.id));

        // move item to different list
      } else {
        //in src list: shift up items below oldPosition to fill in gap
        await tx
          .update(items)
          .set({ position: sql`${items.position} - 1` })
          .where(
            and(eq(items.listId, srcListId), gt(items.position, oldPosition)),
          );
        //in dest list: shift down items below newPosition (inclusive) to create gap
        await tx
          .update(items)
          .set({ position: sql`${items.position} + 1` })
          .where(
            and(eq(items.listId, destListId), gte(items.position, newPosition)),
          );
        //update the target item's listId and position
        await tx
          .update(items)
          .set({
            listId: destListId,
            position: newPosition,
          })
          .where(eq(items.id, targetItem.id));
      }
    });
  } catch (error) {
    throw new Error("Could not update item positions in db");
  }
}
