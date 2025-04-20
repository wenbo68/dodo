import { X } from "lucide-react";
import AddListForm from "./add-list-form";
import { listFormSchema } from "~/types";
import { z } from "zod";

export default function AddListSidebar({
  isOpen,
  setIsOpen,
  userId,
  onSubmit,
}:{
  isOpen:boolean, 
  setIsOpen:React.Dispatch<React.SetStateAction<boolean>>,
  userId: string,
  onSubmit: (values: z.infer<typeof listFormSchema>) => void,
}){
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      } bg-white shadow-lg z-50`}
    >
      <AddListForm userId={userId} onSubmit={onSubmit} setIsOpen={setIsOpen}/>
    </div>
  );
}