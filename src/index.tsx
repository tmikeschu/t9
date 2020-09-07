import * as React from "react"
import { render } from "react-dom"

import App from "./App"
import { ThemeProvider } from "./theme"
import { injectGlobal } from "emotion"
import emotionReset from "emotion-reset"

injectGlobal`
${emotionReset}

body {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

#root {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  font-family: "Sora", Arial, Helvetica, sans-serif;
}
`

const rootElement = document.getElementById("root")
render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
  rootElement
)
