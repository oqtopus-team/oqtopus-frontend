import { SourcePos } from "../source";
import { printToken, Token } from "./types";

type Unexpected = ["Uexpected", string]
type InvalidGate = ["InvalidGate", string]
type QubitIndexTooLarge = ["QubitIndexTooLarge", number];
type UnexpectedToken = ["UnexpectedToken", Token];

export type ObservableParserError =
  | Unexpected
  | InvalidGate
  | QubitIndexTooLarge
  | UnexpectedToken
  ;

export const ObservableParserError = {
  QubitIndexTooLarge: (n: number): ObservableParserError => ["QubitIndexTooLarge", n],
  InvalidGate: (g: string): ObservableParserError => ["InvalidGate", g],
  Unexpected: (inp: string): ObservableParserError => ["Uexpected", inp],
  UnexpectedToken: (tok: Token): ObservableParserError => ["UnexpectedToken", tok],
};

export type PositionedError = [ObservableParserError, SourcePos];

export const mkPositionedError = (e: ObservableParserError, p: SourcePos): PositionedError => [e, p];

export const renderParseError = (e: ObservableParserError): string => {
  switch (e[0]) {
    case "InvalidGate": return `Invalid gate type: ${e[1]}.`;
    case "QubitIndexTooLarge": return `Qubit index ${e[1]} is too big.`
    case "Uexpected": return `Unexpected input: ${e[1]}`;
    case "UnexpectedToken": return `Unexpected token: ${printToken(e[1])}`

  }
}