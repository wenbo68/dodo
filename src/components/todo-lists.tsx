"use client";

import { useEffect, useRef } from "react";
import Sortable from 'sortablejs';
import { updateItemIsComplete, updateItemPosition } from "~/lib/db/item-actions";
import { updateListPosition } from "~/lib/db/list-actions";
import { ListWithItemsView } from "~/types";
import TodoItem from "./todo-item";

export function TodoLists({ 
  isOpen,
  userId,
  listsWithItemsView,
}:{
  isOpen: boolean,
  userId: string,
  listsWithItemsView: ListWithItemsView[]
} ) {
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
          oldPosition: oldIndex,
          newPosition: newIndex,
        }).catch((error) => {
          // If the server action fails, revert the UI
          console.error("updateListPosition() failed:", error);
          
          // Revert the UI by moving the list back to its original position
          if (gridRef.current?.children[newIndex] && gridRef.current?.children[oldIndex]) {
            // Get the element that was moved
            const movedElement = gridRef.current?.children[newIndex] as HTMLElement;
            
            // Remove it from current position
            gridRef.current.removeChild(movedElement);
            
            // Insert it back at the original position
            if (oldIndex >= gridRef.current.children.length) {
              gridRef.current.appendChild(movedElement);
            } else {
              gridRef.current.insertBefore(movedElement, gridRef.current.children[oldIndex]);
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
            console.log(`Item in list ${listId} moved:`, evt.oldIndex, "to", evt.newIndex);

            // You can implement your reordering logic here
            updateItemPosition({
              listId: Number(listId),
              oldPosition: oldIndex,
              newPosition: newIndex,
            }).catch((error)=>{
              // If the server action fails, revert the UI
              console.error("updateItemPosition() failed:", error);
              
              // Revert the UI by moving the item back to its original position
              if (listElement?.children[newIndex] && listElement?.children[oldIndex]) {
                // Get the element that was moved
                const movedElement = listElement?.children[newIndex] as HTMLElement;
                
                // Remove it from current position
                listElement.removeChild(movedElement);
                
                // Insert it back at the original position
                if (oldIndex >= listElement.children.length) {
                  listElement.appendChild(movedElement);
                } else {
                  listElement.insertBefore(movedElement, listElement.children[oldIndex]);
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
      itemSortables.forEach(sortable => sortable.destroy());
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
      className={`grid w-full gap-5 ${
        isOpen
          ? "grid-cols-none sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      }`}
    >
      {/* 1 list */}
      {listsWithItemsView.map((list) => (
        <div
          key={list.id ?? list.tempId}
          className="flex flex-col p-4 bg-white rounded-lg shadow-md min-w-[250px] max-w-[250px]"
          // data-id={list.id ?? list.tempId}
        >
          <div className="flex justify-between">
            {/* list title */}
            <h3 className="overflow-hidden text-lg font-semibold break-words">{list.title}</h3>
            {/* list handle */}
            <div className="cursor-move list-drag-handle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500 hover:text-gray-700"
              >
                <circle cx="8" cy="8" r="1" />
                <circle cx="8" cy="16" r="1" />
                <circle cx="16" cy="8" r="1" />
                <circle cx="16" cy="16" r="1" />
              </svg>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            {/* all items */}
            <ul
              className="space-y-2"
              ref={(el) => setItemsRef(el, String(list.id ?? list.tempId))}
              // data-list-id={list.id}
            >
              {/* 1 item */}
              {list.items.map((item) => (
                <TodoItem key={item.id ?? item.tempId} item={item} userId={userId}/>
                // <li
                //   key={item.id ?? item.tempId}
                //   className="flex gap-1 py-1 border-b border-gray-100 last:border-0"
                //   // data-id={item.id}
                // >
                //   {/* item handle */}
                //   <div className="mr-1 text-gray-400 cursor-move item-drag-handle hover:text-gray-600">
                //     <svg
                //       xmlns="http://www.w3.org/2000/svg"
                //       width="16"
                //       height="16"
                //       viewBox="0 0 24 24"
                //       fill="none"
                //       stroke="currentColor"
                //       strokeWidth="2"
                //       strokeLinecap="round"
                //       strokeLinejoin="round"
                //       className="text-gray-500 hover:text-gray-700"
                //     >
                //       <line x1="8" y1="6" x2="21" y2="6" />
                //       <line x1="8" y1="12" x2="21" y2="12" />
                //       <line x1="8" y1="18" x2="21" y2="18" />
                //       <line x1="3" y1="6" x2="3.01" y2="6" />
                //       <line x1="3" y1="12" x2="3.01" y2="12" />
                //       <line x1="3" y1="18" x2="3.01" y2="18" />
                //     </svg>
                //   </div>
                //   {/* item checkbox */}
                //   <input
                //     type="checkbox" 
                //     id={`item-${item.id}`} 
                //     className="flex-shrink-0 w-4 h-4 text-blue-600 border-gray-300 rounded peer focus:ring-blue-500"
                //     defaultChecked={item.isComplete}
                //     onChange={() => updateItemIsComplete(userId, item.id!, !item.isComplete)}
                //   />
                //   {/* item description */}
                //   <label
                //     htmlFor={`item-${item.id}`}
                //     className="flex-1 overflow-hidden text-sm font-medium leading-normal break-words whitespace-normal peer-checked:line-through peer-checked:text-gray-500"
                //   >
                //     {item.description}
                //   </label>
                // </li>
              ))}
            </ul>
          </div>
          {/* {list.items.length === 0 && (
            <p className="text-sm italic text-gray-500">No items in this list</p>
          )} */}
        </div>
      ))}
    </div>
  );
}
