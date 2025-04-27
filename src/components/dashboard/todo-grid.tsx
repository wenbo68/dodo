"use client";

import { useEffect, useRef } from "react";
import Sortable from "sortablejs";
import {
  updateItemIsComplete,
  updateItemPosition,
} from "~/lib/db/item-actions";
import { updateListPosition } from "~/lib/db/list-actions";
import { ListWithItemsView } from "~/types";
import TodoItem from "./todo-item";
import TodoList from "./todo-list";

export function TodoGrid({
  isOpen,
  userId,
  listsWithItemsView,
}: {
  isOpen: boolean;
  userId: string;
  listsWithItemsView: ListWithItemsView[];
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsRefs = useRef<Map<string, HTMLUListElement>>(new Map());

  useEffect(() => {
    if (!gridRef.current) return;

    // Initialize Sortable.js on the grid container for list sorting
    const sortable = Sortable.create(gridRef.current, {
      animation: 150,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      // Grid layout with 5 columns
      // grid: [1, 5],
      // Handle is the draggable part of each list item
      handle: ".list-drag-handle",
      onEnd: (evt) => {
        // Get the indices for reordering
        const oldIndex = evt.oldIndex!;
        const newIndex = evt.newIndex!;

        console.log("List moved:", oldIndex, "to", newIndex);

        // UI is already updated optimistically by SortableJS

        // Run database update in the background
        // (using await will freeze the page?? no, will only freeze the async function)
        // (however, if the page.tsx is closest async function, the page will freeze)
        updateListPosition({
          userId: userId,
          oldPosition: oldIndex,
          newPosition: newIndex,
        }).catch((error) => {
          // If the server action fails, revert the UI
          console.error("updateListPosition() failed:", error);

          // Revert the UI by moving the list back to its original position
          if (
            gridRef.current?.children[newIndex] &&
            gridRef.current?.children[oldIndex]
          ) {
            // Get the element that was moved
            const movedElement = gridRef.current?.children[
              newIndex
            ] as HTMLElement;

            // Remove it from current position
            gridRef.current.removeChild(movedElement);

            // Insert it back at the original position
            if (oldIndex >= gridRef.current.children.length) {
              gridRef.current.appendChild(movedElement);
            } else {
              gridRef.current.insertBefore(
                movedElement,
                gridRef.current.children[oldIndex],
              );
            }
          }
        });
      },
    });

    // Initialize Sortable.js for each list's items
    const itemSortables: ReturnType<typeof Sortable.create>[] = [];
    itemsRefs.current.forEach((listElement, listId) => {
      if (listElement) {
        const itemSortable = Sortable.create(listElement, {
          animation: 150,
          ghostClass: "sortable-ghost",
          chosenClass: "sortable-chosen",
          dragClass: "sortable-drag",
          handle: ".item-drag-handle",
          onEnd: (evt) => {
            // Get the indices for reordering
            const oldIndex = evt.oldIndex!;
            const newIndex = evt.newIndex!;

            // Here you would typically update the order in your database
            console.log(
              `Item in list ${listId} moved:`,
              evt.oldIndex,
              "to",
              evt.newIndex,
            );

            // You can implement your reordering logic here
            updateItemPosition({
              listId: Number(listId),
              oldPosition: oldIndex,
              newPosition: newIndex,
            }).catch((error) => {
              // If the server action fails, revert the UI
              console.error("updateItemPosition() failed:", error);

              // Revert the UI by moving the item back to its original position
              if (
                listElement?.children[newIndex] &&
                listElement?.children[oldIndex]
              ) {
                // Get the element that was moved
                const movedElement = listElement?.children[
                  newIndex
                ] as HTMLElement;

                // Remove it from current position
                listElement.removeChild(movedElement);

                // Insert it back at the original position
                if (oldIndex >= listElement.children.length) {
                  listElement.appendChild(movedElement);
                } else {
                  listElement.insertBefore(
                    movedElement,
                    listElement.children[oldIndex],
                  );
                }
              }
            });
          },
        });
        itemSortables.push(itemSortable);
      }
    });

    return () => {
      sortable.destroy();
      itemSortables.forEach((sortable) => sortable.destroy());
    };
  }, [listsWithItemsView]);

  // Function to store refs to the item lists
  const setItemsRef = (element: HTMLUListElement | null, listId: string) => {
    if (element) {
      itemsRefs.current.set(listId, element);
    } else {
      itemsRefs.current.delete(listId);
    }
  };

  return (
    // all lists (grid)
    <div
      ref={gridRef}
      className={`grid w-full grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3`}
    >
      {/* 1 list */}
      {listsWithItemsView.map((list) => (
        <TodoList
          key={list.id ?? list.tempId}
          list={list}
          userId={userId}
          setItemsRef={setItemsRef}
        />
      ))}
    </div>
  );
}
