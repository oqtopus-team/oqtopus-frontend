import { SourcePhrase } from "../source";

type TokInt = ["TokInt", string, number];
type TokChar = ["TokChar", string];
type TokEOF = ["TokEOF"];

export type Token = TokInt | TokChar | TokEOF;
export const Token = {
  TokInt: (s: string, n: number): Token => [ "TokInt", s, n],
  TokChar: (ch: string): Token => ["TokChar", ch],
  TokEOF: ["TokEOF"] as Token
};

export type SourceToken = SourcePhrase<Token>;

export const printToken = (tok: Token): string => {
  switch (tok[0]) {
    case "TokChar": return tok[1];
    case "TokInt": return tok[1];
    case "TokEOF": return "";
  }
}