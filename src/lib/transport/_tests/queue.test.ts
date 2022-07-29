import {
  PriorityQueueMock,
  PriorityQueueMockFuncs,
} from "../../../test/mocks/priorityQueue";
import { Context } from "../context";
import { isOnline } from "../utils";

describe("EventQueueImpl class", () => {
  describe("deliver method", () => {
    it("Should resolve the context if all plugin ran successfully", function () {
      const ops: Context[] = [];
      const pQueueFuncs: PriorityQueueMockFuncs = {
        push: jest.fn(() => ops.push(...ops)),
        pop: jest.fn(() => ops.shift()),
        isEmpty: jest.fn(() => ops.length == 0),
      };

      global.navigator = {
        onLine: true,
        ...global.navigator,
      };
      // const pQueueMock = new PriorityQueueMock(pQueueFuncs);
      console.log("isOnline(): ", isOnline());
    });

    // it("Should add a failed delivery context if a plugin encountered some errors", function () {});
  });
});
