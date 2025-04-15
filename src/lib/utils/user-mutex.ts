
class UserMutex {
  private locks = new Map<string, Promise<void>>();

  async acquire(userId: string, timeout = 5000): Promise<() => void> {
    let release: () => void;
    const newLock = new Promise<void>((resolve) => (release = resolve));
    const existingLock = this.locks.get(userId);
  
    const lockPromise = existingLock
      ? existingLock.then(() => newLock)
      : newLock;
  
    this.locks.set(userId, lockPromise);
  
    if (existingLock) {
      await Promise.race([
        existingLock,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Lock acquisition timed out")), timeout)
        ),
      ]);
    }
  
    return () => {
      release!();
      if (this.locks.get(userId) === lockPromise) {
        this.locks.delete(userId);
      }
    };
  }
  
}

export const userMutex = new UserMutex();