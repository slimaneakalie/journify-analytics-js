import { MemoryStore } from "./memoryStore";

export class NullStore extends MemoryStore {
  public get = (_key: string): null => null;
  public set = (_key: string, _val: unknown): null => null;
  public remove = (_key: string): void => {};
}
