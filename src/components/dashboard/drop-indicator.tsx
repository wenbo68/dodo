export function ListDropIndicator({
  // isPinned,
  listId,
}: {
  // isPinned: boolean;
  listId: string;
}) {
  return (
    <div
      // data-drop-pinned={isPinned}
      data-drop-list-id={listId}
      className="mx-1 border-2 border-blue-500 opacity-0"
    />
  );
}

export function ItemDropIndicator({
  // listId,
  itemId,
}: {
  // listId: string;
  itemId: string;
}) {
  return (
    <div
      // data-drop-list-id={listId}
      data-drop-item-id={itemId}
      className="border border-blue-500 opacity-0"
    />
  );
}
