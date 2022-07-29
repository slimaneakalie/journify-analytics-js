export interface Emitter {
  on(event: string, callback: Function): Emitter;
  once(event: string, fn: Function): Emitter;
  off(event: string, callback: Function): Emitter;
  emit(event: string, ...args: unknown[]): Emitter;
}

export class EmitterImpl implements Emitter {
  private callbacks: Record<string, Function[]> = {};

  public on(event: string, callback: Function): this {
    this.callbacks[event] = [...(this.callbacks[event] ?? []), callback];
    return this;
  }

  public once(event: string, fn: Function): this {
    const on = (...args: unknown[]): void => {
      this.off(event, on);
      fn.apply(this, args);
    };

    this.on(event, on);
    return this;
  }

  public off(event: string, callback: Function): this {
    const fns = this.callbacks[event] ?? [];
    const without = fns.filter((fn) => fn !== callback);
    this.callbacks[event] = without;
    return this;
  }

  public emit(event: string, ...args: unknown[]): this {
    const callbacks = this.callbacks[event] ?? [];
    callbacks.forEach((callback) => {
      callback.apply(this, args);
    });
    return this;
  }
}
