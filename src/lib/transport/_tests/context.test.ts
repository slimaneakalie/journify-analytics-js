import { v4 as uuid } from "@lukeed/uuid";
import { ContextFactoryImpl, ContextFailedDelivery } from "../context";
import { JournifyEvent } from "../../domain/event";

describe("ContextFactoryImpl class", () => {
  describe("newContext method", () => {
    it("Should create a context with a specific event and a specific id", () => {
      const factory = new ContextFactoryImpl();
      const id = uuid();
      const event: JournifyEvent = {
        type: "identify",
      };
      const ctx = factory.newContext(event, id);
      expect(ctx).toBeDefined();
      expect(ctx.getId()).toEqual(id);
      expect(ctx.getEvent()).toEqual(event);
    });

    it("Should generate an id if it's not passed by the user", () => {
      const factory = new ContextFactoryImpl();
      const event: JournifyEvent = {
        type: "screen",
      };
      const ctx = factory.newContext(event);
      expect(ctx).toBeDefined();
      expect(ctx.getEvent()).toEqual(event);
      const actualId = ctx.getId();
      expect(actualId).toBeDefined();
      expect(actualId.length).toBeGreaterThan(0);
    });
  });

  describe("Context interface", () => {
    describe("getEvent method", () => {
      it("Should get the context event using getEvent method", () => {
        const factory = new ContextFactoryImpl();
        const event: JournifyEvent = {
          messageId: uuid(),
          type: "track",
          userId: "user-id-example",
          anonymousId: "anonymous-id-example",
          traits: {
            email: "user@gmail.com",
            location: "Morocco",
          },
          timestamp: new Date(),
          context: {
            userAgent:
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
            library: {
              name: "@journify/analytics",
              version: "1.0.0",
            },
            locale: "en-US",
          },
        };

        const ctx = factory.newContext(event);
        expect(ctx).toBeDefined();
        expect(ctx.getEvent()).toEqual(event);
      });
    });
    describe("isSame method", () => {
      it("Should return true when the two contexts have the same id", () => {
        const factory = new ContextFactoryImpl();
        const id1 = uuid();

        const event: JournifyEvent = {
          type: "track",
        };
        const ctx1 = factory.newContext(event, id1);
        const ctx2 = factory.newContext(event, id1);
        expect(ctx1.isSame(ctx2)).toBeTruthy();
      });

      it("Should return false when the two contexts don't have the same id", () => {
        const factory = new ContextFactoryImpl();
        const event: JournifyEvent = {
          type: "track",
        };

        const id1 = uuid();
        const ctx1 = factory.newContext(event, id1);

        const id2 = uuid();
        const ctx2 = factory.newContext(event, id2);
        expect(ctx1.isSame(ctx2)).toBeFalsy();
      });
    });

    describe("setFailedDelivery method", () => {
      it("Should set the failed delivery context", () => {
        const factory = new ContextFactoryImpl();
        const event: JournifyEvent = {
          type: "track",
        };
        const ctx = factory.newContext(event);

        const failedDeliveryCtx: ContextFailedDelivery = {
          reason: "failure reason example",
        };
        ctx.setFailedDelivery(failedDeliveryCtx);

        expect(ctx.getFailedDelivery()).toEqual(failedDeliveryCtx);
      });
    });

    describe("getFailedDelivery method", () => {
      it("Should return null when the context doesn't have a failed delivery", () => {
        const factory = new ContextFactoryImpl();
        const event: JournifyEvent = {
          type: "track",
        };
        const ctx = factory.newContext(event);
        expect(ctx.getFailedDelivery()).toBeNull();
      });
    });
  });
});
