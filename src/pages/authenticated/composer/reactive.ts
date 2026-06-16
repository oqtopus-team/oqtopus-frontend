export type ReactiveCallback<T> = (v: T) => void;
export type Unsubscribe = () => void;

export class Reactive<T> {
  private cbs: ReactiveCallback<T>[] = [];
  private _value: T;

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  set value(v: T) {
    if (this._value === v) return;

    this._value = v;
    for (const cb of this.cbs) cb(v);
  }

  subscribe = (callback: ReactiveCallback<T>): Unsubscribe => {
    this.cbs.push(callback);
    return () => {
      this.cbs = this.cbs.filter((cb) => cb !== callback);
    };
  };
}
