export type Lazy<T> = {
  force: () => T;
}

export const defer = <T>(thunk: () => T): Lazy<T> => (() => {
  let v: T;
  const force = () => {
    if (!v) {
      v = thunk();
      thunk = null as any;
    }
    return v;
  };

  return { force };
})();
