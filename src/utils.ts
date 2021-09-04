import { Intent, Position, Toaster } from "@blueprintjs/core";
import jsonLogic from "json-logic-js";

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

jsonLogic.add_operation("regexp_matches", function (pattern, subject) {
  if (typeof pattern === "string") {
    pattern = new RegExp(pattern);
  }
  return pattern.test(subject);
});
//   jsonLogic.apply({"regexp_matches": ["\\w+(ing)\\w+", "ingest"]});
export const hashTagRegex = new RegExp(/\B(\#[a-zA-Z]+\b)(?!;)/g);

jsonLogic.add_operation("case_insensitive_in", function (wordToMatch, subject) {
  return subject.toLowerCase().includes(wordToMatch);
});

export const _toaster = Toaster.create({
  position: Position.TOP_RIGHT,
});

export const toaster = {
  success: (message: string) => {
    _toaster.show({ message, intent: Intent.SUCCESS });
  },
  danger: (message: string) => {
    _toaster.show({ message, intent: Intent.DANGER });
  },
  warn: (message: string) => {
    _toaster.show({ message, intent: Intent.WARNING });
  },
};
