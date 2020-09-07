import { inspect } from "@xstate/inspect"

import * as React from "react"
import { css, cx } from "emotion"
import { useThemeSwitch, useTheme } from "./theme"
import { Brightness3, Brightness5, Backspace } from "@material-ui/icons"
import { T9Machine, T9Context, T9Event } from "./machine"
import { useMachine } from "@xstate/react"
import { motion } from "framer-motion"
import { T9 as T9Utils } from "./utils"

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false // open in new window
})

const T9: React.FC = () => {
  const theme = useTheme()
  const [current, send] = useMachine<T9Context, T9Event>(T9Machine, {
    devTools: true
  })
  const { buttons, message, candidate } = current.context

  const styles = {
    button: css`
      display: flex;
      cursor: pointer;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 2px solid ${theme.primary};
      border-radius: 50%;
      width: 10vmin;
      height: 10vmin;
      font-size: 2vmin;

      background-color: ${theme.background};
      color: ${theme.body};

      h3 {
        font-size: 4vmin;
      }
    `
  } as const

  const onClick = (buttonIndex: string) => {
    send({ type: "PRESS", data: buttonIndex })
  }

  return (
    <div
      className={css`
        border: 2px solid ${theme.primary};
        display: inline-block;
        padding: 4vmin;
      `}
    >
      <div
        className={css`
          width: 100%;
          height: auto;
          border: 2px solid ${theme.primary};
          margin-bottom: 2rem;
          padding: 1rem;
          font-size: 3vmin;
          display: flex;
          align-items: flex-end;
        `}
      >
        <span
          className={css`
            white-space: pre;
          `}
        >
          {message}
        </span>
        <span
          className={css`
            white-space: pre;
            position: relative;
            width: 0.5em;
            &:after {
              content: "";
              display: block;
              position: absolute;
              width: 100%;
              height: 2px;
              background-color: ${theme.primary};
            }
          `}
        >
          {candidate ? T9Utils.uiAliasFor(candidate) : " "}
        </span>
      </div>
      <ul
        // interesting thing here where the motion.li hangs onto the whileTap css after the theme changes, so this key causes a re-render.
        key={theme.background}
        className={css`
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(4, 12vmin);
          grid-gap: 2vmin;
          align-content: center;
        `}
      >
        {buttons.map((button, i) => (
          <motion.li
            whileTap={{
              animationTimingFunction: "linear",
              animationDuration: "100ms",
              backgroundColor: theme.primary,
              color: theme.primaryAlt
            }}
            key={T9Utils.primary(button)}
            className={cx(
              styles.button,
              T9Utils.primary(button) === "0"
                ? css`
                    grid-column: 1 / 3;
                    margin-left: auto;
                  `
                : ""
            )}
            role="button"
            onTap={() => onClick(T9Utils.primary(button))}
            tabIndex={0}
          >
            <h3>{T9Utils.primary(button)}</h3>
            <ul
              className={css`
                display: flex;
              `}
            >
              {T9Utils.trail(button).map((symbol) => (
                <li key={symbol}>
                  <span>{T9Utils.uiAliasFor(symbol)}</span>
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
        <motion.li
          key="delete"
          className={cx(
            styles.button,
            css`
              svg {
                width: 4vmin;
                height: 4vmin;
              }
            `
          )}
          role="button"
          onTap={() => send("BACKSPACE")}
          whileTap={{
            animationTimingFunction: "linear",
            animationDuration: "100ms",
            backgroundColor: theme.primary,
            color: theme.primaryAlt
          }}
        >
          <Backspace />
        </motion.li>
      </ul>
    </div>
  )
}

export default function App() {
  const themeSwitch = useThemeSwitch()
  const theme = useTheme()

  return (
    <div
      className={cx(
        "App",
        css`
          display: inline-block;
          height: 100%;
          overflow-y: auto;
          padding: 0 1rem;
          width: 100%;
          background-color: ${theme.background};
          color: ${theme.body};
          transition: color 300ms ease, background-color 300ms ease;
        `
      )}
    >
      <span
        role="button"
        onClick={() => themeSwitch.setTheme()}
        className={css`
          position: fixed;
          top: 1rem;
          right: 1rem;
          cursor: pointer;
        `}
      >
        {themeSwitch.mode === "dark" ? <Brightness3 /> : <Brightness5 />}
      </span>

      <h1
        className={css`
          font-size: 2rem;
          padding: 1rem;
          text-align: center;
        `}
      >
        That sweet t9 life
      </h1>

      <div
        className={css`
          width: 100%;
          text-align: center;
        `}
      >
        <T9 />
      </div>
    </div>
  )
}
