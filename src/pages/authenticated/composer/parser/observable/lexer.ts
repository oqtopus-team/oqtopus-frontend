import Parser, { many, oneOf } from "@/parsing/parser";
import { ParseFail, ParseOk, ParseResult } from "@/parsing/result";
import { advancePos, charDelta, mkSourcePhrase, mkSourceRange, SourcePhrase, SourcePos, stringDelta } from "../source";
import { mkPositionedError, ObservableParserError, PositionedError } from "./error";
import { SourceToken, Token } from "./types";

type LexerState = {
  pos: SourcePos;
  input: string;
}

type PauliStringLexer<T> = Parser<LexerState, PositionedError, T>;


const mkUnexpected = (inp: string) => {
  if (inp == "") {
    return ObservableParserError.Unexpected("<end of filer>");
  }
  if (inp.length >= 6) {
    return ObservableParserError.Unexpected(inp.slice(0, 5) + "...");
  }
  return ObservableParserError.Unexpected(inp);
}
const lexFailWith = <T>(e: ObservableParserError, s: LexerState): [ParseResult<PositionedError, T>, LexerState] => [ParseFail(mkPositionedError(e, s.pos)), s];
const lexOk = <T>(t: T, s: LexerState): [ParseResult<PositionedError, T>, LexerState] => [ParseOk(t), s];


const anychar: PauliStringLexer<SourcePhrase<string>> = Parser((s: LexerState) => {
  if (s.input.length <= 0) {
    return lexFailWith(ObservableParserError.Unexpected("<end of file>"), s);
  }
  const ch = s.input.slice(0, 1);
  const rest = s.input.slice(1);
  const nextPos = advancePos(s.pos, charDelta(ch));
  return lexOk(mkSourcePhrase(ch, mkSourceRange(s.pos, nextPos)), {
    pos: nextPos,
    input: rest
  });
})

const regex = (re: RegExp): PauliStringLexer<SourcePhrase<string>> => Parser(({ input, pos }) => {
  const matchRegex = new RegExp(`^(?:${re.source})`, "u");
  const matched = input.match(matchRegex);
  if (!matched) {
    return lexFailWith(mkUnexpected(input), { input, pos });
  }
  const endPos = advancePos(pos, stringDelta(matched[0]));
  const matchedLength = matched[0].length;
  const nextInp = input.slice(matchedLength);
  return lexOk(mkSourcePhrase(matched[0], mkSourceRange(pos, endPos)), { input: nextInp, pos: endPos });
})

const tokInt: PauliStringLexer<SourceToken> = regex(/\d+/).map(({ it: numStr, at }) => {
  const n = Number(numStr);
  if (isNaN(n)) {
    throw new Error("Impossible!");
  }
  return mkSourcePhrase(Token.TokInt(numStr, n), at);
});

const tokGateChar: PauliStringLexer<SourceToken> = regex(/[a-zA-Z]/).map(({ it: ch, at }) => mkSourcePhrase(Token.TokChar(ch), at));

const whitespaces: PauliStringLexer<number> = many(regex(/\s/)).map(parsed => parsed.length);

const eof: PauliStringLexer<SourceToken> = Parser((s: LexerState) => {
  if (s.input == "") {
    return lexOk(mkSourcePhrase(["TokEOF"], mkSourceRange(s.pos, s.pos)), s);
  }
  return lexFailWith(mkUnexpected(s.input), s);
});

export const tokenizer = whitespaces.then(_ =>
  oneOf(tokInt, tokGateChar, eof)
)


export const lex = (src: string, offset: SourcePos) => tokenizer.runParser({ input: src, pos: offset });


