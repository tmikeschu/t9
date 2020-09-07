import React from "react"
import {
  render,
  RenderResult,
  fireEvent,
  cleanup
} from "@testing-library/react"
import { Machine } from "xstate"
import { createModel } from "@xstate/test"
import App from "../App"

describe("<App />", () => {
  const machine = Machine({
    id: "AppTest",
    states: {
      idle: {
        on: {
          PRESS: "typing"
        },
        meta: {
          test: (result: RenderResult) => {
            const { getByText } = result
            expect(getByText("That sweet t9 life")).toBeTruthy()
          }
        }
      },
      typing: {
        after: {
          1000: "idle"
        },
        meta: {
          test: ({ getByText }: RenderResult) => {
            expect(getByText(".")).toBeTruthy()
          }
        }
      }
    }
  })
  const testModel = createModel(machine, {
    events: {
      PRESS: (result: RenderResult) => {
        const { getByText } = result
        fireEvent.click(getByText("1"))
      }
    }
  })
  testModel.getSimplePathPlans().forEach((plan) => {
    describe(plan.description, () => {
      afterEach(cleanup)
      plan.paths.forEach((path) => {
        it(path.description, () => {
          return path.test(render(<App />))
        })
      })
    })
  })

  it("coverage", () => {
    testModel.testCoverage()
  })
})
