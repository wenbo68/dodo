"use client"; // Context must be a client component
import { createContext, useContext } from "react";
import { ListWithItemsView } from "~/types";

type AddListContextType = {
  isOpen: boolean,
  userId: string,
  listsWithItemsView: ListWithItemsView[];
  setListsWithItems: React.Dispatch<React.SetStateAction<ListWithItemsView[]>>;
};

export const AddListContext = createContext<AddListContextType | null>(null);

export const useAddListContext = () => {
  const context = useContext(AddListContext);
  if (!context) {
    throw new Error("useLists must be used within a ListsProvider");
  }
  return context;
};
