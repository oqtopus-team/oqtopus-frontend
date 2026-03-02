
import { applyResult, mapErrorResult, mapResult, ParseFail, ParseOk, ParseResult } from "./result";

type RunParser<S, E, T> = { runParser: (st: S) => [ParseResult<E, T>, S] };

export interface Parser<S, E, T> {
  runParser: (st: S) => [ParseResult<E, T>, S];
  map: <U>(f: (t: T) => U) => Parser<S, E, U>;
  mapError: <F>(f: (e: E) => F) => Parser<S, F, T>;
  then: <U>(f: (t: T) => Parser<S, E, U>) => Parser<S, E, U>;
  or: (fallback: Parser<S, E, T>) => Parser<S, E, T>;
};

const mapParser = <S, E, T, U>(f: (t: T) => U, p: RunParser<S, E, T>): Parser<S, E, U> => {
  return Parser(s1 => {
    const [res, s2] = p.runParser(s1);
    return [mapResult(f, res), s2];
  });
}

const mapErrorParser = <S, E, F, T>(f: (e: E) => F, p: RunParser<S, E, T>): Parser<S, F, T> => {
  return Parser(s1 => {
    const [res, s2] = p.runParser(s1);
    return [mapErrorResult(f, res), s2];
  });
}

const applyParser = <S, E, T, U>(pf: RunParser<S, E, (t: T) => U>, pt: RunParser<S, E, T>): Parser<S, E, U> => {
  return Parser(s => {
    const [rf, s2] = pf.runParser(s);
    switch (rf._tag) {
      case "ParseFail":
        return [rf, s2];
      case "ParseOk":
        const [ra, s3] = pt.runParser(s2);
        return [applyResult(rf, ra), s3];
    }
  })
}

const altParser = <S, E, T>(pl: RunParser<S, E, T>, pr: RunParser<S, E, T>): Parser<S, E, T> => {
  return Parser(s => {
    const [rl, sl] = pl.runParser(s);
    switch (rl._tag) {
      case "ParseOk":
        return [rl, sl];
      case "ParseFail":
        return pr.runParser(sl);
    }
  })
}

const bindParser = <S, E, T, U>(f: (t: T) => RunParser<S, E, U>, p: RunParser<S, E, T>): Parser<S, E, U> => {
  return Parser(s1 => {
    const [res, s2] = p.runParser(s1);
    switch (res._tag) {
      case "ParseFail":
        return [res, s2];
      case "ParseOk":
        return f(res.value).runParser(s2);
    }
  });
}

/**
 * Constructor of a parser.
 */
export const Parser = <S, E, T>(parserFn: (s: S) => [ParseResult<E, T>, S]): Parser<S, E, T> => {
  const parser: Parser<S, E, T> = {
    runParser: parserFn,
    map: <U>(f: (t: T) => U) => mapParser(f, parser),
    mapError: <F>(f: (e: E) => F) => mapErrorParser(f, parser),
    then: <U>(f: (t: T) => Parser<S, E, U>) => bindParser(f, parser),
    or: (fallback: Parser<S, E, T>) => altParser(parser, fallback),
  };
  return parser;
}

Parser.fail = <S, E, T>(e: E): Parser<S, E, T> => Parser((s) => [ParseFail(e), s]);
Parser.pure = <S, E, A>(a: A): Parser<S, E, A> => Parser((s) => [ParseOk(a), s]);
Parser.apply = <S, E, A, B>(f: Parser<S, E, (a: A) => B>, p: Parser<S, E, A>) => applyParser(f, p);

export const many = <S, E, T>(p: Parser<S, E, T>): Parser<S, E, T[]> => {
  const step = (buf: T[], s: S): [T[], S] => {
    const [r, next] = p.runParser(s);
    switch (r._tag) {
      case "ParseOk":
        return step([...buf, r.value], next);
      case "ParseFail":
        return [buf, s];
    }
  };

  return Parser((s: S) => {
    const [results, sf] = step([], s);
    return [ParseOk(results), sf];
  });
};

export default Parser;

export const oneOf = <S, E, T>(p: Parser<S, E, T>, ...ps: Parser<S, E, T>[]): Parser<S, E, T> => {
  const step = (parsers: Parser<S, E, T>[], s: S): [ParseResult<E, T>, S] => {
    const [p, ...rest] = parsers;
    const [res, next] = p.runParser(s);
    switch (res._tag) {
      case "ParseOk":
        return [res, next];
      case "ParseFail":
        return rest.length > 0
          ? step(rest, next)
          : [res, next];
    }
  };
  return Parser(s => step([p, ...ps], s));
}

