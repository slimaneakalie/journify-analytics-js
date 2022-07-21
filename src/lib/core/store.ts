export class Store {
  private cache: Record<string, unknown> = {};

  get<T>(key: string): T | null {
    return this.cache[key] as T | null;
  }

  set<T>(key: string, value: T | null): T | null {
    this.cache[key] = value;
    return value;
  }

  remove(key: string): void {
    delete this.cache[key];
  }
}
