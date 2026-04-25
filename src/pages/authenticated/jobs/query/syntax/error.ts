export type ParseErrorType =
  | ["Unexpected", string]

export const ParseError = {
  Unexpected: (inp: string): ParseErrorType => ["Unexpected", inp],
}