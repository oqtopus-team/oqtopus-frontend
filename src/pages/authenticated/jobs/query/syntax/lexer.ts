import { SourcePhrase, SourcePos } from "@/pages/authenticated/composer/parser/source";
import * as P from "@/parsing/parser";
import { ParseErrorType } from "./error";
import { SourceToken } from "./types";

type LexerState = {
  src: string;
  pos: SourcePos;
};

type PositionedError = { desc: ParseErrorType, pos: SourcePos };

type Lexer<T> = P.Parser<LexerState, PositionedError, T>;
