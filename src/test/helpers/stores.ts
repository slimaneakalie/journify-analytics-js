import { Store } from "../../lib/store/store";
import { MemoryStore } from "../../lib/store/memoryStore";

export interface TestStores {
  local: Store;
  cookies: Store;
  memory: Store;
}

export function createStoresForTest(): TestStores {
  return {
    local: new MemoryStore(),
    cookies: new MemoryStore(),
    memory: new MemoryStore(),
  };
}

export function assertValueOnStores<T>(
  stores: TestStores,
  key: string,
  value: T
) {
  expect(stores.local.get(key)).toEqual(value);
  expect(stores.cookies.get(key)).toEqual(value);
  expect(stores.memory.get(key)).toEqual(value);
}
