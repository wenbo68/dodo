"use client";

import { useAuth } from "@/components/context/auth-context";
import { Item, ListWithItems } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addItem,
  deleteItem,
  updateItem,
  updateItemDescription,
  updateItemIsComplete,
  updateItemPositionAndListId,
} from "../db/item-actions";

export const useItemMutations = () => {
  // Access client-side states and utilities using other hooks
  const { userId } = useAuth(); // Get the current user's ID from your auth context
  const queryClient = useQueryClient(); // Get the query client instance

  const addItemMutation = useMutation({
    mutationFn: async ({ itemProp }: { itemProp: Item }) => {
      await addItem(itemProp);
    },
    onMutate: async ({ itemProp }: { itemProp: Item }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", userId] }); // Cancel any outgoing fetches for lists
      // Save the original cache data before optimistic update for potential rollback
      const originalLists = queryClient.getQueryData<ListWithItems[]>([
        "lists",
        userId,
      ]);

      //optimistically update the cache
      queryClient.setQueryData(
        ["lists", userId],
        (oldLists: ListWithItems[]) => {
          if (!oldLists) {
            console.error(
              "addItemMutation onMutate failed: oldLists not found in cache",
            );
            return oldLists;
          }
          // find target list
          const targetList = oldLists.find(
            (list) => list.id === itemProp.listId,
          );
          if (!targetList) {
            console.error(
              "addItemMutation onMutate failed: targetList not found in cache",
            );
            return oldLists;
          }
          // add new item to the end of target list
          return oldLists.map((oldList) =>
            oldList.id === itemProp.listId
              ? { ...oldList, items: [...oldList.items, itemProp] }
              : oldList,
          );
        },
      );
      // Return a context object that includes the original lists and the temporary item ID
      return { originalLists };
    },
    onError: (error, prop, context) => {
      // Rollback to the original lists in case of error
      if (context?.originalLists) {
        queryClient.setQueryData(["lists", userId], context.originalLists);
      }
      console.error("AddListMutation onError failed:", error);
    },
    onSettled: () => {
      // invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["lists", userId],
      });
    },
    // onSuccess: (realItemId, prop, context) => {
    //   //if no db write => no onSuccess
    //   if (!realItemId) return;

    //   const { itemProp } = prop; // Destructure listId from prop
    //   const { tempItemId } = context || {}; // Destructure from context

    //   // 1. find the item in the cache
    //   queryClient.setQueryData(
    //     ["lists", userId],
    //     (oldLists: ListWithItems[]) => {
    //       if (!oldLists) {
    //         console.error(
    //           "addItemMutation onSuccess failed: oldLists not found in cache",
    //         );
    //         return oldLists;
    //       }
    //       // Find the target list
    //       const targetList = oldLists.find(
    //         (list) => list.id === itemProp.listId,
    //       );
    //       if (!targetList) {
    //         console.error(
    //           "addItemMutation onSuccess failed: targetList not found in cache",
    //         );
    //         return oldLists;
    //       }

    //       const tempItem = targetList.items.find(
    //         (item) => item.id === tempItemId,
    //       );

    //       // 2. if the item is gone from the cache => delete the item in db
    //       if (!tempItem) {
    //         // If the item is not found in the cache, delete it from the DB
    //         deleteItemMutation.mutate({
    //           listId: targetList.id,
    //           itemId: realItemId,
    //           updateCache: false,
    //         });
    //         return oldLists; // Return oldLists as id cannot be updated
    //       }

    //       // 3. If the item is still there, update the item in cache to have the real ID
    //       return oldLists.map((oldList) =>
    //         oldList.id === itemProp.listId
    //           ? {
    //               ...oldList,
    //               items: oldList.items.map((item) =>
    //                 item.id === tempItemId ? { ...item, id: realItemId } : item,
    //               ),
    //             }
    //           : oldList,
    //       );
    //     },
    //   );

    //   // find target item in cache (now using the real id)
    //   const targetItem = queryClient
    //     .getQueryData<ListWithItems[]>(["lists", userId])
    //     ?.find((list) => list.id === itemProp.listId)
    //     ?.items.find((item) => item.id === realItemId);
    //   if (!targetItem) {
    //     console.error(
    //       "addItemMutation onSuccess failed: targetItem not found in cache",
    //     );
    //     return;
    //   }

    //   //4. then do db write for isComplete, description, position/listId
    //   // but if the item's listId is temp => don't update db
    //   // instead wait for list to update the item in db after listId resolves
    //   if (targetItem.listId.startsWith("temp-")) return;
    //   updateItemMutation.mutate(targetItem);
    // },
  });

  // only for syncing db with cache => only edits db
  const updateItemMutation = useMutation({
    mutationFn: async (itemProp: Item) => {
      await updateItem(itemProp);
    },
    onError: (error, prop, context) => {
      // refetch
      queryClient.invalidateQueries({ queryKey: ["lists", userId] });
      console.error("updateItemMutation onError: ", error);
    },
  });

  // scenarios: (1/2/3 are the same in terms of implementation)
  // 1. delete temp item from temp list: delete in cache (synced when realListId is returned)
  // 2. delete temp item from real list: delete in cache (synced when realItemId is returned)
  // 3. delete real item from temp list: delete in cache (synced when realListId is returned)
  // 4. delete real item from real list: delete in cache and db
  // 5. syncing cache and db a/f return of realListId/realItemId: delete in db
  const deleteItemMutation = useMutation({
    mutationFn: async ({
      listId,
      itemId,
    }: {
      listId: string;
      itemId: string;
    }) => {
      await deleteItem(itemId);
    },
    onMutate: async ({
      listId,
      itemId,
    }: {
      listId: string;
      itemId: string;
    }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", userId] });
      //save the original cache
      const originalLists = queryClient.getQueryData(["lists", userId]);
      // optimistic update
      queryClient.setQueryData(
        ["lists", userId],
        (oldLists: ListWithItems[]) => {
          if (!oldLists) {
            console.error(
              "deleteItemMutation onMutate failed: oldLists not found in cache",
            );
            return oldLists;
          }
          //find target
          const targetList = oldLists.find((list) => list.id === listId);
          if (!targetList) {
            console.error(
              "deleteItemMutation onMutate failed: targetList not found in cache",
            );
            return oldLists;
          }
          const targetItem = targetList.items.find(
            (item) => item.id === itemId,
          );
          if (!targetItem) {
            console.error(
              "deleteItemMutation onMutate failed: targetItem not found in cache",
            );
            return oldLists;
          }
          //remove the item from cache
          //then move items below targetList up by 1
          const newList = {
            ...targetList,
            items: targetList.items
              .filter((item) => item.id !== itemId)
              .map((item) => {
                return {
                  ...item,
                  position:
                    item.position > targetItem.position
                      ? item.position - 1
                      : item.position,
                };
              }),
          };
          // //move items below the deleted item up by 1
          // newList.items.forEach((item) => {
          //   if (item.position > targetItem.position) item.position--;
          // });
          return oldLists.map((oldList) =>
            oldList.id === listId ? newList : oldList,
          );
        },
      );
      return { originalLists };
    },
    onError: (error, prop, context) => {
      // Rollback to the original lists in case of error
      if (context?.originalLists) {
        queryClient.setQueryData(["lists", userId], context.originalLists);
      }
      console.error("AddListMutation onError failed:", error);
    },
    onSettled: () => {
      // invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["lists", userId],
      });
    },
  });

  const itemIsCompleteMutation = useMutation({
    mutationFn: async ({
      itemId,
      newIsComplete,
    }: {
      itemId: string;
      newIsComplete: boolean;
    }) => {
      await updateItemIsComplete(itemId, newIsComplete);
    },
    onMutate: async ({
      itemId,
      newIsComplete,
    }: {
      itemId: string;
      newIsComplete: boolean;
    }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", userId] });
      //save the original cache
      const originalLists = queryClient.getQueryData(["lists", userId]);
      //optimistically update the cache
      queryClient.setQueryData(
        ["lists", userId],
        (oldLists: ListWithItems[]) => {
          if (!oldLists) {
            console.error(
              "itemIsCompleteMutation onMutate failed: oldLists not found in cache",
            );
            return oldLists;
          }
          // find target item
          const targetItem = oldLists
            .flatMap((list) => list.items)
            .find((item) => item.id === itemId);
          if (!targetItem) {
            console.error(
              "itemIsCompleteMutation onMutate failed: targetItem not found in cache",
            );
            return oldLists;
          }
          // update isComplete of target item
          return oldLists.map((list) => ({
            ...list,
            items: list.items.map((item) =>
              item.id === itemId
                ? { ...item, isComplete: newIsComplete }
                : item,
            ),
          }));
        },
      );
      return { originalLists };
    },
    onError: (error, prop, context) => {
      // Rollback to the original lists in case of error
      if (context?.originalLists) {
        queryClient.setQueryData(["lists", userId], context.originalLists);
      }
      console.error("AddListMutation onError failed:", error);
    },
    onSettled: () => {
      // invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["lists", userId],
      });
    },
  });

  const itemDescriptionMutation = useMutation({
    mutationFn: async ({
      itemId,
      newDescription,
    }: {
      itemId: string;
      newDescription: string;
    }) => {
      await updateItemDescription(itemId, newDescription);
    },
    onMutate: async ({
      itemId,
      newDescription,
    }: {
      itemId: string;
      newDescription: string;
    }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", userId] });
      //save the original cache
      const originalLists = queryClient.getQueryData(["lists", userId]);
      //optimistically update the cache
      queryClient.setQueryData(
        ["lists", userId],
        (oldLists: ListWithItems[]) => {
          if (!oldLists) {
            console.error(
              "itemDescriptionMutation onMutate failed: oldLists not found in cache",
            );
            return oldLists;
          }
          // find target item
          const targetItem = oldLists
            .flatMap((list) => list.items)
            .find((item) => item.id === itemId);
          if (!targetItem) {
            console.error(
              "itemDescriptionMutation onMutate failed: targetItem not found in cache",
            );
            return oldLists;
          }
          // update description of target item
          return oldLists.map((list) => ({
            ...list,
            items: list.items.map((item) =>
              item.id === itemId
                ? { ...item, description: newDescription }
                : item,
            ),
          }));
        },
      );
      return { originalLists };
    },
    onError: (error, prop, context) => {
      // Rollback to the original lists in case of error
      if (context?.originalLists) {
        queryClient.setQueryData(["lists", userId], context.originalLists);
      }
      console.error("AddListMutation onError failed:", error);
    },
    onSettled: () => {
      // invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["lists", userId],
      });
    },
  });

  // scenarios: when is srcList synced?
  // 1. all real => db write and cache update
  // 2. one temp => cache update (db will be synced when temp resolves)
  // no need to update db for real list/item in case 2
  // (b/c they will be resolved as well during the db write after temp resolves)
  // 3. N/A => no used in syncing
  const reorderItemsMutation = useMutation({
    mutationFn: async ({
      itemId,
      srcListId,
      destListId,
      oldIndex,
      newIndex,
    }: {
      itemId: string;
      srcListId: string;
      destListId: string;
      oldIndex: number;
      newIndex: number;
    }) => {
      await updateItemPositionAndListId(
        srcListId,
        destListId,
        oldIndex,
        newIndex,
      );
    },
    onMutate: async ({
      itemId,
      srcListId,
      destListId,
      oldIndex,
      newIndex,
    }: {
      itemId: string;
      srcListId: string;
      destListId: string;
      oldIndex: number;
      newIndex: number;
    }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", userId] });
      // Store original cache
      const originalLists = queryClient.getQueryData(["lists", userId]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["lists", userId],
        (oldLists: ListWithItems[]) => {
          if (!oldLists) {
            console.error(
              "reorderItemsMutation onMutate failed: oldLists not found in cache",
            );
            return oldLists;
          }

          // moving item within same list
          if (srcListId === destListId) {
            // ... (this part is already good, no changes needed from your last version)
            const targetList = oldLists.find((list) => list.id === srcListId);
            if (!targetList) {
              console.error(
                "reorderItemsMutation onMutate failed: targetList not found in cache",
              );
              return oldLists;
            }

            console.log("targetList: ", targetList);

            const targetItem = targetList.items.find(
              (item) => item.position === oldIndex,
            );
            if (!targetItem || targetItem.id !== itemId) {
              console.error(
                "reorderItemsMutation onMutate failed: targetItem not found in cache",
              );
              return oldLists;
            }

            let newItems = targetList.items.map((item) => {
              if (item.id === targetItem.id) {
                return { ...item, position: newIndex };
              } else if (
                oldIndex > newIndex &&
                item.position >= newIndex &&
                item.position < oldIndex
              ) {
                return { ...item, position: item.position + 1 };
              } else if (
                oldIndex < newIndex &&
                item.position > oldIndex &&
                item.position <= newIndex
              ) {
                return { ...item, position: item.position - 1 };
              }
              return item;
            });

            const sortedItems = newItems.sort(
              (a, b) => a.position - b.position,
            );

            const updatedTargetList = {
              ...targetList,
              items: sortedItems,
            };

            return oldLists.map((list) =>
              list.id === updatedTargetList.id ? updatedTargetList : list,
            );

            // Moving items to different list
          } else {
            const srcList = oldLists.find((list) => list.id === srcListId);
            const destList = oldLists.find((list) => list.id === destListId);
            if (!srcList || !destList) {
              console.error(
                "reorderItemsMutation onMutate failed: src/destList not found in cache",
              );
              return oldLists;
            }
            const targetItem = srcList.items.find(
              (item) => item.position === oldIndex,
            );
            if (!targetItem || targetItem.id !== itemId) {
              console.error(
                "reorderItemsMutation onMutate failed: targetItem not found in cache",
              );
              return oldLists;
            }

            // 1. Prepare updated source list: remove targetItem and shift positions
            const newSrcItems = srcList.items
              .filter((item) => item.id !== targetItem.id) // Filter out the moved item
              .map((item) => {
                if (item.position > oldIndex) {
                  return { ...item, position: item.position - 1 }; // Corrected: use - 1
                }
                return item;
              });
            // Sort remaining items in source list
            const sortedSrcItems = newSrcItems.sort(
              (a, b) => a.position - b.position,
            );

            const updatedSrcList = {
              ...srcList,
              items: sortedSrcItems,
            };

            // 2. Prepare updated destination list: add targetItem and shift positions
            const newDestItemsWithShift = destList.items.map((item) => {
              if (item.position >= newIndex) {
                return { ...item, position: item.position + 1 }; // Corrected: use + 1
              }
              return item;
            });

            // Update target item's listId and position
            const updatedItem = {
              ...targetItem,
              listId: destList.id, // Target item's listId should be destList.id
              position: newIndex,
            };

            // Insert the updated target item into the new dest items
            const newDestItems = [
              ...newDestItemsWithShift.slice(0, newIndex),
              updatedItem,
              ...newDestItemsWithShift.slice(newIndex),
            ];
            // Sort items in destination list
            const sortedDestItems = newDestItems.sort(
              (a, b) => a.position - b.position,
            );

            const updatedDestList = {
              ...destList,
              items: sortedDestItems,
            };

            // 3. Return a new array of lists, with the updated source and destination lists
            return oldLists.map((list) => {
              if (list.id === updatedSrcList.id) {
                return updatedSrcList;
              } else if (list.id === updatedDestList.id) {
                return updatedDestList;
              } else {
                return list;
              }
            });
          }
        },
      );

      // Return a context object with the snapshotted value
      return { originalLists };
    },
    onError: (error, prop, context) => {
      // Rollback to the original lists in case of error
      if (context?.originalLists) {
        queryClient.setQueryData(["lists", userId], context.originalLists);
      }
      console.error("AddListMutation onError failed:", error);
    },
    onSettled: () => {
      // invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["lists", userId],
      });
    },
  });

  // IMPORTANT: Return all the mutation hooks so they can be used by components
  return {
    addItemMutation,
    updateItemMutation,
    deleteItemMutation,
    itemIsCompleteMutation,
    itemDescriptionMutation,
    reorderItemsMutation,
  };
};
