"use client";

import { Item, ListWithItems } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addListWithItems,
  deleteList,
  pinList,
  updateListPositionAndIsPinned,
  updateListTitle,
  updateListWithItems,
} from "../db/list-actions";

import { useAuth } from "@/components/context/auth-context";
import { useItemMutations } from "./todo-item-utils";

export const useListMutations = () => {
  // Access client-side states and utilities using other hooks
  const { userId } = useAuth(); // Get the current user's ID from your auth context
  const queryClient = useQueryClient(); // Get the query client instance

  const { addItemMutation, updateItemMutation } = useItemMutations();

  const addListMutation = useMutation({
    mutationFn: async (listProp: ListWithItems) => {
      await addListWithItems(listProp);
    },
    onMutate: async (listProp: ListWithItems) => {
      await queryClient.cancelQueries({ queryKey: ["lists", userId] });
      // save the original cache
      const originalLists = queryClient.getQueryData(["lists", userId]);

      queryClient.setQueryData(
        ["lists", userId],
        (oldLists: ListWithItems[]) => {
          if (!oldLists) {
            console.error(
              "addListMutation onMutate failed: oldLists not found in cache",
            );
            return oldLists;
          }

          // move pinned/regular lists below newList down by 1
          const updatedLists = [
            listProp,
            ...oldLists.map((list) => {
              return {
                ...list,
                position:
                  list.isPinned === listProp.isPinned &&
                  list.position >= listProp.position
                    ? list.position + 1
                    : list.position,
              };
            }),
          ];
          // sort the lists by position
          const sortedLists = updatedLists.sort((a, b) => {
            return a.position - b.position;
          });

          return sortedLists;
        },
      );
      //return context obj
      return { originalLists };
    },
    onError: (error, listProp, context) => {
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

  const updateListMutation = useMutation({
    mutationFn: async (listProp: ListWithItems) => {
      await updateListWithItems(listProp);
    },
    onError: (error, prop, context) => {
      queryClient.invalidateQueries({ queryKey: ["lists", userId] });
      console.error("updateListMutation onError: ", error);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async ({ listId }: { listId: string }) => {
      await deleteList(listId);
    },
    onMutate: async ({ listId }: { listId: string }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", userId] });
      // save the original cache
      const originalLists = queryClient.getQueryData(["lists", userId]);
      // optimistically update the cache
      queryClient.setQueryData(
        ["lists", userId],
        (oldLists: ListWithItems[]) => {
          if (!oldLists) {
            console.error(
              "deleteListMutation onMutate failed: oldLists not found in cache",
            );
            return oldLists;
          }
          // find target list
          const targetList = oldLists.find((list) => list.id === listId);
          if (!targetList) {
            console.error(
              "deleteListMutation onMutate failed: targetList not found in cache",
            );
            return oldLists;
          }
          // remove the list from the cache
          // then move pinned/regular lists below target up by 1
          const updatedLists = oldLists
            .filter((list) => list.id !== listId)
            .map((list) => {
              return {
                ...list,
                position:
                  list.isPinned === targetList.isPinned &&
                  list.position > targetList.position
                    ? list.position - 1
                    : list.position,
              };
            });
          // // move lists below the deleted list up by 1
          // updatedLists.forEach((list) => {
          //   if (
          //     list.isPinned === targetList.isPinned &&
          //     list.position > targetList.position
          //   ) {
          //     list.position--;
          //   }
          // });
          return updatedLists;
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

  const listTitleMutation = useMutation({
    mutationFn: async ({
      listId,
      newTitle,
    }: {
      listId: string;
      newTitle: string;
    }) => {
      await updateListTitle(listId, newTitle);
    },
    onMutate: async ({
      listId,
      newTitle,
    }: {
      listId: string;
      newTitle: string;
    }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", userId] });
      // save the original cache
      const originalLists = queryClient.getQueryData(["lists", userId]);

      // optimistically update the cache
      queryClient.setQueryData(
        ["lists", userId],
        (oldLists: ListWithItems[]) => {
          if (!oldLists) {
            console.error(
              "listTitleMutation onMutate failed: oldLists not found in cache",
            );
            return oldLists;
          }
          // find target list
          const targetList = oldLists.find((list) => list.id === listId);
          if (!targetList) {
            console.error(
              "listTitleMutation onMutate failed: targetList not found in cache",
            );
            return oldLists;
          }
          // update title of target list
          return oldLists.map((oldList) =>
            oldList.id === listId ? { ...oldList, title: newTitle } : oldList,
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

  const reorderListsMutation = useMutation({
    mutationFn: async ({
      listId,
      isPinnedStart,
      isPinnedEnd,
      oldIndex,
      newIndex,
    }: {
      listId: string;
      isPinnedStart: boolean;
      isPinnedEnd: boolean;
      oldIndex: number;
      newIndex: number;
    }) => {
      await updateListPositionAndIsPinned(
        userId,
        isPinnedStart,
        isPinnedEnd,
        oldIndex,
        newIndex,
      );
    },
    onMutate: async ({
      listId,
      isPinnedStart,
      isPinnedEnd,
      oldIndex,
      newIndex,
    }: {
      listId: string;
      isPinnedStart: boolean;
      isPinnedEnd: boolean;
      oldIndex: number;
      newIndex: number;
    }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", userId] });
      // store original cache
      const originalLists = queryClient.getQueryData(["lists", userId]);

      queryClient.setQueryData(
        ["lists", userId],
        (oldLists: ListWithItems[]) => {
          if (!oldLists) {
            console.error(
              "reorderListsMutation onMutate failed: oldLists not found in cache",
            );
            return oldLists;
          }

          // Find the target list
          // Note: Finding by position and isPinnedStart might not be unique if positions are not strictly sequential
          // Using listId directly is safer if listId is unique and reliable.
          const targetList = oldLists.find((list) => list.id === listId);

          // Defensive checks: make sure targetList matches expected initial state before modifying
          if (
            !targetList ||
            targetList.isPinned !== isPinnedStart ||
            targetList.position !== oldIndex
          ) {
            console.error(
              "reorderListsMutation onMutate failed: targetList mismatch in cache",
            );
            return oldLists;
          }

          // Step 1: Create the updated target list (immutable)
          const updatedTargetList = {
            ...targetList,
            isPinned: isPinnedEnd,
            position: newIndex,
          };

          // Step 2: Create a new array of lists, incorporating the updated target list
          // and immutably updating positions of other affected lists.
          let newLists = oldLists.map((list) => {
            // If it's the target list, return the already updated version
            if (list.id === targetList.id) {
              return updatedTargetList;
            }

            // Otherwise, apply position shifts to other lists, immutably
            if (isPinnedStart === isPinnedEnd) {
              // moved target list within the same grid
              if (newIndex < oldIndex) {
                // Moving others down: increment positions between newPosition (inclusive) and oldPosition
                if (
                  list.isPinned === isPinnedStart && // Check if in the same pinned group
                  list.position >= newIndex &&
                  list.position < oldIndex
                ) {
                  return { ...list, position: list.position + 1 };
                }
              } else if (oldIndex < newIndex) {
                // Moving others up: decrement positions between oldPosition and newPosition (inclusive)
                if (
                  list.isPinned === isPinnedStart && // Check if in the same pinned group
                  list.position > oldIndex &&
                  list.position <= newIndex
                ) {
                  return { ...list, position: list.position - 1 };
                }
              }
            } else {
              // moved target list to a different grid (pinned -> regular or regular -> pinned)
              // This needs to be handled carefully in a single map pass.

              // Case A: Item was in srcGrid (isPinnedStart) and its position is > oldIndex, it shifts up.
              if (list.isPinned === isPinnedStart && list.position > oldIndex) {
                return { ...list, position: list.position - 1 };
              }
              // Case B: Item is in destGrid (isPinnedEnd) and its position is >= newIndex, it shifts down.
              if (list.isPinned === isPinnedEnd && list.position >= newIndex) {
                return { ...list, position: list.position + 1 };
              }
            }
            return list; // Return list unchanged if no conditions met
          });

          // Step 3: Sort the newly created array of lists by position
          const sortedLists = newLists.sort((a, b) => {
            // First sort by isPinned (true before false)
            if (a.isPinned !== b.isPinned) {
              return a.isPinned ? -1 : 1;
            }
            // Then sort by position
            return a.position - b.position;
          });

          // console.log("targetlist new position: ", updatedTargetList.position);
          return sortedLists;
        },
      );
      return { originalLists };
    },
    onError: (error, prop, context) => {
      // Rollback to the original lists in case of error
      if (context?.originalLists) {
        queryClient.setQueryData(["lists", userId], context.originalLists);
      }
      console.error("ReorderListsMutation onError failed:", error); // Corrected typo here
    },
    onSettled: () => {
      // invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["lists", userId],
      });
    },
  });

  const pinListMutation = useMutation({
    mutationFn: async ({
      listId,
      newIsPinned,
    }: {
      listId: string;
      newIsPinned: boolean;
    }) => {
      await pinList(listId, newIsPinned);
    },
    onMutate: async ({
      listId,
      newIsPinned,
    }: {
      listId: string;
      newIsPinned: boolean;
    }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", userId] });
      // save the original cache
      const originalLists = queryClient.getQueryData(["lists", userId]);
      // optimistically update the cache
      queryClient.setQueryData<ListWithItems[]>(
        ["lists", userId],
        (oldLists) => {
          // Handle cases where no old data exists.
          if (!oldLists) {
            console.warn(
              "pinListMutation onMutate: No existing lists in cache, or cache is malformed. Returning empty array.",
            );
            return oldLists;
          }

          // Create a new array to avoid direct mutation of oldLists
          let updatedLists = oldLists.map((list) => {
            if (list.id === listId) {
              // Update the target list's pinned status
              return { ...list, isPinned: newIsPinned, position: -1 };
            }
            return list;
          });

          // Separate lists into pinned and unpinned groups
          const pinnedLists = updatedLists.filter((list) => list.isPinned);
          const unpinnedLists = updatedLists.filter((list) => !list.isPinned);

          // Sort within each group by their current 'position' (ascending)
          // This preserves the relative order within each group.
          pinnedLists.sort((a, b) => a.position - b.position);
          unpinnedLists.sort((a, b) => a.position - b.position);

          // Re-assign positions starting from 0 for each group
          const reIndexedPinnedLists = pinnedLists.map((list, index) => ({
            ...list,
            position: index,
          }));
          const reIndexedUnpinnedLists = unpinnedLists.map((list, index) => ({
            ...list,
            position: index,
          }));

          // Combine the lists: pinned lists first, then unpinned lists.
          // Note: The 'position' for the combined array isn't strictly sequential here
          // if you expect a single sequence across both groups, but within each group,
          // they are sequential.
          return [...reIndexedPinnedLists, ...reIndexedUnpinnedLists];
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

  return {
    addListMutation,
    updateListMutation,
    deleteListMutation,
    listTitleMutation,
    reorderListsMutation,
    pinListMutation,
  };
};
