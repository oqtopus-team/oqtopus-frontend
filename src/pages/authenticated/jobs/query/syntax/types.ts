import { SourcePhrase } from "@/pages/authenticated/composer/parser/source";

export type Keyword = "match" | "filter" | "sort" ;

type Token =
  | ["TokLeftParens"]
  | ["TokRightParens"]
  | ["TokLeftSquare"]
  | ["TokRightSquare"]
  | ["TokLeftBrace"]
  | ["TokRightBrace"]
  | ["TokDot"]
  | ["TokComma"]
  | ["TokReserved", Keyword]
  | ["TokOperator", string]
  | ["TokString", string, string]
  | ["TokNumber", string, number]
  | ["TokBoolean", string, boolean]

export const Token = {
  LeftParens: ["TokLeftParens"] as Token,
  RightParens: ["TokRightParens"] as Token,
  TokLeftSquare: ["TokLeftSquare"] as Token,
  TokRightSquare: ["TokRightSquare"] as Token,
  TokLeftBrace: ["TokLeftBrace"] as Token,
  TokRightBrace: ["TokRightBrace"] as Token,
  Dot: ["TokDot"] as Token,
  Comma: ["TokComma"] as Token,
  Reserved: (kw: Keyword): Token => ["TokReserved", kw], 
  Operator: (op: string):Token => ["TokOperator", op],
  String: (raw: string, str: string): Token => ["TokString", raw, str],
  Number: (raw: string, num: number): Token => ["TokNumber", raw, num],
  Boolean: (raw: string, b: boolean): Token => ["TokBoolean", raw, b],  
};

export type SourceToken = SourcePhrase<Token>;
