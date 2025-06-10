"use server";

import {
  asc,
  eq,
  sql,
  and,
  not,
  is,
  isNull,
  isNotNull,
  desc,
} from "drizzle-orm";
import { db } from "../../server/db";
import { items, lists } from "../../server/db/schema";

export async function getNextPosition(userId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(lists)
    .where(eq(lists.userId, userId));

  return result[0]?.count ?? 0;
}

export async function getListWithItems(listId: string) {
  return await db.query.lists.findFirst({
    where: eq(lists.id, listId),
    with: {
      items: {
        orderBy: [asc(items.position)],
      },
    },
  });
}

export async function getAllListsWithItems(userId: string) {
  return await db.query.lists.findMany({
    where: and(eq(lists.userId, userId), isNull(lists.deletedAt)),
    with: {
      items: {
        orderBy: [asc(items.position)],
      },
    },
    orderBy: [asc(lists.position)],
  });
}

export async function getListsWithItems(userId: string, isPinned: boolean) {
  return await db.query.lists.findMany({
    where: and(
      eq(lists.userId, userId),
      eq(lists.isPinned, isPinned),
      isNull(lists.deletedAt),
    ),
    with: {
      items: {
        orderBy: [asc(items.position)],
      },
    },
    orderBy: [asc(lists.position)],
  });
}

export async function getDeletedListsWithItems(userId: string) {
  return await db.query.lists.findMany({
    where: and(eq(lists.userId, userId), isNotNull(lists.deletedAt)), // Only trashed lists
    with: {
      items: {
        orderBy: [asc(items.position)], // Items within a trashed list still ordered
      },
    },
    orderBy: [desc(lists.deletedAt)], // Order by when they were deleted, newest first in trash
  });
}

// export async function getPinnedListsWithItems(userId: string) {
//   return await db.query.lists.findMany({
//     where: and(eq(lists.userId, userId), eq(lists.isPinned, true)),
//     with: {
//       items: {
//         orderBy: [asc(items.position)],
//       },
//     },
//     orderBy: [asc(lists.position)],
//   });
// }
