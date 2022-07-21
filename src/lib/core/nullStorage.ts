import { Store } from "./store";

class NullStorage extends Store {
  get = (_key: string): null => null;
  set = (_key: string, _val: unknown): null => null;
  remove = (_key: string): void => {};
}
