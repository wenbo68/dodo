"use server";

import { db } from "~/server/db";
import { items, lists } from "~/server/db/schema";
import { and, eq, gt, gte, lt, lte, ne, sql } from "drizzle-orm";
import { ListWithItems } from "@/types";
import { addItem, updateItem } from "./item-actions";

export async function pinList(listId: string, newIsPinned: boolean) {
  const [targetList] = await Promise.all([
    db.query.lists.findFirst({
      where: eq(lists.id, listId),
    }),
  ]);
  if (!targetList)
    throw new Error("pinList() failed: could not find target list in db");
  try {
    await db.transaction(async (tx) => {
      // Shift lists below target list up by 1
      await tx
        .update(lists)
        .set({ position: sql`${lists.position} - 1` })
        .where(
          and(
            eq(lists.userId, targetList.userId),
            eq(lists.isPinned, !newIsPinned),
            gt(lists.position, targetList.position),
          ),
        );
      // Shift all lists in dest grid down by 1
      await tx
        .update(lists)
        .set({ position: sql`${lists.position} + 1` })
        .where(
          and(
            eq(lists.userId, targetList.userId),
            eq(lists.isPinned, newIsPinned),
          ),
        );
      // Update the list to be pinned
      await tx
        .update(lists)
        .set({ isPinned: newIsPinned, position: 0 })
        .where(eq(lists.id, listId));
    });
  } catch (error) {
    throw new Error("pinList() failed: " + String(error));
  }
}

export async function deleteList(listId: string) {
  //find target list to be deleted
  const [targetList] = await Promise.all([
    db.query.lists.findFirst({
      where: eq(lists.id, listId),
    }),
  ]);
  if (!targetList)
    throw new Error(
      "updateItemPosition() failed: could not find target item in db",
    );
  try {
    await db.transaction(async (tx) => {
      // Delete all items associated with the list
      await tx.delete(items).where(eq(items.listId, listId));
      // Delete the list itself
      await tx.delete(lists).where(eq(lists.id, listId));

      // Update positions of lists below the deleted list
      await tx
        .update(lists)
        .set({ position: sql`${lists.position} - 1` })
        .where(
          and(
            eq(lists.userId, targetList.userId),
            gt(lists.position, targetList.position),
            eq(lists.isPinned, targetList.isPinned),
          ),
        );
    });
  } catch (error) {
    throw new Error("deleteList() failed: " + String(error));
  }
}

export async function updateListTitle(listId: string, newTitle: string) {
  try {
    await db.update(lists).set({ title: newTitle }).where(eq(lists.id, listId));
  } catch (error) {
    throw new Error("updateListTitle() failed: " + String(error));
  }
}

export async function updateListWithItems(listProp: ListWithItems) {
  //find target list in db
  const [targetList] = await Promise.all([
    db.query.lists.findFirst({
      where: eq(lists.id, listProp.id),
    }),
  ]);
  if (!targetList)
    throw new Error(
      "updateListWithItems() failed: could not find target list in db",
    );

  try {
    if (listProp.title !== targetList.title) {
      updateListTitle(listProp.id, listProp.title);
    }
    if (
      listProp.position !== targetList.position ||
      listProp.isPinned !== targetList.isPinned
    ) {
      updateListPositionAndIsPinned(
        listProp.userId,
        targetList.isPinned,
        listProp.isPinned,
        targetList.position,
        listProp.position,
      );
    }
    listProp.items.forEach((item) => {
      updateItem(item);
    });
  } catch (error) {
    throw new Error("updateListWithItems() failed: " + String(error));
  }
}

export async function addListWithItems(
  // userId: string,
  listProp: ListWithItems,
): Promise<string> {
  try {
    return await db.transaction(async (tx) => {
      // Shift all pinned or regular lists down by 1
      await tx
        .update(lists)
        .set({ position: sql`${lists.position} + 1` })
        .where(
          and(
            eq(lists.userId, listProp.userId),
            eq(lists.isPinned, listProp.isPinned),
          ),
        );

      //add new list at given position
      const [newList] = await tx
        .insert(lists)
        .values({
          id: listProp.id,
          userId: listProp.userId,
          title: listProp.title,
          position: listProp.position,
          isPinned: listProp.isPinned,
        })
        .returning(); // This returns the inserted row, including its ID

      if (!newList) {
        throw new Error("Could not add list to db");
      }

      //add given items to new list
      if (listProp.items.length > 0) {
        // await tx.insert(items).values(
        //   itemsProp.map((item, index) => ({
        //     listId: newList.id,
        //     description: item.description,
        //     position: index,
        //   })),
        // );
        listProp.items.forEach((item) => addItem(item));
      }

      return newList.id;
    });
  } catch (error) {
    throw new Error(`addListWithItems() failed: ${String(error)}`);
  }
}

export async function updateListPositionAndIsPinned(
  userId: string,
  isPinnedStart: boolean,
  isPinnedEnd: boolean,
  oldPosition: number,
  newPosition: number,
) {
  // find target list to be updated
  const [targetList] = await Promise.all([
    db.query.lists.findFirst({
      where: and(
        eq(lists.userId, userId),
        eq(lists.position, oldPosition),
        eq(lists.isPinned, isPinnedStart),
      ),
    }),
  ]);

  if (!targetList)
    throw new Error(
      "updateListPosition() failed: could not find target list in db",
    );

  try {
    await db.transaction(async (tx) => {
      // update target list's isPinned status and position
      await tx
        .update(lists)
        .set({ isPinned: isPinnedEnd, position: newPosition })
        .where(eq(lists.id, targetList.id));

      // Moved target list within the same grid (pinned -> pinned or regular -> regular)
      if (isPinnedStart === isPinnedEnd) {
        if (newPosition < oldPosition) {
          // Moving others down: increment positions between newPosition (inclusive) and oldPosition
          await tx
            .update(lists)
            .set({ position: sql`${lists.position} + 1` })
            .where(
              and(
                eq(lists.userId, userId),
                ne(lists.id, targetList.id),
                eq(lists.isPinned, isPinnedStart),
                gte(lists.position, newPosition),
                lt(lists.position, oldPosition),
              ),
            );
        } else if (oldPosition < newPosition) {
          // Moving others up: decrement positions between oldPosition and newPosition (inclusive)
          await tx
            .update(lists)
            .set({ position: sql`${lists.position} - 1` })
            .where(
              and(
                eq(lists.userId, userId),
                ne(lists.id, targetList.id),
                eq(lists.isPinned, isPinnedStart),
                gt(lists.position, oldPosition),
                lte(lists.position, newPosition),
              ),
            );
        }
        // Moved target list to a different grid (pinned -> regular or regular -> pinned)
      } else {
        // Moving up: in src grid, move lists below oldPosition up to fill the gap left by target list.
        await tx
          .update(lists)
          .set({ position: sql`${lists.position} - 1` })
          .where(
            and(
              eq(lists.userId, userId),
              ne(lists.id, targetList.id),
              eq(lists.isPinned, isPinnedStart),
              gt(lists.position, oldPosition),
            ),
          );
        // Moving down: in dest grid, move lists below newPosition (inclusive) down to create a gap for target list.
        await tx
          .update(lists)
          .set({ position: sql`${lists.position} + 1` })
          .where(
            and(
              eq(lists.userId, userId),
              ne(lists.id, targetList.id),
              eq(lists.isPinned, isPinnedEnd),
              gte(lists.position, newPosition),
            ),
          );
      }
    });
  } catch (error) {
    throw new Error(
      "updateListPosition() failed: could not update list positions in db",
    );
  }
}
