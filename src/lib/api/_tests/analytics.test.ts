import {
  Analytics,
  AnalyticsDependencies,
  AnalyticsSettings,
} from "../analytics";
import { User, UserFactory } from "../../domain/user";
import { EventQueue } from "../../transport/queue";
import {
  UserFactoryMock,
  UserMock,
  UserMockCallbacks,
} from "../../../test/mocks/user";
import { Traits } from "../../domain/traits";
import {
  EventFactoryCallbacks,
  EventFactoryMock,
} from "../../../test/mocks/eventFactory";
import { JournifyEvent } from "../../domain/event";
import {
  EventQueueMock,
  EventQueueMockCallbacks,
} from "../../../test/mocks/eventQueue";
import { Context, ContextFactory } from "../../transport/context";
import {
  ContextFactoryCallbacks,
  ContextFactoryMock,
  ContextMock,
} from "../../../test/mocks/context";

describe("Analytics class", () => {
  describe("identify method", () => {
    it("Should dispatch identify event with the right user data", async () => {
      const initialUserId = "initial-user-id-example";
      const initialAnonymousId = "initial-anonymous-id-example";
      const initialTraits: Traits = {
        email: "example@mail.com",
        location: "Morocco",
      };

      const userIdByClient = "user-id-used-by-client";
      const traitsByClient: Traits = {
        email: "example-15267@maily.net",
        location: "France",
      };
      const userMockCallbacks: UserMockCallbacks = {
        identify: (userId?: string, traits: Traits = {}) => {
          expect(userId).toEqual(userIdByClient);
          expect(traits).toEqual(traitsByClient);
        },
      };

      const user: User = new UserMock(
        initialUserId,
        initialAnonymousId,
        initialTraits,
        userMockCallbacks
      );
      const userFactory: UserFactory = new UserFactoryMock(user);

      const event: JournifyEvent = {
        messageId: "message-id-example",
        type: "identify",
        userId: initialUserId,
        anonymousId: initialAnonymousId,
        traits: initialTraits,
        timestamp: new Date(),
      };
      const eventFactoryCallbacks: EventFactoryCallbacks = {
        newIdentifyEvent: (userParam: User): JournifyEvent => {
          expect(userParam).toEqual(user);
          return event;
        },
      };
      const eventFactory = new EventFactoryMock(eventFactoryCallbacks);

      const ctx: Context = new ContextMock("context-id", event);
      const contextFactoryCallbacks: ContextFactoryCallbacks = {
        newContext: (eventParam: JournifyEvent, id?: string): Context => {
          expect(eventParam).toEqual(event);
          expect(id).toBeUndefined();
          return ctx;
        },
      };
      const contextFactory = new ContextFactoryMock(contextFactoryCallbacks);

      const eventQueueCallbacks: EventQueueMockCallbacks = {
        deliver: (ctxParam: Context): Promise<Context> => {
          expect(ctxParam).toEqual(ctx);
          return Promise.resolve(ctx);
        },
      };
      const eventQueue: EventQueue = new EventQueueMock(eventQueueCallbacks);

      const deps: AnalyticsDependencies = {
        userFactory,
        eventFactory,
        contextFactory,
        eventQueue,
      };

      const settings: AnalyticsSettings = {
        writeKey: "WRITE_KEY_EXAMPLE",
        apiHost: "API_HOST_EXAMPLE",
      };

      const analytics = new Analytics(settings, deps);
      const deliveredCtx = await analytics.identify(
        userIdByClient,
        traitsByClient
      );

      expect(deliveredCtx).toEqual(ctx);
    });
  });
});
