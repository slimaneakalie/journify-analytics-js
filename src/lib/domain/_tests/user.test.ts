import { v4 as uuid } from "@lukeed/uuid";
import { UserFactoryImpl } from "../user";
import {
  assertValueOnStores,
  createStoresForTest,
  TestStores,
} from "../../../test/helpers/stores";

describe("UserFactoryImpl class", () => {
  describe("newUser method", () => {
    it("Should create a user and persist its data if the stores are empty", () => {
      const stores = createStoresForTest();
      const { local, cookies, memory } = stores;
      const factory = new UserFactoryImpl(local, cookies, memory);
      const user = factory.newUser();

      expect(user).toBeDefined();
      expect(user.getUserId()).toBeNull();
      expect(user.getTraits()).toEqual({});

      const anonymousId = user.getAnonymousId();
      expect(anonymousId).toBeDefined();
      expect(anonymousId.length).toBeGreaterThan(0);

      assertValueOnStores(stores, "journifyio_anonymous_id", anonymousId);
      assertValueOnStores(stores, "journifyio_user_traits", {});
    });

    it("Should get the user data from the local storage when it exists", () => {
      testFetchUserDataFromStore("local");
    });

    it("Should get the user data from the cookies when it exists", () => {
      testFetchUserDataFromStore("cookies");
    });

    it("Should get the user data from the memory store when it exists", () => {
      testFetchUserDataFromStore("memory");
    });
  });
});

describe("User interface", () => {
  describe("identify method", () => {
    it("Should update the user id and traits on the stores", () => {
      const stores = createStoresForTest();
      const { local, cookies, memory } = stores;

      const oldUserId = "1567893";
      const oldTraits = { email: "user-1@gmail.com" };
      local.set("journifyio_user_id", oldUserId);
      cookies.set("journifyio_user_traits", oldTraits);

      const factory = new UserFactoryImpl(local, cookies, memory);
      const user = factory.newUser();
      const newUserId = "138738937";
      const newTraits = {
        email: "user-2@mail.com",
        clicks: 337,
        location: "Morocco",
        unique: uuid(),
      };

      expect(newUserId).not.toEqual(oldUserId);
      expect(newTraits).not.toEqual(oldTraits);

      user.identify(newUserId, newTraits);

      assertValueOnStores(stores, "journifyio_user_id", newUserId);
      assertValueOnStores(stores, "journifyio_user_traits", newTraits);
    });

    it("Should merge the traits with the previous ones from the stores", () => {
      const stores = createStoresForTest();
      const { local, cookies, memory } = stores;

      const oldTraits = { email: "user-10@gmail.com" };
      local.set("journifyio_user_traits", oldTraits);

      const factory = new UserFactoryImpl(local, cookies, memory);
      const user = factory.newUser();

      const newTraits = {
        clicks: 337,
        location: "Morocco",
      };
      user.identify(null, newTraits);

      const expectedStoredTraits = {
        email: "user-10@gmail.com",
        clicks: 337,
        location: "Morocco",
      };

      assertValueOnStores(
        stores,
        "journifyio_user_traits",
        expectedStoredTraits
      );
    });
  });

  describe("getUserId method", () => {
    it("Should return null when there is no user id on different stores", () => {
      const { local, cookies, memory } = createStoresForTest();
      const factory = new UserFactoryImpl(local, cookies, memory);
      const user = factory.newUser();
      expect(user.getUserId()).toBeNull();
    });
  });

  describe("getAnonymousId method", () => {
    it("Should not return null for anonymous id", () => {
      const { local, cookies, memory } = createStoresForTest();
      const factory = new UserFactoryImpl(local, cookies, memory);
      const user = factory.newUser();
      const anonymousId = user.getAnonymousId();
      expect(anonymousId).toBeDefined();
      expect(anonymousId.length).toBeGreaterThan(0);
    });
  });

  describe("getTraits method", () => {
    it("Should return an empty object when there is no traits on different stores", () => {
      const { local, cookies, memory } = createStoresForTest();
      const factory = new UserFactoryImpl(local, cookies, memory);
      const user = factory.newUser();
      expect(user.getTraits()).toEqual({});
    });
  });
});

function testFetchUserDataFromStore(storeKey: keyof TestStores) {
  const stores = createStoresForTest();
  const { local, cookies, memory } = stores;
  const userId = "user_id_example_store";
  const anonymousId = uuid();
  const traits = {
    email: "user@mail.com",
    clicks: 337,
    location: "Morocco",
    unique: uuid(),
  };

  stores[storeKey].set("journifyio_user_id", userId);
  stores[storeKey].set("journifyio_anonymous_id", anonymousId);
  stores[storeKey].set("journifyio_user_traits", traits);

  const factory = new UserFactoryImpl(local, cookies, memory);
  const user = factory.newUser();
  expect(user.getUserId()).toEqual(userId);
  expect(user.getAnonymousId()).toEqual(anonymousId);
  expect(user.getTraits()).toEqual(traits);

  assertValueOnStores(stores, "journifyio_user_id", userId);
  assertValueOnStores(stores, "journifyio_anonymous_id", anonymousId);
  assertValueOnStores(stores, "journifyio_user_traits", traits);
}
