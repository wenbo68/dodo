## Stack: T3

1. Deployment: vercel
2. Database: neon, drizzle
3. Auth: nextauth, google/github oauth
4. Backend: nextjs, typescript
5. Frontend: tailwind
6. Cache: tanstackQuery

---

## Pending Features

1. mobile dnd (hold and drag)
2. add hierarchy to items
3. add animations for better touch/click feedback
4. add search functionality
5. when moving list to different grid or when moving item to different list, give option to drop or copy to new location
6. infinite scrolling?
7. client side db (eg indexedDB) for complete offline solution (sync with server side db when connected to internet)
8. able to adjust sidebar width/height

---

## Solutions

1. Can users work on optimistic lists/items before backend addMutation finishes?
   A: Yes. The frontend generates a uuid for the optimistic lists/items, and subsequent mutations on the optimistic (and the real) lists/items use that uuid.
2. Then what about race conditions of mutations on optimistic lists/items? For example, 2nd mutation arrives to db earlier than 1st mutation, causing db and ui to show different things or causing the 2nd mutation to fail.
   A: Race conditions can happen. Regarding db and ui differences, when mutations are settled, all client cache are invalidated and refetched to keep ui and db consistent. Regarding a later mutation failing due to arrive at db earlier than it should, tanstack query automatically retries failed mutations (thrice i believe).
