import { Intent, Position, Toaster } from "@blueprintjs/core";

const letterA = "a".codePointAt(0) as number;
const regionalIndicatorA = "🇦".codePointAt(0) as number;

const toRegionalIndicator = (char: string) =>
  String.fromCodePoint(
    (char.codePointAt(0) as number) - letterA + regionalIndicatorA
  );
export function countryShorthandToEmojii(country: string) {
  if (country === "en") {
    return "🇺🇸";
  }
  return country
    .split("")
    .map((char) => toRegionalIndicator(char))
    .join("");
}

export interface Tweet {
  tweet: string;
  user: string;
  retweet_count: number;
  created_at: number;
  verified: boolean;
  lang: string;
}

export const _toaster = Toaster.create({
  position: Position.TOP_RIGHT,
});

export const toaster = {
  success: (message: string) => {
    _toaster.show({ message, intent: Intent.SUCCESS, timeout: 2000 });
  },
  danger: (message: string) => {
    _toaster.show({ message, intent: Intent.DANGER, timeout: 2000 });
  },
  warn: (message: string) => {
    _toaster.show({ message, intent: Intent.WARNING, timeout: 2000 });
  },
};
