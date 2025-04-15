'use client'
import { useState, useRef, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { addListWithItems } from '~/lib/db/list-actions'
import { listFormSchema } from '~/types'

export default function AddList({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof listFormSchema>>({
    resolver: zodResolver(listFormSchema),
    defaultValues: {
      title: "",
      items: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  })

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    // Close sidebar when pressing Escape key
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (open && event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
    
    // Prevent body scrolling when sidebar is open
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = ''
    }
  }, [open])

  async function onSubmit(values: z.infer<typeof listFormSchema>) {
    try {
      await addListWithItems({
        userId,
        title: values.title,
        items: values.items
      })
      
      form.reset()
      setOpen(false)
    } catch (error) {
      console.log(`Failed to create list. Error: ${String(error)}`)
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium transition-colors border rounded-md whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-input bg-background hover:bg-accent hover:text-accent-foreground"
      >
        Add list
      </button>
      
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
      )}
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Add New List</h2>
          <button 
            type="button" 
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto h-[calc(100%-64px)]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" name="userId" value={userId} />
            
            {/* List Title */}
            <div className="space-y-2">
              {/* <label 
                htmlFor="title" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                List Title
              </label> */}
              <input
                id="title"
                type="text"
                placeholder="List Title"
                className="flex w-full h-12 px-3 py-2 text-base border-0 rounded-md border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500 font-sm">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Items Section */}
            <div className="ml-6 space-y-2">
              {/* <label className="text-sm font-medium leading-none">
                List Items
              </label> */}
              
              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto p-1">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-10 h-10 border-0 rounded-md border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => remove(index)}
                      // disabled={fields.length === 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder={`Item ${index + 1}`}
                        className="flex w-full h-10 px-3 py-2 text-sm border-0 rounded-md border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...form.register(`items.${index}.description`)}
                      />
                      {form.formState.errors.items?.[index]?.description && (
                        <p className="text-sm text-red-500 font-sm">
                          {form.formState.errors.items[index]?.description?.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {/* Add Item Button */}
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-10 h-10 px-4 py-2 text-sm font-medium transition-colors border rounded-md whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  onClick={() => append({ description: "" })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="6" x2="12" y2="18"></line>
                    <line x1="6" y1="12" x2="18" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="inline-flex items-center justify-center w-auto h-10 px-4 py-2 text-sm transition-colors rounded-md font-sm whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create List
            </button>
          </form>
        </div>
      </div>
    </>
  )
}