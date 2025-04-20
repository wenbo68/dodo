'use client'
import { auth } from '~/server/auth';
import { Suspense } from 'react';
import { getListsWithItems } from '~/lib/db/list-utils';
import { ListWithItems, ListWithItemsView } from '~/types';
import { TodoLists } from '@/components/dashboard/todo-lists';
import { useAddListContext } from '~/lib/utils/list-context';

export default function Page() {

  // const session = await auth(); // Your auth implementation
  // if (!session) return <div>Not authenticated</div>

  // const listsWithItems: ListWithItems[] = await getListsWithItems(session.user.id);
  // const listsWithItemsView: ListWithItemsView[] = listsWithItems.map((list) => ({
  //   id: list.id, // Use the database id
  //   title: list.title,
  //   items: list.items.map((item) => ({
  //     id: item.id,
  //     isComplete: item.isComplete,
  //     description: item.description,
  //   })),
  // }));

  const { isOpen, userId, listsWithItemsView } = useAddListContext();

  return (
    <main className={`grow overflow-y-auto transition-transform duration-300 ${isOpen? "translate-x-64 mr-64": "translate-x-0"}`}>
      <div className='flex items-center justify-center px-10 pb-10'>
        <Suspense fallback={
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[200px] w-[300px] m-2 rounded-lg bg-gray-200 animate-pulse" />
          ))
        }>
          <TodoLists isOpen={isOpen} userId={userId} listsWithItemsView={listsWithItemsView}/>
        </Suspense>
      </div>
    </main>
  );
}