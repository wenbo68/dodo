import { Dispatch, DragEvent, SetStateAction } from "react";
import { useAuth } from "@/components/context/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllListsWithItems } from "../db/list-utils";
import { useListMutations } from "./todo-list-mutations";
import {
  clearIndicators,
  getIndicators,
  getNearestIndicator,
  highlightIndicator,
} from "./dnd-utils";

export const useListDnd = () => {
  // fetch requied client-side states
  const { userId } = useAuth();

  // fetch required client-side cache
  const queryClient = useQueryClient();
  const {
    data: lists,
    status,
    error,
  } = useQuery({
    queryKey: ["lists", userId],
    queryFn: () => getAllListsWithItems(userId),
  });

  //fetch required functions
  const { reorderListsMutation } = useListMutations();

  const handleDragStart = (e: DragEvent, listId: string) => {
    e.dataTransfer.setData("type", "list");
    e.dataTransfer.setData("listId", listId);
  };

  const handleDrop = (
    e: DragEvent,
    setActiveGrid: Dispatch<SetStateAction<HTMLElement | null>>,
  ) => {
    if (e.dataTransfer.getData("type") !== "list") return;

    e.preventDefault();

    const dropGridEl = e.currentTarget as HTMLElement;
    clearIndicators(dropGridEl, `[data-drop-list-id]`);
    setActiveGrid(null);

    // find target list info: listId, isPinnedStart, oldIndex
    if (!lists) {
      console.error("handleDrop failed: lists not found in cache");
      return;
    }
    const listId = e.dataTransfer.getData("listId");
    if (!listId) {
      console.error("handleDrop failed: listId not found in dataTransfer");
      return;
    }
    const targetList = lists.find((list) => list.id === listId);
    if (!targetList) {
      console.error("handleDrop failed: targetList not found in cache");
      return;
    }
    const isPinnedStart = targetList.isPinned;
    const oldIndex = targetList.position;

    // find drop info (from nearest drop indicator): isPinnedEnd, newIndex
    const isPinnedEnd = dropGridEl.getAttribute("data-pinned") === "true";

    const indicators = getIndicators(e, `[data-drop-list-id]`);
    let dropListId: string | null = null;
    const { element: nearestIndicator } = getNearestIndicator(
      e,
      indicators as HTMLElement[],
    );
    if (!nearestIndicator) {
      console.error("handleDrop failed: nearestIndicator not found");
      return;
    }
    dropListId = nearestIndicator.getAttribute("data-drop-list-id");
    if (!dropListId) {
      console.error("handleDrop failed: dropListId not found");
    }

    let newIndex: number = lists.filter(
      (list) => list.isPinned === isPinnedEnd,
    ).length;
    if (dropListId !== "last-indicator") {
      const dropList = lists.find((list) => list.id === dropListId);
      if (!dropList) {
        console.error("handleDrop failed: dropList not found in cache");
        return;
      }
      newIndex = dropList.position;
    }
    if (isPinnedStart === isPinnedEnd && newIndex > oldIndex) newIndex--;

    console.log(
      `List moved: ${isPinnedStart ? "pinned" : "unpinned"} index${oldIndex} to ${isPinnedEnd ? "pinned" : "unpinned"} index${newIndex}`,
    );

    reorderListsMutation.mutate({
      listId,
      isPinnedStart,
      isPinnedEnd,
      oldIndex,
      newIndex,
    });
  };

  const handleDragOver = (
    e: DragEvent,
    setActiveGrid: Dispatch<SetStateAction<HTMLElement | null>>,
  ) => {
    if (e.dataTransfer.getData("type") !== "list") return;
    e.preventDefault();
    setActiveGrid(e.currentTarget as HTMLElement);
    highlightIndicator(e, `[data-drop-list-id]`);
  };

  const handleDragLeave = (
    e: DragEvent,
    setActiveGrid: Dispatch<SetStateAction<HTMLElement | null>>,
  ) => {
    if (e.dataTransfer.getData("type") !== "list") return;
    clearIndicators(e.currentTarget as HTMLElement, `[data-drop-list-id]`);
    setActiveGrid(null);
  };

  return {
    handleDragStart,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  };
};
