export class Array2d {
  addRowTop = <T>(a2d: T[][], row: T[]): T[][] => [row, ...a2d];
  addRowBottom = <T>(a2d: T[][], row: T[]): T[][] => [...a2d, row];
  addColLeft = <T>(a2d: T[][], col: T[]): T[][] =>
    a2d.length === 0
      ? col.map((t) => [t])
      : a2d.map((row, i) => [col[i], ...row]);
  addColRight = <T>(a2d: T[][], col: T[]): T[][] =>
    a2d.length === 0
      ? col.map((t) => [t])
      : a2d.map((row, i) => [...row, col[i]]);
}

export const array2d = new Array2d();
