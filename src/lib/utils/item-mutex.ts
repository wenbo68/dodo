class ItemMutex {
  private locks = new Map<number, Promise<void>>(); // Use number as the key type

  async acquire(itemId: number): Promise<() => void> {
    let release: () => void;
    const newLock = new Promise<void>((resolve) => (release = resolve));
    const existingLock = this.locks.get(itemId);

    const lockPromise = existingLock
      ? existingLock.then(() => newLock)
      : newLock;

    this.locks.set(itemId, lockPromise);

    return () => {
      release!();
      if (this.locks.get(itemId) === lockPromise) {
        this.locks.delete(itemId);
      }
    };
  }
}

export const itemMutex = new ItemMutex();