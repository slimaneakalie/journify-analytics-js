import {
  PriorityQueueMock,
  PriorityQueueMockFuncs,
} from "../../../test/mocks/priorityQueue";
import { Context } from "../context";
import { EventQueueImpl } from "../queue";
import { JPlugin } from "../plugins/plugin";
import { ContextMock } from "../../../test/mocks/context";
import { JPluginMock, JPluginMockFuncs } from "../../../test/mocks/plugin";

describe("EventQueueImpl class", () => {
  describe("deliver method", () => {
    it("Should resolve the context if all plugin ran successfully", async () => {
      const ops: Context[] = [];
      const pQueueFuncs: PriorityQueueMockFuncs = {
        push: jest.fn((...opsParams) => ops.push(...opsParams)),
        pop: jest.fn(() => ops.shift()),
        isEmpty: jest.fn(() => ops.length === 0),
      };

      global.navigator = {
        onLine: true,
        ...global.navigator,
      };

      const pQueueMock = new PriorityQueueMock<Context>(pQueueFuncs);

      const pluginFuncs: JPluginMockFuncs = {
        identify: jest.fn((ctxParam: Context) => Promise.resolve(ctxParam)),
      };
      const pluginMock: JPlugin = new JPluginMock(pluginFuncs);

      const eventQueue = new EventQueueImpl([pluginMock], pQueueMock);

      const eventCtx = new ContextMock("event-queue-ctx-id-example-1", {
        type: "identify",
      });

      const deliveredCtx = await eventQueue.deliver(eventCtx);

      expect(deliveredCtx).toEqual(eventCtx);
      expect(pQueueFuncs.push).toBeCalledTimes(1);
      expect(pQueueFuncs.pop).toBeCalledTimes(1);
      expect(pQueueFuncs.isEmpty).toBeCalledTimes(1);
      expect(pluginFuncs.identify).toBeCalledTimes(1);
      expect(pluginFuncs.identify).toBeCalledWith(eventCtx);
    });

    // it("Should add a failed delivery context if a plugin encountered some errors", function () {});

    // it("Should process event on the queue, when an ON_OPERATION_DELAY_FINISH event is sent from the priority queue", function () {});
  });
});
