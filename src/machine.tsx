import { Machine, StateSchema, assign } from "xstate"
import { T9, clone } from "./utils"

interface T9Schema extends StateSchema {
  states: {
    idle: {}
    typing: {}
  }
}

export type T9Event = { type: "PRESS"; data: string } | { type: "BACKSPACE" }

export type T9Context = {
  message: string
  candidate: string | null
  pressCount: number
  buttons: typeof T9["buttons"]
}

export const T9Machine = Machine<T9Context, T9Schema, T9Event>(
  {
    id: "T9",
    initial: "idle",
    context: {
      message: "",
      pressCount: 0,
      candidate: null,
      buttons: clone(T9.buttons)
    },
    states: {
      idle: {
        on: {
          PRESS: { target: "typing", actions: "setCandidate" },
          BACKSPACE: {
            actions: assign({
              message: (c) => c.message.slice(0, c.message.length - 1)
            })
          }
        },
        entry: "setMessage"
      },
      typing: {
        after: {
          1000: {
            target: "idle"
          }
        },
        on: {
          PRESS: {
            // reset the timer
            target: "typing",
            actions: "setCandidate"
          },
          BACKSPACE: {
            target: "idle",
            actions: assign<T9Context, T9Event>({
              candidate: null
            })
          }
        }
      }
    }
  },
  {
    actions: {
      setCandidate: assign((c, e) => {
        switch (e.type) {
          case "PRESS": {
            const button = clone(
              c.buttons.find((b) => T9.primary(b) === e.data)
            )
            const data = T9.numberLast(button)
            const changedButtons = c.candidate && !data.includes(c.candidate)

            if (changedButtons) {
              return {
                message: `${c.message}${c.candidate}`,
                pressCount: 1,
                candidate: data[0]
              }
            }

            return {
              pressCount: c.pressCount + 1,
              candidate: data[c.pressCount % data.length]
            }
          }
          default:
            return {}
        }
      }),
      setMessage: assign<T9Context, T9Event>({
        message: (c) =>
          c.candidate ? `${c.message}${c.candidate}` : c.message,
        candidate: null,
        pressCount: 0
      })
    }
  }
)
