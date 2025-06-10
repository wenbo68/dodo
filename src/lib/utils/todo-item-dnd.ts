import { useAuth } from "@/components/context/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllListsWithItems } from "../db/list-utils";
import { useItemMutations } from "./todo-item-mutations";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  DragEvent,
  Dispatch,
  SetStateAction,
} from "react";
import {
  clearIndicators,
  getIndicators,
  getNearestIndicator,
  highlightIndicator,
} from "./dnd-utils";

export const useItemDnd = () => {
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

  const { reorderItemsMutation, addItemMutation } = useItemMutations();

  const handleDragStart = (e: DragEvent, itemId: string) => {
    e.dataTransfer.setData("type", "item");
    e.dataTransfer.setData("itemId", itemId);
  };

  const handleDrop = (
    e: DragEvent,
    setIsActive: Dispatch<SetStateAction<HTMLElement | null>>,
  ) => {
    if (e.dataTransfer.getData("type") !== "item") return;

    e.preventDefault();

    const dropListEl = e.currentTarget as HTMLElement;
    clearIndicators(dropListEl, `[data-drop-item-id]`);
    setIsActive(null);

    // find target item info: itemId, srccListId, oldIndex
    if (!lists) {
      console.error("handleDrop failed: lists not found in cache");
      return;
    }
    const itemId = e.dataTransfer.getData("itemId");
    if (!itemId) {
      console.error("handleDrop failed: itemId not found in dataTransfer");
      return;
    }
    const targetItem = lists
      .flatMap((list) => list.items)
      .find((item) => item.id === itemId);
    if (!targetItem) {
      console.error("handleDrop failed: targetItem not found in cache");
      return;
    }
    const srcListId = targetItem.listId;
    const oldIndex = targetItem.position;

    // find drop info (from nearest drop indicator): destListId, newIndex
    const destListId = dropListEl.getAttribute("data-list-id");
    if (!destListId) {
      console.error("handleDrop failed: destListId not found");
      return;
    }

    const indicators = getIndicators(e, `[data-drop-item-id]`);
    let dropItemId: string | null = null;
    const { element: nearestIndicator } = getNearestIndicator(e, indicators);
    if (!nearestIndicator) {
      console.error("handleDrop failed: nearestIndicator not found");
      return;
    }
    dropItemId = nearestIndicator.getAttribute("data-drop-item-id");
    if (!dropItemId) {
      console.error("handleDrop failed: dropItemId not found");
      return;
    }
    const dropList = lists.find((list) => list.id === destListId);
    if (!dropList) {
      console.error("handleDrop failed: dropList not found");
      return;
    }
    let newIndex = dropList.items.length;
    // cannot find dropItem if list length === 0
    if (newIndex > 0 && dropItemId !== "last-indicator") {
      const dropItem = dropList.items.find((item) => item.id === dropItemId);
      if (!dropItem) {
        console.error("handleDrop failed: dropItem not found in cache");
        return;
      }
      newIndex = dropItem.position;
    }
    if (srcListId === destListId && newIndex > oldIndex) newIndex--;

    console.log(
      "Item moved: list",
      srcListId,
      " index",
      oldIndex,
      "=> list",
      destListId,
      " index",
      newIndex,
    );

    reorderItemsMutation.mutate({
      itemId,
      srcListId,
      destListId,
      oldIndex,
      newIndex,
    });
  };
  const handleDragOver = (
    e: DragEvent,
    setIsActive: Dispatch<SetStateAction<HTMLElement | null>>,
  ) => {
    if (e.dataTransfer.getData("type") !== "item") return;
    e.preventDefault();
    highlightIndicator(e, `[data-drop-item-id]`);
    setIsActive(e.currentTarget as HTMLElement);
  };
  const handleDragLeave = (
    e: DragEvent,
    setIsActive: Dispatch<SetStateAction<HTMLElement | null>>,
  ) => {
    if (e.dataTransfer.getData("type") !== "item") return;
    clearIndicators(e.currentTarget as HTMLElement, `[data-drop-item-id]`);
    setIsActive(null);
  };

  return {
    handleDragStart,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  };
};
