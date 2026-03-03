export type SourcePos = { ln: number; col: number; };

export type SourceRange = { from: SourcePos; to: SourcePos; }

export type SourcePhrase<T> = { it: T, at: SourceRange };

export const mkSourcePos = (ln: number, col: number): SourcePos => ({ ln, col });
export const mkSourceRange = (from: SourcePos, to: SourcePos): SourceRange => ({ from, to });
export const mkSourcePhrase = <T>(it: T, at: SourceRange): SourcePhrase<T> => ({ it, at });

export type SourceDelta = { dl: number; dc: number };
export const SourceDelta = (dl: number, dc: number) => ({ dl, dc });

export const appendDelta = (l: SourceDelta, r: SourceDelta): SourceDelta => {
  if (r.dl == 0) return SourceDelta(l.dl, l.dc + r.dc);
  if (l.dl == 0) return r;
  return SourceDelta(l.dl + r.dl, r.dc)
};

export const charDelta = (ch: string): SourceDelta => {
  if (ch == "\n") {
    return SourceDelta(1, 0);
  }
  return SourceDelta(0, 1);
}

export const stringDelta = (str: string): SourceDelta => {
  return [...str].reduce((acc, ch) => appendDelta(acc, charDelta(ch)), SourceDelta(0, 0));
}

export const advancePos = (p: SourcePos, d: SourceDelta) => {
  const step = (l: number, c: number, dl: number): SourcePos => {
    if (dl == 0) {
      return mkSourcePos(l, c + d.dc);
    }
    return step(l + 1, 1, dl - 1);
  }
  return step(p.ln, p.col, d.dl);
}

export const printSourcePos = (p: SourcePos): string => `ln ${p.ln}, col ${p.col}`;