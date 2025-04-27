import { useEffect, useRef, useState } from "react";
import { set } from "zod";
import {
  updateItemDescription,
  updateItemIsComplete,
} from "~/lib/db/item-actions";
import { itemMutex } from "~/lib/utils/item-mutex";
import throttle from "~/lib/utils/throttle";
import { ItemView } from "~/types";

export default function TodoItem({
  item,
  userId,
  handleDeleteItem,
}: {
  item: ItemView;
  userId: string;
  handleDeleteItem: (itemId: number, itemPosition: number) => void;
}) {
  const [isComplete, setIsComplete] = useState(item.isComplete);
  const [description, setDescription] = useState(item.description);

  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for the textarea

  // Function to adjust textarea height
  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      // element.style.height = 'auto'; // Reset height to recalculate scrollHeight
      element.scrollHeight; // Have to call element.scrollHeight twice for some reason...
      element.style.height = `${element.scrollHeight}px`; // Set height based on content
    }
  };

  // Adjust height when editing starts or description changes programmatically
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
      textareaRef.current.focus(); // Keep autoFocus behavior
    }
  }, [isEditing, description]); // Rerun when editing starts or description changes

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

    setIsCheckboxDisabled(true);
    try {
      await updateItemIsComplete(userId, item.id!, newIsComplete);
    } catch (error) {
      setIsComplete(!newIsComplete); // Revert the UI if the update fails
      console.error("throttledUpdate() failed:", error);
      throw new Error("throttledUpdate() failed: " + String(error));
    } finally {
      setIsCheckboxDisabled(false); // Re-enable the checkbox
    }
  };

  const handleItemDescriptionClick = () => {
    setIsEditing(true);
  };

  const handleItemDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDescription(e.target.value);
  };

  //only make the function async if you need to await something in backend
  const handleItemDescriptionBlur = async () => {
    setIsEditing(false);
    if (description !== item.description) {
      try {
        // Call your update description API here
        await updateItemDescription(item.id!, description);
      } catch (error) {
        console.error("handleDescriptionBlur failed: ", error);
        setDescription(item.description); // revert on error
      }
    }
  };

  const handleItemDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <li className="group flex gap-1 border-b border-gray-100 py-1 last:border-0">
      {/* Item handle */}
      <div className="item-drag-handle h-4 w-4 cursor-move">
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
          className="text-gray-500 hover:text-gray-950"
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
        className="peer h-4 w-4 flex-shrink-0 rounded"
        checked={isComplete}
        onChange={handleCheckboxChange}
        disabled={isCheckboxDisabled}
      />
      {/* Item description: becomes textarea when editing*/}
      {isEditing ? (
        <textarea
          ref={textareaRef} // Attach the ref
          value={description}
          onChange={handleItemDescriptionChange}
          onBlur={handleItemDescriptionBlur}
          onKeyDown={handleItemDescriptionKeyDown}
          className="flex-1 resize-none overflow-hidden text-sm font-medium" // Added overflow-hidden and styling
          rows={1} // Start with one row
          // autoFocus // autoFocus is handled by useEffect now
        />
      ) : (
        <label
          onClick={handleItemDescriptionClick}
          className={`flex-1 overflow-hidden whitespace-pre-wrap break-words text-sm font-medium ${isComplete && description !== "" ? "text-gray-400 line-through" : ""}`}
        >
          {description === "" ? " " : description}
        </label>
      )}
      <button
        onClick={() => handleDeleteItem(item.id!, item.position)}
        className="h-5 text-xs text-gray-600 opacity-0 transition-opacity hover:text-gray-950 group-hover:opacity-100"
      >
        X
      </button>
    </li>
  );
}
