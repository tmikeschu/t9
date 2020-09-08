import React from "react";
import * as utils from "@testing-library/react";
import user from "@testing-library/user-event";
import { RenderResult } from "@testing-library/react";
import { Machine } from "xstate";
import { createModel } from "@xstate/test";
import App from "../App";

const { render, cleanup } = utils;

describe("<App />", () => {
  const machine = Machine({
    id: "AppTest",
    initial: "idle",
    states: {
      idle: {
        on: {
          PRESS: "typing",
          DELETE: "deleting",
        },
        meta: {
          test: (result: RenderResult) => {
            const { getByText } = result;
            expect(getByText("That sweet t9 life")).toBeTruthy();
          },
        },
      },
      typing: {
        after: {
          1000: "idle",
        },
        meta: {
          test: async ({ getByTestId }: RenderResult) => {
            const message = getByTestId("message");
            expect(message.textContent).toBeTruthy();
          },
        },
      },
      deleting: {
        after: {
          1000: "idle",
        },
        meta: {
          test: ({ getByTestId }: RenderResult) => {
            const message = getByTestId("message");
            expect(message.textContent).toBeFalsy();
          },
        },
      },
    },
  });

  const typeKey = (node: HTMLElement, count = 1): void => {
    for (let x = 0; x < count; x++) {
      user.click(node);
    }
  };
  const testModel = createModel<RenderResult>(machine).withEvents({
    PRESS: async ({ getByText, getByTestId }) => {
      ([
        ["4", 2], // h
        ["3", 2], // e
        ["9", 3], // y
        ["1", 3], // !
      ] as const).forEach(([key, count]) => typeKey(getByText(key), count));

      const message = getByTestId("message");
      await utils.waitFor(() =>
        expect(utils.getByText(message, "hey!")).toBeTruthy()
      );

      user.click(getByTestId("backspace"));
      expect(utils.queryByText(message, "hey!")).toBeNull();
    },
    DELETE: async ({ getByTestId, getByText }) => {
      const message = getByTestId("message");
      const counts = [
        ["9", 1],
        ["2", 1],
        ["8", 1],
      ] as const;
      counts.forEach(([key, count]) => {
        typeKey(getByText(key), count);
      });
      await utils.waitFor(() => utils.getByText(message, "wat"));

      counts.forEach(() => {
        user.click(getByTestId("backspace"));
      });
    },
  });

  testModel.getSimplePathPlans().forEach((plan) => {
    describe(plan.description, () => {
      afterEach(cleanup);

      plan.paths.forEach((path) => {
        it(path.description, () => {
          return path.test(render(<App />));
        });
      });
    });
  });

  it("coverage", () => {
    testModel.testCoverage();
  });
});
