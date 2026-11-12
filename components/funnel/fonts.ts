import { Instrument_Serif } from "next/font/google";

/*
  The italic serif of /demo's front page: the job word, "head.", "flows.",
  the story and "now →". Self-hosted by next/font and exposed as
  --font-display-serif on the funnel's root, so only /demo loads it.
*/

export const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display-serif",
});
