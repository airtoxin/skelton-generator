import "jest";
import { array2d } from "./Array2d";

const createDefaultContext = () => {
  const a2d: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];
  const rowOrCol: number[] = [10, 20, 30];

  return {
    a2d,
    rowOrCol,
  };
};

describe("Array2d", () => {
  describe("addRowTop", () => {
    it("should add row as first row of 2d array", () => {
      const { a2d, rowOrCol } = createDefaultContext();
      expect(array2d.addRowTop(a2d, rowOrCol)).toEqual([
        [10, 20, 30],
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
      ]);
    });

    it("should add row even if 2d array has no row", () => {
      const { rowOrCol } = createDefaultContext();
      expect(array2d.addRowTop([], rowOrCol)).toEqual([rowOrCol]);
    });
  });

  describe("addRowBottom", () => {
    it("should add row as last row of 2d array", () => {
      const { a2d, rowOrCol } = createDefaultContext();
      expect(array2d.addRowBottom(a2d, rowOrCol)).toEqual([
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [10, 20, 30],
      ]);
    });

    it("should add row even if 2d array has no row", () => {
      const { rowOrCol } = createDefaultContext();
      expect(array2d.addRowBottom([], rowOrCol)).toEqual([rowOrCol]);
    });
  });

  describe("addColLeft", () => {
    it("should add col as most left col of 2d array", () => {
      const { a2d, rowOrCol } = createDefaultContext();
      expect(array2d.addColLeft(a2d, rowOrCol)).toEqual([
        [10, 0, 1, 2],
        [20, 3, 4, 5],
        [30, 6, 7, 8],
      ]);
    });

    it("should add col even if 2d array has no row", () => {
      const { rowOrCol } = createDefaultContext();
      expect(array2d.addColLeft([], rowOrCol)).toEqual(
        rowOrCol.map((n) => [n])
      );
    });
  });

  describe("addColRight", () => {
    it("should add col as most right col of 2d array", () => {
      const { a2d, rowOrCol } = createDefaultContext();
      expect(array2d.addColRight(a2d, rowOrCol)).toEqual([
        [0, 1, 2, 10],
        [3, 4, 5, 20],
        [6, 7, 8, 30],
      ]);
    });

    it("should add col even if 2d array has no row", () => {
      const { rowOrCol } = createDefaultContext();
      expect(array2d.addColRight([], rowOrCol)).toEqual(
        rowOrCol.map((n) => [n])
      );
    });
  });
});
