import { X } from "lucide-react";
import AddListForm from "./add-list-form";
import { listFormSchema } from "~/types";
import { z } from "zod";

export default function AddListSidebar({
  isOpen,
  setIsOpen,
  userId,
  onSubmit,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string;
  onSubmit: (values: z.infer<typeof listFormSchema>) => void;
}) {
  return (
    <div
      className={`fixed left-0 top-0 h-full w-72 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-72"
      } z-50 rounded-lg bg-white p-3 shadow-lg`}
    >
      <AddListForm userId={userId} onSubmit={onSubmit} setIsOpen={setIsOpen} />
    </div>
  );
}
