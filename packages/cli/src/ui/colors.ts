const supportsColor = (): boolean => {
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.FORCE_COLOR !== undefined) return true;
  return Boolean(process.stdout.isTTY);
};

const enabled = supportsColor();

const wrap = (open: number, close: number) => (str: string | number): string => {
  if (!enabled) return String(str);
  return `\x1b[${open}m${str}\x1b[${close}m`;
};

export const c = {
  reset: wrap(0, 0),
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  italic: wrap(3, 23),
  underline: wrap(4, 24),
  
  // Colors
  black: wrap(30, 39),
  red: wrap(31, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  blue: wrap(34, 39),
  magenta: wrap(35, 39),
  cyan: wrap(36, 39),
  white: wrap(37, 39),
  gray: wrap(90, 39),
  
  // Custom styled accents
  brand: (str: string | number) => wrap(34, 39)(c.bold(str)),
  success: (str: string | number) => wrap(32, 39)(str),
  warning: (str: string | number) => wrap(33, 39)(str),
  error: (str: string | number) => wrap(31, 39)(str),
  muted: (str: string | number) => wrap(90, 39)(str),
  highlight: (str: string | number) => wrap(36, 39)(c.bold(str)),
};
