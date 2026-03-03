export type Complex = { re: number, im: number};

export const roundNumber = (num: number, digit: number): number =>
  Math.round(num * 10 ** digit) / 10 ** digit;

