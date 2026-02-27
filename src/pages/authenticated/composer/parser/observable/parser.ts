import Parser, * as P from "@/parsing/parser";
import { lex } from "./lexer";
import { mkSourcePos, mkSourceRange, printSourcePos, SourcePos, SourceRange } from "../source";
import { SourceToken, Token } from "./types";
import { ParseFail, ParseOk, ParseResult } from "@/parsing/result";
import { ObservableParserError, mkPositionedError, renderParseError } from "./error";
import { PauliGateType } from "qulacs-wasm-simulator-client";

export type ObservableParserState = {
  src: string;
  pos: SourcePos;
}

type RangedError = { desc: ObservableParserError, toks: SourceToken[], at: SourceRange };

const mkRangedError = (
  desc: ObservableParserError, 
  at: SourceRange, 
  toks: SourceToken[] = []
): RangedError => ({ desc, at, toks });

export type ObservableParser<T> = Parser<ObservableParserState, RangedError, T>;

const tokenSuchThat = (prd: (tok: Token) => boolean): ObservableParser<SourceToken> => Parser((st) => {
  const [lexRes, nextState] = lex(st.src, st.pos);
  switch (lexRes._tag) {
    case "ParseOk":
      if (prd(lexRes.value.it)) {
        return [
          ParseOk(lexRes.value),
          { pos: nextState.pos, src: nextState.input }
        ];
      }
      else {
        return [
          ParseFail(
            mkRangedError(
              ObservableParserError.UnexpectedToken(lexRes.value.it),
              lexRes.value.at,
              [lexRes.value]
            )
          ),
          { pos: nextState.pos, src: nextState.input }
        ];
      }
    case "ParseFail":
      return [
        ParseFail(
          mkRangedError(
            lexRes.value[0],
            mkSourceRange(lexRes.value[1], lexRes.value[1])
          )
        ),
        { pos: nextState.pos, src: nextState.input }
      ];
  }
});

const reject = <T>(toks: SourceToken[], err?: ObservableParserError): ObservableParser<T> => Parser.fail(
  mkRangedError(
    err ?? ObservableParserError.UnexpectedToken(toks[0].it),
    mkSourceRange(toks[0].at.from, toks[toks.length - 1].at.to),
    toks
  ),
);

export const int: ObservableParser<SourceToken> = tokenSuchThat((t) => t[0] == "TokInt");

export const char: ObservableParser<SourceToken> = tokenSuchThat(t => t[0] == "TokChar");

export const parseInt: ObservableParser<number> = int.then(({ it: tok }) => {
  switch (tok[0]) {
    case "TokInt":
      return Parser.pure(tok[2]);
    default:
      throw new Error("impossible");
  }
});

export const parsePauliGate: ObservableParser<PauliGateType> = char.then(({ it: tok, at }) => {
  switch (tok[0]) {
    case "TokChar":
      const gatename = tok[1].toLowerCase();
      switch (gatename) {
        case "x":
        case "y":
        case "z":
        case "i":
          return Parser.pure(gatename);
        default:
          return reject([{ it: tok, at }], ObservableParserError.InvalidGate(gatename));
      }
    default:
      throw new Error("impossible")
  }
});

export const parseIndexedPauliGate: ObservableParser<[PauliGateType, number]> =
  parsePauliGate.then((gatename) =>
    parseInt.then(n =>
      Parser.pure([gatename, n])
    )
  );

export const parsePauliString: ObservableParser<PauliGateType[]> =
  P.many(parseIndexedPauliGate).then(gates =>
    Parser.pure(gates
      // sort by qubit index
      .toSorted((l, r) => l[1] - r[1])
      // extract gate name
      .map(gi => gi[0])
    )
  );

export const parseObservable = (operatorString: string): ParseResult<string, PauliGateType[]> => {
  const reportError = <T>(res: ParseResult<RangedError, unknown>): ParseResult<string, T> => {
    switch (res._tag) {
      case "ParseOk":
        throw new Error("Impossible");
      case "ParseFail":
        const { from, to } = res.value.at;
        const errorMsg = "An error has occurred during parsing operator:\n"
          + `at ${printSourcePos(from)} - ${printSourcePos(to)}:` + "\n"
          + `${renderParseError(res.value.desc)}`
        return ParseFail(errorMsg);
    }
  };

  const [parseResult, s] = parsePauliString.runParser({
    src: operatorString,
    pos: mkSourcePos(1, 1),
  });
  switch (parseResult._tag) {
    case "ParseOk":
      if (s.src.trim() == "") {
        return ParseOk(parseResult.value);
      }
      else {
        const res = parseIndexedPauliGate.runParser(s);
        return reportError(res[0]);
      }
    case "ParseFail":
      return reportError(parseResult);
  }
} 