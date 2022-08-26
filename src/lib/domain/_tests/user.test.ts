import { v4 as uuid } from "@lukeed/uuid";
import { UserFactoryImpl } from "../user";
import {
  assertValueOnStores,
  createStoresForTest,
  TestStores,
} from "../../../test/helpers/stores";
import { StoresGroup } from "../../store/store";

describe("UserFactoryImpl class", () => {
  describe("newUser method", () => {
    it("Should create a user and persist its data if the stores are empty", () => {
      const testStores = createStoresForTest();
      const stores = new StoresGroup(
        testStores.local,
        testStores.cookies,
        testStores.memory
      );
      const factory = new UserFactoryImpl(stores);
      const user = factory.loadUser();

      expect(user).toBeDefined();
      expect(user.getUserId()).toBeNull();
      expect(user.getTraits()).toEqual({});

      const anonymousId = user.getAnonymousId();
      expect(anonymousId).toBeDefined();
      expect(anonymousId.length).toBeGreaterThan(0);

      assertValueOnStores(testStores, "journifyio_anonymous_id", anonymousId);
      assertValueOnStores(testStores, "journifyio_user_traits", {});
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
      const testStores = createStoresForTest();
      const stores = new StoresGroup(
        testStores.local,
        testStores.cookies,
        testStores.memory
      );

      const oldUserId = "1567893";
      const oldTraits = { email: "user-1@gmail.com" };
      testStores.local.set("journifyio_user_id", oldUserId);
      testStores.cookies.set("journifyio_user_traits", oldTraits);

      const factory = new UserFactoryImpl(stores);
      const user = factory.loadUser();
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

      assertValueOnStores(testStores, "journifyio_user_id", newUserId);
      assertValueOnStores(testStores, "journifyio_user_traits", newTraits);
    });

    it("Should replace the previous traits by the new ones on the stores", () => {
      const testStores = createStoresForTest();
      const stores = new StoresGroup(
        testStores.local,
        testStores.cookies,
        testStores.memory
      );

      const oldTraits = { email: "user-10@gmail.com" };
      testStores.local.set("journifyio_user_traits", oldTraits);

      const factory = new UserFactoryImpl(stores);
      const user = factory.loadUser();

      const newTraits = {
        clicks: 337,
        location: "Morocco",
      };
      user.identify(null, newTraits);

      const expectedStoredTraits = {
        clicks: 337,
        location: "Morocco",
      };

      assertValueOnStores(
        testStores,
        "journifyio_user_traits",
        expectedStoredTraits
      );
    });
  });

  describe("getUserId method", () => {
    it("Should return null when there is no user id on different stores", () => {
      const { local, cookies, memory } = createStoresForTest();
      const stores = new StoresGroup(local, cookies, memory);
      const factory = new UserFactoryImpl(stores);
      const user = factory.loadUser();
      expect(user.getUserId()).toBeNull();
    });
  });

  describe("getAnonymousId method", () => {
    it("Should not return null for anonymous id", () => {
      const { local, cookies, memory } = createStoresForTest();
      const stores = new StoresGroup(local, cookies, memory);
      const factory = new UserFactoryImpl(stores);
      const user = factory.loadUser();
      const anonymousId = user.getAnonymousId();
      expect(anonymousId).toBeDefined();
      expect(anonymousId.length).toBeGreaterThan(0);
    });
  });

  describe("getTraits method", () => {
    it("Should return an empty object when there is no traits on different stores", () => {
      const { local, cookies, memory } = createStoresForTest();
      const stores = new StoresGroup(local, cookies, memory);
      const factory = new UserFactoryImpl(stores);
      const user = factory.loadUser();
      expect(user.getTraits()).toEqual({});
    });
  });
});

function testFetchUserDataFromStore(storeKey: keyof TestStores) {
  const testStores = createStoresForTest();
  const userId = "user_id_example_store";
  const anonymousId = uuid();
  const traits = {
    email: "user@mail.com",
    clicks: 337,
    location: "Morocco",
    unique: uuid(),
  };

  testStores[storeKey].set("journifyio_user_id", userId);
  testStores[storeKey].set("journifyio_anonymous_id", anonymousId);
  testStores[storeKey].set("journifyio_user_traits", traits);

  const stores = new StoresGroup(
    testStores.local,
    testStores.cookies,
    testStores.memory
  );
  const factory = new UserFactoryImpl(stores);
  const user = factory.loadUser();
  expect(user.getUserId()).toEqual(userId);
  expect(user.getAnonymousId()).toEqual(anonymousId);
  expect(user.getTraits()).toEqual(traits);

  assertValueOnStores(testStores, "journifyio_user_id", userId);
  assertValueOnStores(testStores, "journifyio_anonymous_id", anonymousId);
  assertValueOnStores(testStores, "journifyio_user_traits", traits);
}
