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

/**
 * The parsed result is an array of Pauli matrix type, sorted according to the qubit index.
 */
export const parsePauliString: ObservableParser<PauliGateType[]> =
  P.many(parseIndexedPauliGate)
    .map(gates => {
      const arranged: Record<number, PauliGateType> = gates.reduce((acc, [gate, i]) => ({ ...acc, [i]: gate }), {});
      return Array.from(
        { length: Math.max(...Object.keys(arranged).map(Number)) + 1 },
        (_, i) => arranged[i] ?? PauliGateType.I
      )
    });

/**
 * Parser for Pauli strings: parses an input string like `"X0 Y1 Z2"` into `["x", "y", "z"]`.
 *
 * There are three points worth mentioning:
 * 1. The order of Pauli matrices acting on each qubit does not matter.
 *    For instance, parsing the input string `"X0 Z2 Y1"` yields `["x", "y", "z"]`.
 * 2. Whitespace of arbitrary length is ignored during parsing, so
 *    parsing the two inputs `"X0Y1Z2I3"` and `"X0  Y1   X  2   I    3"` produces the same result.
 * 3. If the input lacks Pauli matrices on some qubits, like `"X0 Y2 Z5"`, the identity is inserted into the parsed result.
 *    So the result of parsing the former should be `["x", "i", "y", "i", "i", "z"]`.
 */
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