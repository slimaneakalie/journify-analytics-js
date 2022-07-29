import { EventFactoryImpl } from "../eventFactory";
import { UserMock, UserMockFuncs } from "../../../test/mocks/user";
import { User } from "../../domain/user";
import { Traits } from "../../domain/traits";
import { JournifyEvent } from "../../domain/event";
import { LIB_VERSION } from "../../generated/libVersion";

describe("EventFactoryImpl class", () => {
  describe("newIdentifyEvent method", () => {
    it("Should create an identify event and add context enrichment automatically", function () {
      const userAgent =
        "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";
      const locale = "Fr-Fr";

      global.navigator = {
        userAgent,
        language: locale,
        ...global.navigator,
      };

      const initialUserId = "initial-user-id-example";
      const initialAnonymousId = "initial-anonymous-id-example";
      const initialTraits: Traits = {
        email: "example@mail.com",
        location: "Morocco",
      };
      const user: User = new UserMock(
        initialUserId,
        initialAnonymousId,
        initialTraits,
        {}
      );

      const eventFactory = new EventFactoryImpl();

      const actualEvent = eventFactory.newIdentifyEvent(user);
      const expectedEvent: JournifyEvent = {
        type: "identify" as const,
        userId: initialUserId,
        anonymousId: initialAnonymousId,
        traits: initialTraits,
        context: {
          userAgent,
          locale,
          library: {
            name: "@journifyio/analytics.js",
            version: LIB_VERSION,
          },
        },
      };

      const dynamicKeys = ["timestamp", "messageId"];
      const expectedKeysLength =
        Object.keys(expectedEvent).length + dynamicKeys.length;
      expect(Object.keys(actualEvent)).toHaveLength(expectedKeysLength);

      for (let key in actualEvent) {
        if (dynamicKeys.includes(key)) {
          expect(actualEvent[key]).toBeDefined();
          expect(actualEvent[key]).not.toBeNull();
        } else {
          expect(actualEvent[key]).toEqual(expectedEvent[key]);
        }
      }
    });
  });
});
