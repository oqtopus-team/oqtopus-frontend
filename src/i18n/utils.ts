export const renderTemplate = (template: string, vars: Record<keyof any, string>): string => {
  return Object.keys(vars).reduce((prev, var_) => {
    const regexp = new RegExp(`%${var_}%`, "g");
    return prev.replaceAll(regexp, vars[var_]);
  }, template);
}