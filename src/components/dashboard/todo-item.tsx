import { useState } from "react";
import { set } from "zod";
import { updateItemIsComplete } from "~/lib/db/item-actions";
import { itemMutex } from "~/lib/utils/item-mutex";
import throttle from "~/lib/utils/throttle";
import { ItemView } from "~/types";

export default function TodoItem({ 
  item, 
  userId,
}: { 
  item: ItemView; 
  userId: string;
}) {
  const [isComplete, setIsComplete] = useState(item.isComplete);
  const [isDisabled, setIsDisabled] = useState(false);

  // // Throttled version of the update function
  // const throttledUpdate = throttle(async (itemId: number, newIsComplete: boolean) => {
  //   updateItemIsComplete(userId, itemId, newIsComplete)
  //     .then(() => {
  //       // Update the UI optimistically
  //       console.log(`Item ${itemId} updated in db`);
  //     })
  //     .catch(error => {
  //       setIsComplete(!newIsComplete); // Revert the UI if the update fails
  //       console.error("throttledUpdate() failed:", error);
  //       throw new Error("throttledUpdate() failed: " + String(error));
  //     })
  // }, 1000); // Throttle updates to once every 1000ms

  const handleCheckboxChange = async () => {
    console.log("handling checkbox change");
    const newIsComplete = !isComplete;
    setIsComplete(newIsComplete); // Optimistically update the UI
    // throttledUpdate(item.id!, newIsComplete)

    // //disable checkbox for 1 second
    // setIsDisabled(true);
    // console.log("checkbox disabled");
    // setTimeout(() => {
    //   setIsDisabled(false);
    //   console.log("checkbox enabled");
    // }, 1000);

    console.log(`updating Item${item.id!} in db`);
    setIsDisabled(true);
    updateItemIsComplete(userId, item.id!, newIsComplete)
      .then(() => {
        console.log(`updated Item${item.id!} in db`);
      })
      .catch(error => {
        setIsComplete(!newIsComplete); // Revert the UI if the update fails
        console.error("throttledUpdate() failed:", error);
        throw new Error("throttledUpdate() failed: " + String(error));
      })
      .finally(() => {
        setIsDisabled(false); // Re-enable the checkbox
        console.log("checkbox enabled");
      });
  };

  return (
    <li
      // key={item.id ?? item.tempId}
      className="flex gap-1 py-1 border-b border-gray-100 last:border-0"
      // data-id={item.id}
    >
      {/* Item handle */}
      <div className="text-gray-400 cursor-move item-drag-handle hover:text-gray-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-500 hover:text-gray-700"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </div>
      {/* Item checkbox */}
      <input
        type="checkbox"
        id={`item-${item.id}`}
        className="flex-shrink-0 w-4 h-4 text-blue-600 border-gray-300 rounded peer focus:ring-blue-500"
        checked={isComplete}
        onChange={handleCheckboxChange}
        disabled={isDisabled}
      />
      {/* Item description */}
      <label
        htmlFor={`item-${item.id}`}
        className="flex-1 overflow-hidden text-sm font-medium leading-normal break-words whitespace-normal peer-checked:line-through peer-checked:text-gray-400"
      >
        {item.description}
      </label>
    </li>
  );
}