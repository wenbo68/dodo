import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

const listFormSchema = z.object({
  title: z.string(),
  items: z.array(z.object({ //arr elmts must be obj instead of string for useFieldArray() to work
    description: z.string(),
  })),
})

export default function AddListForm({
  userId,
  onSubmit,
  setIsOpen,
}:{
  userId: string,
  onSubmit: (values: z.infer<typeof listFormSchema>) => void,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
}){
  const form = useForm<z.infer<typeof listFormSchema>>({
    resolver: zodResolver(listFormSchema),
    defaultValues:{
      title:"",
      items: [],
    }
  })
  const {fields, append, remove} = useFieldArray({
    control: form.control,
    name: "items",
  })
  
  return(
    <div className="flex-col overflow-y-auto">
      <button onClick={() => setIsOpen(false)}>
        X
      </button>
      <form onSubmit={form.handleSubmit((data) => {
        onSubmit(data)             // Your custom logic
        form.reset({               // Reset form values
          title: "",
          items: [],
        })
      })}>
        {/* hidden userId */}
        <input type="hidden" name="userId" value={userId}/>
        {/* list title */}
        <input type="text" 
          className="break-words"
          placeholder="Title" 
          {...form.register("title")}
        />
        {/* list items */}
        <div className="flex-col">
          {fields.map((field,index) => (
            // 1 item
            <div key={field.id} className="flex">
              {/* item description */}
              <input type="text" 
                className="overflow-hidden grow break-words"
                placeholder={`Item${index + 1}`} 
                {...form.register(`items.${index}.description`)}
              />
              {/* delete item button */}
              <button type="button" onClick={() => remove(index)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
        {/* add item button */}
        <button type="button" onClick={() => {
          console.log("add clicked!");
          append({ description: "" })
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="6" x2="12" y2="18"></line>
            <line x1="6" y1="12" x2="18" y2="12"></line>
          </svg>
        </button>
        {/* submit button */}
        <button type="submit" onClick={() => console.log("submit clicked!")}>
          Submit
        </button>
      </form>
    </div>
  )
}