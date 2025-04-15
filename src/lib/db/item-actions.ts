'use server'
import { and, eq, ne, gte, lt, gt, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { items, lists } from "~/server/db/schema";
import { userMutex } from "../utils/user-mutex";
import { itemMutex } from "../utils/item-mutex";


export async function updateItemIsComplete(
  userId: string,
  itemId: number, 
  newIsComplete: boolean
){
  //use user mutex to make sure that the user cannot addList and updateItem at the same time
  //(adding list creates a string as temp id but the real id is number)
  //(therefore, needs to wait until addList finishes and returns the real id)
  const userRelease = await userMutex.acquire(userId);
  const itemRelease = await itemMutex.acquire(itemId); // Acquire the item lock

  try{
    await db.update(items)
      .set({ isComplete: newIsComplete })
      .where(eq(items.id, itemId));
  }catch(error){
    throw new Error("updateItemIsComplete() failed: " + String(error));
  }finally {
    itemRelease();
    userRelease();
  }
  // revalidatePath("/dashboard")
}

export async function updateItemPosition({
  listId,
  oldPosition,
  newPosition
}: {
  listId: number
  oldPosition: number
  newPosition: number
}) {
  const [oldItem, newItem] = await Promise.all([
    db.query.items.findFirst({
      where: and(
        eq(items.position, oldPosition), 
        eq(items.listId, listId)
      )
    }),
    db.query.items.findFirst({
      where: and(
        eq(items.position, newPosition),
        eq(items.listId, listId)
      )
    })
  ])
  if (!oldItem || !newItem) throw new Error('Could not find items in db')
  
  try{
    await db.transaction(async (tx) => {
    // Update active item's position to the target position
    await tx.update(items)
      .set({ position: newPosition })
      .where(and(
        eq(items.listId, listId),
        eq(items.position, oldPosition)
      ));

    if (oldPosition > newPosition) {
      // Moving up: increment positions between overItem.position and original position - 1
      await tx.update(items)
        .set({ position: sql`${items.position} + 1` })
        .where(and(
          eq(items.listId, listId),
          ne(items.id, oldItem.id),
          gte(items.position, newItem.position),
          lt(items.position, oldItem.position)
        ));
    } else {
      // Moving down: decrement positions between original position + 1 and overItem.position
      await tx.update(items)
        .set({ position: sql`${items.position} - 1` })
        .where(and(
          eq(items.listId, listId),
          ne(items.id, oldItem.id),
          gt(items.position, oldItem.position),
          lte(items.position, newItem.position)
        ));
      }
    })
  }catch(error){
    throw new Error('Could not update item positions in db')
  }
}
