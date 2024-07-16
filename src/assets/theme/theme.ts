"use client"

import { createTheme, rem, rgba } from "@mantine/core"
import { Mukta_Malar } from "next/font/google"

const font = Mukta_Malar({
  subsets: ["latin"],
  // weight: ["300", "400", "500", "600", "700"],
  weight: ["400"],
})

export const theme = createTheme({
  // Colors
  // black: "#1e1c1a",
  // white: "#f8f4e9",

  // shadows
  shadows: {
    xxl: `0 6px 12px 12px ${rgba("var(--mantine-color-dark-9)", 0.05)}`,
  },

  // spacing
  spacing: {
    xxs: "calc(0.225rem*var(--mantine-scale))",
  },

  fontFamily: font.style.fontFamily,

  /* Put your mantine theme override here */
  headings: {
    fontWeight: "700",
    fontFamily: font.style.fontFamily,
    // lineHeight: "1.4",

    // properties for individual headings, all of them are optional
    sizes: {
      h1: { fontWeight: "300", fontSize: rem(48) },
      h2: { fontSize: rem(30), lineHeight: "1.5" },
    },
  },
})
