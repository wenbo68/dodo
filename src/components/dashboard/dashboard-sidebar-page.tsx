"use client";
import React, { useEffect, useState } from "react";
import AddListSidebar from "./add-list-sidebar";
import { addListWithItems } from "~/lib/db/list-actions";
import { z } from "zod";
import { listFormSchema, ListWithItems, ListWithItemsView } from "~/types";
import { createContext, useContext } from "react";
import { AddListContext } from "~/lib/utils/list-context";

export default function DashboardSidebarPage({
  children,
  userId,
  listsWithItemsView: initialView,
}: {
  children: React.ReactNode;
  userId: string;
  listsWithItemsView: ListWithItemsView[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  //need to use state to update optimistically
  const [listsWithItemsView, setListsWithItems] = useState(initialView);

  // Sync state with prop updates
  useEffect(() => {
    setListsWithItems(initialView);
  }, [initialView]);

  async function onSubmit(values: z.infer<typeof listFormSchema>) {
    // Use a temporary id so React can key the new list in the page that displays all todo lists
    const tempId = `temp-${Date.now()}`;

    // Create the new list from form values
    const newListTemp: ListWithItemsView = {
      tempId, // Temporary id to identify the list
      title: values.title,
      items: values.items.map((item, index) => ({
        // Use a temporary id for each item (could be combined with tempId and index)
        tempId: `${tempId}-${index}`,
        isComplete: false, // Default value for a new item
        description: item.description,
        position: index, // Position in the list
      })),
    };

    // Optimistically update the UI by adding the new list to the beginning of the list array.
    // This effectively "shifts" all other lists down by 1 position.
    setListsWithItems((prevLists) => [newListTemp, ...prevLists]);
    // setIsOpen(false)
    //form.reset()

    try {
      console.log("adding list to db");
      //update database and get the actual list from db
      const newListDb: ListWithItemsView = await addListWithItems({
        userId,
        title: values.title,
        items: values.items,
      });
      console.log("finished adding list to db");
      // Replace the temperary newList with the actual list from the server.
      setListsWithItems((prevLists) =>
        prevLists.map((list) => (list.tempId === tempId ? newListDb : list)),
      );
    } catch (error) {
      console.log(`DashboardSidebarPage failed: ${String(error)}`);
      //db error -> revert optimistic update in listsWithItems
      setListsWithItems((prevLists) =>
        prevLists.filter((list) => list.tempId !== tempId),
      );
    }
  }

  return (
    <AddListContext.Provider
      value={{ isOpen, userId, listsWithItemsView, setListsWithItems }}
    >
      {/* add list button */}
      <button
        onClick={() => {
          setIsOpen(true);
          console.log(isOpen);
        }}
      >
        Add List
      </button>
      {/* sidebar + page.tsx: side by side */}
      {/* overflow-hidden will hide the scrollbar */}
      <div className="flex overflow-hidden">
        <AddListSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          userId={userId}
          onSubmit={onSubmit}
        />
        {children}
      </div>
    </AddListContext.Provider>
  );
}
