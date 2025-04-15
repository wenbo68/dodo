function throttle<Args extends unknown[], Return>(
  func: (...args: Args) => Return,
  limit: number
): (...args: Args) => void {
  let inThrottle = false;
  let lastArgs: Args | null = null;
  let lastThis: unknown = null;

  return function (this: unknown, ...args: Args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs && lastThis) {
          func.apply(lastThis, lastArgs);
          lastArgs = null;
          lastThis = null;
        }
      }, limit);
    } else {
      lastArgs = args;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      lastThis = this;
    }
  };
}

export default throttle;
