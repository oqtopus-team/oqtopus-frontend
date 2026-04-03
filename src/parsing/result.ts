type ParseOk<T> = { readonly _tag: "ParseOk", value: T };
export const ParseOk = <E, T>(value: T): ParseResult<E, T> => ({ _tag: "ParseOk", value });

type ParseFail<E> = { readonly _tag: "ParseFail", value: E };
export const ParseFail = <E, T>(value: E): ParseResult<E, T> => ({ _tag: "ParseFail", value });

export type ParseResult<E, T> = ParseOk<T> | ParseFail<E>;

export const isParseOk = <E, T>(r: ParseResult<E, T>): r is ParseOk<T> => r._tag == "ParseOk";

export const isParseFail = <E, T>(r: ParseResult<E, T>): r is ParseFail<E> => r._tag == "ParseFail";

export const mapResult = <E, T, U>(f: (t: T) => U, r: ParseResult<E, T>): ParseResult<E, U> => {
  return r._tag == "ParseFail" ? r : { ...r, value: f(r.value) };
}

export const mapErrorResult = <E, F, T>(f: (e: E) => F, r: ParseResult<E, T>): ParseResult<F, T> => {
  return r._tag == "ParseOk" ? r : { ...r, value: f(r.value) };
}

export const applyResult = <E, T, U>(rf: ParseResult<E, (t: T) => U>, rt: ParseResult<E, T>): ParseResult<E, U> => {
  switch (rf._tag) {
    case "ParseFail":
      return rf;
    case "ParseOk":
      return mapResult(rf.value, rt);
  }
} 

export const bindResult = <E, T, U>(f: (t: T) => ParseResult<E, U>, r: ParseResult<E, T>): ParseResult<E, U> => {
  switch (r._tag) {
    case "ParseFail":
      return r;
    case "ParseOk":
      return f(r.value);
  }
}