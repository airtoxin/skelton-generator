import "jest";
import { CrosswordGenerator, Keyword } from "./CrosswordGenerator";
import { Dict, DictEntry } from "./DictLoader";

const createDefaultContext = () => {
  const dictEntry: DictEntry = {
    heading: "ABCDE",
    reading: "ABCDE",
    text: "ABCDE",
  };
  const dict: Dict = [dictEntry];
  const dictEntryKeyword: Keyword = {
    answer: "ABCDE",
    answerDetail: "ABCDE",
    hint: "ABCDE",
    x: 1,
    y: 2,
    direction: "across",
  };
  const generator = new CrosswordGenerator(dict);

  return {
    dictEntry,
    dict,
    dictEntryKeyword,
    generator,
  };
};

describe("CrosswordGenerator", () => {
  describe("#failed", () => {
    it("should increment failedCount in state", () => {
      const { generator } = createDefaultContext();
      expect(generator["state"].failedCount).toBe(0);

      generator["failed"]();

      expect(generator["state"].failedCount).toBe(1);
    });
  });

  describe("#createKeyword", () => {
    it("should return Keyword", () => {
      const { generator } = createDefaultContext();
      expect(
        generator["createKeyword"](
          { heading: "heading", reading: "reading", text: "text" },
          1,
          2,
          "down"
        )
      ).toEqual({
        answer: "reading",
        answerDetail: "heading",
        hint: "text",
        x: 1,
        y: 2,
        direction: "down",
      });
    });
  });

  describe("#addKeyword", () => {
    it("should add keyword to state", () => {
      const { generator, dictEntryKeyword } = createDefaultContext();
      const initialKeywords = [...generator["state"].keywords];
      const keyword = { ...dictEntryKeyword, answer: "XXXXX", x: -10, y: -20 };

      generator["addKeyword"](keyword);

      const expectedKeywords = initialKeywords.concat([keyword]);
      expect(generator["state"].keywords).toEqual(expectedKeywords);
    });
  });

  describe("#normalizeCoordinates", () => {
    it("should normalize negative coordinate offset", () => {
      const { generator, dictEntryKeyword } = createDefaultContext();
      const initialKeywords = [...generator["state"].keywords];
      const negativeCoordinateKeyword = { ...dictEntryKeyword, x: -10, y: -20 };

      generator["state"].keywords.push(negativeCoordinateKeyword);
      generator["normalizeCoordinates"]();

      const expectedKeywords = initialKeywords
        .concat([negativeCoordinateKeyword])
        .map((keyword) => ({
          ...keyword,
          x: keyword.x + 10,
          y: keyword.y + 20,
        }));
      expect(generator["state"].keywords).toEqual(expectedKeywords);
    });

    it("should correct width and height with keyword", () => {
      const { generator, dictEntryKeyword } = createDefaultContext();
      const negativeCoordinateKeyword = { ...dictEntryKeyword, x: 10, y: 20 };

      generator["state"].keywords.push(negativeCoordinateKeyword);
      generator["normalizeCoordinates"]();

      // corrected state of width/height
      expect(generator["state"].width).toBe(
        10 + negativeCoordinateKeyword.answer.length
      );
      expect(generator["state"].height).toBe(20 + 1);
    });

    it("should correct width and height with keyword having negative coordinate", () => {
      const { generator, dictEntryKeyword } = createDefaultContext();
      const negativeCoordinateKeyword = { ...dictEntryKeyword, x: -10, y: -20 };

      generator["state"].keywords.push(negativeCoordinateKeyword);
      generator["normalizeCoordinates"]();

      // corrected state of width/height
      expect(generator["state"].width).toBe(
        10 + negativeCoordinateKeyword.answer.length
      );
      expect(generator["state"].height).toBe(20 + 1);
    });
  });

  describe("#getKeywordCoordinates", () => {
    it("should return array of coordinates correspond to each word of keyword", () => {
      const { generator, dictEntryKeyword } = createDefaultContext();

      // direction across
      expect(generator["getKeywordCoordinates"](dictEntryKeyword)).toEqual([
        { word: "A", x: dictEntryKeyword.x + 0, y: dictEntryKeyword.y },
        { word: "B", x: dictEntryKeyword.x + 1, y: dictEntryKeyword.y },
        { word: "C", x: dictEntryKeyword.x + 2, y: dictEntryKeyword.y },
        { word: "D", x: dictEntryKeyword.x + 3, y: dictEntryKeyword.y },
        { word: "E", x: dictEntryKeyword.x + 4, y: dictEntryKeyword.y },
      ]);

      // direction down
      expect(
        generator["getKeywordCoordinates"]({
          ...dictEntryKeyword,
          x: 100,
          y: 200,
          direction: "down",
        })
      ).toEqual([
        {
          word: "A",
          x: 100,
          y: 200 + 0,
        },
        {
          word: "B",
          x: 100,
          y: 200 + 1,
        },
        {
          word: "C",
          x: 100,
          y: 200 + 2,
        },
        {
          word: "D",
          x: 100,
          y: 200 + 3,
        },
        {
          word: "E",
          x: 100,
          y: 200 + 4,
        },
      ]);
    });
  });

  describe("getCells", () => {
    it("should return array of array of Cells", () => {
      const { generator } = createDefaultContext();
      const crossword = generator.generate();

      expect(CrosswordGenerator.getCells(crossword)).toEqual([
        [
          { word: "A", x: 0, y: 0 },
          { word: "B", x: 1, y: 0 },
          { word: "C", x: 2, y: 0 },
          { word: "D", x: 3, y: 0 },
          { word: "E", x: 4, y: 0 },
        ],
      ]);
    });
  });
});
