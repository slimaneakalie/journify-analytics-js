import { UserFactoryImpl } from "../user";
import {
  assertValueOnStores,
  createStoresForTest,
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
      const stores = createStoresForTest();
      const { local, cookies, memory } = stores;
      const userId = "user_id_example_local_storage";
      const anonymousId = "68edfd03-cce1-4b95-93b3-9ef7286c89ae_local";
      const traits = {
        email: "user@mail.com",
        clicks: 337,
        location: "Morocco",
      };

      local.set("journifyio_user_id", userId);
      local.set("journifyio_anonymous_id", anonymousId);
      local.set("journifyio_user_traits", traits);

      const factory = new UserFactoryImpl(local, cookies, memory);
      const user = factory.newUser();
      expect(user.getUserId()).toEqual(userId);
      expect(user.getAnonymousId()).toEqual(anonymousId);
      expect(user.getTraits()).toEqual(traits);

      assertValueOnStores(stores, "journifyio_user_id", userId);
      assertValueOnStores(stores, "journifyio_anonymous_id", anonymousId);
      assertValueOnStores(stores, "journifyio_user_traits", traits);
    });

    /* it("Should get the user data from the cookies when it exists", () => {});
     it("Should get the user data from the memory store when it exists", () => {});*/
  });
});

/*describe("User interface", () => {
  describe("identify method", () => {
    it("Should update the user id and traits on the stores", () => {});
    it("Should merge the traits with the previous ones from the stores", () => {});
  });

  describe("getUserId method", () => {
    it("Should return null when there is no user id on different stores", () => {});
    it("Should return the same user id from the stores", () => {});
  });

  describe("getAnonymousId method", () => {
    it("Should not return null for anonymous id", () => {});
  });

  describe("getTraits method", () => {
    it("Should return an empty object when there is no traits on different stores", () => {});
    it("Should return the same traits from the stores", () => {});
  });
});*/