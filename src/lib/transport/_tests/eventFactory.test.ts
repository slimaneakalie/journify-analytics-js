import { EventFactoryImpl } from "../eventFactory";
import { UserMock } from "../../../test/mocks/user";
import { User } from "../../domain/user";
import { Traits } from "../../domain/traits";
import { ExternalId, JournifyEvent } from "../../domain/event";
import { LIB_VERSION } from "../../generated/libVersion";
import { StoresGroup } from "../../store/store";
import { createStoresForTest } from "../../../test/helpers/stores";

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

      const canonicalUrl = "http://www.journify.io";
      const pathname = "/blog/tech";
      const referrer = "https://www.google.com/";
      const title = "Page title example";

      global.document = {
        referrer,
        title,
        querySelector: (query: string) => {
          expect(query).toEqual("link[rel='canonical']");
          return {
            getAttribute(qualifiedName: string): string | null {
              expect(qualifiedName).toEqual("href");
              return canonicalUrl;
            },
          };
        },
        createElement: (elementType: string) => {
          expect(elementType).toEqual("a");
          return {
            pathname,
          };
        },
        ...global.document,
      };

      const sq =
        "?utm_source=campaign-source-123&utm_medium=campaign-medium-123&utm_campaign=campaign-name-123&utm_id=campaign-id-123&utm_term=campaign-term-123&utm_content=campaign-content-123";
      global.location = {
        search: sq,
        ...global.location,
      };

      const initialUserId = "initial-user-id-example";
      const initialAnonymousId = "initial-anonymous-id-example";
      const initialTraits: Traits = {
        email: "example@mail.com",
        location: "Morocco",
      };
      const initialExternalId: ExternalId = {
        id: "joe-doe",
        type: "username",
        collection: "accounts",
      };

      const user: User = new UserMock(
        initialUserId,
        initialAnonymousId,
        initialTraits,
        initialExternalId,
        {}
      );

      const testStores = createStoresForTest();
      const stores = new StoresGroup(
        testStores.local,
        testStores.cookies,
        testStores.memory
      );
      const eventFactory = new EventFactoryImpl(stores);
      eventFactory.setUser(user);

      const actualEvent = eventFactory.newIdentifyEvent();
      const expectedEvent: JournifyEvent = {
        type: "identify" as const,
        userId: initialUserId,
        groupId: null,
        anonymousId: initialAnonymousId,
        traits: initialTraits,
        externalId: initialExternalId,
        context: {
          userAgent,
          locale,
          library: {
            name: "@journifyio/analytics.js",
            version: LIB_VERSION,
          },
          page: {
            url: `${canonicalUrl}${sq}`,
            path: pathname,
            search: sq,
            referrer,
            title,
          },
          campaign: {
            id: "campaign-id-123",
            name: "campaign-name-123",
            source: "campaign-source-123",
            medium: "campaign-medium-123",
            term: "campaign-term-123",
            content: "campaign-content-123",
          },
        },
      };

      const dynamicKeys = ["timestamp", "messageId"];
      const expectedKeysLength =
        Object.keys(expectedEvent).length + dynamicKeys.length;
      expect(Object.keys(actualEvent)).toHaveLength(expectedKeysLength);

      for (const key in actualEvent) {
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
