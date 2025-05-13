"use server";
import { and, eq, ne, gte, lt, gt, lte, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { items } from "~/server/db/schema";
import { userMutex } from "../utils/user-mutex";
import { itemMutex } from "../utils/item-mutex";

export async function addItem(
  userId: string,
  listId: number,
  description: string,
  isComplete: boolean,
  position: number,
): Promise<number> {
  let newItem;
  try {
    newItem = await db
      .insert(items)
      .values({
        listId,
        description: description,
        isComplete: isComplete,
        position: position,
      })
      .returning({ id: items.id });
  } catch (error) {
    throw new Error("addItem() failed: " + String(error));
  } finally {
    if (newItem) {
      return newItem![0].id;
    }
    throw new Error("addItem() failed: could not get new item id");
  }
}

export async function deleteItem(itemId: number) {
  //find target item to be deleted
  const [targetItem] = await Promise.all([
    db.query.items.findFirst({
      where: eq(items.id, itemId),
    }),
  ]);
  if (!targetItem)
    throw new Error(
      "updateItemPosition() failed: could not find target item in db",
    );

  try {
    await db.transaction(async (tx) => {
      // Delete the item
      await tx.delete(items).where(eq(items.id, itemId));

      // Update positions of items below the deleted item
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
  itemId: number,
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
  userId: string,
  itemId: number,
  newIsComplete: boolean,
) {
  //use user mutex to make sure that the user will not addList and updateItem at the same time
  //adding list creates a string as temp id but the real id must be a number
  //therefore, needs to wait until addList finishes and returns the real id
  const userRelease = await userMutex.acquire(userId);

  //is this needed? the item checkbox is disabled while updating now...
  const itemRelease = await itemMutex.acquire(itemId);

  console.log(newIsComplete);
  console.log(itemId);
  console.log(userId);

  try {
    await db
      .update(items)
      .set({ isComplete: newIsComplete })
      .where(eq(items.id, itemId));
  } catch (error) {
    throw new Error("updateItemIsComplete() failed: " + String(error));
  } finally {
    itemRelease();
    userRelease();
  }
  // revalidatePath("/dashboard")
}

export async function updateItemPosition({
  listId,
  oldPosition,
  newPosition,
}: {
  listId: number;
  oldPosition: number;
  newPosition: number;
}) {
  const [targetItem] = await Promise.all([
    db.query.items.findFirst({
      where: and(eq(items.position, oldPosition), eq(items.listId, listId)),
    }),
  ]);
  if (!targetItem)
    throw new Error(
      "updateItemPosition() failed: could not find target item in db",
    );

  try {
    await db.transaction(async (tx) => {
      // Update active item's position to the target position
      await tx
        .update(items)
        .set({ position: newPosition })
        .where(and(eq(items.listId, listId), eq(items.position, oldPosition)));

      if (oldPosition > newPosition) {
        // Moving up: increment positions between overItem.position and original position - 1
        await tx
          .update(items)
          .set({ position: sql`${items.position} + 1` })
          .where(
            and(
              eq(items.listId, listId),
              ne(items.id, targetItem.id),
              gte(items.position, newPosition),
              lt(items.position, targetItem.position),
            ),
          );
      } else {
        // Moving down: decrement positions between original position + 1 and overItem.position
        await tx
          .update(items)
          .set({ position: sql`${items.position} - 1` })
          .where(
            and(
              eq(items.listId, listId),
              ne(items.id, targetItem.id),
              gt(items.position, targetItem.position),
              lte(items.position, newPosition),
            ),
          );
      }
    });
  } catch (error) {
    throw new Error("Could not update item positions in db");
  }
}
