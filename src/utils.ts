const BUTTONS = [
  `1.,!?'"`,
  "2abc",
  "3def",
  "4ghi",
  "5jkl",
  "6mno",
  "7pqrs",
  "8tuv",
  "9wxyz",
  "0 "
] as const
type Button = typeof BUTTONS[number]

const UI_ALIASES: Record<string, string> = {
  " ": "␣"
}

export const T9 = {
  buttons: BUTTONS,
  primary: (value: Button): string => value[0],
  trail: (value: Button): string[] => value.slice(1).split(""),
  numberLast: (value: Button) => T9.trail(value).concat([T9.primary(value)]),
  uiAliasFor: (symbol: string): string => {
    return UI_ALIASES[symbol] || symbol
  }
} as const

export const clone = (x: Parameters<typeof JSON.stringify>[0]) =>
  JSON.parse(JSON.stringify(x))
