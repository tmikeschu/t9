import * as React from "react"
import { injectGlobal } from "emotion"
import {
  ThemeProvider as EmotionProvider,
  useTheme as useEmotion
} from "emotion-theming"

const colors = {
  white: "#FBFEF9",
  gray: "#F3EFF5",
  black: "#1C2826",
  red: "#ef3054",
  green: "#43AA8B",
  cerullean: "#3454D1",
  lightBlue: "#715AFF",
  darkBlue: "#0E0E52",
  salmon: "#F49390"
}

injectGlobal`
  html, body {
    padding: 0;
    margin: 0;
  }

  * {
    box-sizing: border-box;
  }
`

interface CommonTheme {
  error: string
  success: string
}

export type Theme = CommonTheme & {
  background: string
  body: string
  primary: string
  primaryAlt: string
}

const commonTheme: CommonTheme = {
  error: colors.red,
  success: colors.green
}

const themeLight: Theme = {
  ...commonTheme,
  background: colors.gray,
  body: colors.black,
  primary: colors.salmon,
  primaryAlt: colors.white
}

const themeDark: Theme = {
  ...commonTheme,
  background: colors.black,
  body: colors.white,
  primary: colors.cerullean,
  primaryAlt: colors.white
}

const theme = (mode: ThemeMode): Theme =>
  mode === "dark" ? themeDark : themeLight

type ThemeMode = "dark" | "light"

interface ThemeSwitchContext {
  mode: ThemeMode
  setTheme: (mode?: ThemeMode) => void
}

const defaultThemeContext: ThemeSwitchContext = {
  mode: "dark",
  setTheme: () => {}
}

const ThemeContext = React.createContext(defaultThemeContext)
const useThemeSwitch = () => React.useContext(ThemeContext)
const useTheme = () => useEmotion<Theme>()

type ThemeSwitchState = Pick<ThemeSwitchContext, "mode"> & {
  hasMounted: boolean
}
const useThemeSwitchState = () => {
  const state = React.useState<ThemeSwitchState>({
    mode: defaultThemeContext.mode,
    hasMounted: false
  })
  const [, setThemeState] = state

  React.useEffect(() => {
    const lsMode = (localStorage.getItem("mode") || "dark") as ThemeMode
    setThemeState(state => ({ ...state, mode: lsMode, hasMounted: true }))
  }, [setThemeState])

  return state
}

const nextThemes: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "light"
}

const ThemeProvider: React.FC = ({ children }) => {
  const [themeSwitchState, setThemeSwitchState] = useThemeSwitchState()
  if (!themeSwitchState.hasMounted) {
    return <div />
  }

  const setTheme = (mode?: ThemeMode) => {
    const nextMode = mode || nextThemes[themeSwitchState.mode]
    setThemeSwitchState(state => ({ ...state, mode: nextMode }))
  }

  return (
    <EmotionProvider theme={theme(themeSwitchState.mode)}>
      <ThemeContext.Provider
        value={{
          mode: themeSwitchState.mode,
          setTheme
        }}
      >
        {children}
      </ThemeContext.Provider>
    </EmotionProvider>
  )
}

export { ThemeProvider, useThemeSwitch, useTheme }
