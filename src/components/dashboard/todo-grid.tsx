"use client";

import { useEffect, useRef, useState } from "react";
import Sortable from "sortablejs";
import { updateItemPosition } from "~/lib/db/item-actions";
import {
  addListWithItems,
  deleteList,
  updateListPosition,
} from "~/lib/db/list-actions";
import { ListWithItemsView } from "~/types";
import TodoList from "./todo-list";
import { MdAdd } from "react-icons/md";
import AddListButton from "./add-list-button";

export function TodoGrid({
  userId,
  listsWithItemsView,
}: {
  userId: string;
  listsWithItemsView: ListWithItemsView[];
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsRefs = useRef<Map<string, HTMLUListElement>>(new Map());

  const [lists, setLists] = useState<ListWithItemsView[]>(listsWithItemsView);
  // Sync with server data when props change
  useEffect(() => {
    setLists(listsWithItemsView);
  }, [listsWithItemsView]);

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

        // // Run database update in the background
        // // (using await will freeze the page?? no, will only freeze the async function)
        // // (however, if the page.tsx is closest async function, the page will freeze)
        // updateListPosition({
        //   userId: userId,
        //   oldPosition: oldIndex,
        //   newPosition: newIndex,
        // }).catch((error) => {
        //   // If the server action fails, revert the UI
        //   console.error("updateListPosition() failed:", error);

        //   // Revert the UI by moving the list back to its original position
        //   if (
        //     gridRef.current?.children[newIndex] &&
        //     gridRef.current?.children[oldIndex]
        //   ) {
        //     // Get the element that was moved
        //     const movedElement = gridRef.current?.children[
        //       newIndex
        //     ] as HTMLElement;

        //     // Remove it from current position
        //     gridRef.current.removeChild(movedElement);

        //     // Insert it back at the original position
        //     if (oldIndex >= gridRef.current.children.length) {
        //       gridRef.current.appendChild(movedElement);
        //     } else {
        //       gridRef.current.insertBefore(
        //         movedElement,
        //         gridRef.current.children[oldIndex],
        //       );
        //     }
        //   }
        // });

        // update the state after the optimistic update in order to trigger a re-render
        // which updates the position prop passed to TodoList
        setLists((prevLists) => {
          const newList = [...prevLists];
          const [movedList] = newList.splice(oldIndex, 1);
          newList.splice(newIndex, 0, movedList);
          return newList;
        });

        // Run database update in the background
        updateListPosition({
          userId: userId,
          oldPosition: oldIndex,
          newPosition: newIndex,
        }).catch((error) => {
          // If the server action fails, revert the UI
          console.error("updateListPosition() failed:", error);

          // Revert the UI by moving the list back to its original position
          setLists((prevLists) => {
            const newList = [...prevLists];
            const [movedList] = newList.splice(newIndex, 1);
            newList.splice(oldIndex, 0, movedList);
            return newList;
          });
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

  const handleAddListClick = async () => {
    // This function will be called when the button is clicked
    // You can add your logic here, such as opening a modal or navigating to another page
    console.log("Button clicked!");

    //optimistically add a new list
    const newList: ListWithItemsView = {
      // Generate a unique temporary ID. crypto.randomUUID() is modern,
      // otherwise use a timestamp/random combo or a library like uuid.
      tempId: `temp-${Date.now()}`,
      title: "", // Replace with dynamic title if needed (e.g., from input)
      items: [], // A new list typically starts with no items
    };
    setLists((prevLists) => {
      // Create a new array: [newList, ...all_elements_from_prevLists]
      return [newList, ...prevLists];
    });

    try {
      const newListDb: ListWithItemsView = await addListWithItems({
        userId: userId,
        title: "",
        items: [],
      });
      // replace temp id with actual id return from db
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.tempId === newList.tempId ? newListDb : list,
        ),
      );
    } catch (error) {
      console.error("addListWithItems() failed:", error);
      // If the server action fails, revert the UI
      setLists((prevLists) =>
        prevLists.filter((list) => list.tempId !== newList.tempId),
      );
    }
  };

  const handleDeleteList = async (listId: number) => {
    // 1. Find the index of the list to be deleted
    const listIndex = lists.findIndex((list) => list.id === listId);
    if (listIndex === -1) {
      console.error("List not found");
      return;
    }

    // 2. Store the list to be deleted
    const deletedList = lists[listIndex];

    // 3. Optimistically update the UI
    setLists((prevLists) => {
      const newList = [...prevLists];
      newList.splice(listIndex, 1);
      return newList;
    });

    // 4. Call the delete list API
    try {
      await deleteList(listId);
    } catch (error) {
      console.error("handleDeleteList() failed:", error);

      // 5. Revert the UI if the API call fails
      setLists((prevLists) => {
        const newList = [...prevLists];
        newList.splice(listIndex, 0, deletedList);
        return newList;
      });
    }
  };

  return (
    <>
      <AddListButton handleButtonClick={handleAddListClick} />
      {/* grid containing all todo lists */}
      <div
        ref={gridRef}
        className={`grid w-full grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3`}
      >
        {/* <div className="min-h-[300px] min-w-[250px] rounded-lg border bg-white p-3 shadow-lg">
          <button className="h-full w-full">
            <MdAdd className="h-full w-full text-gray-500" />
          </button>
        </div> */}
        {/* 1 list */}
        {lists.map((list, index) => (
          <TodoList
            key={list.id ?? list.tempId}
            list={list}
            userId={userId}
            setItemsRef={setItemsRef}
            position={index} // Pass the index as the position prop
            handleDeleteList={handleDeleteList}
          />
        ))}
      </div>
    </>
  );
}
