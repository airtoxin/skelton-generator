import { createDictSearcher } from "./CreateDictSearcher";
import { Dict, DictEntry } from "./DictLoader";

export type CrosswordState = {
  width: number;
  height: number;
  keywords: Keyword[];
};

type CrosswordStateInternal = CrosswordState & {
  failedCount: number;
};

export type Keyword = {
  answer: string;
  answerDetail: string;
  hint: string;
  x: number;
  y: number;
  direction: Direction;
};

export type Direction = "across" | "down";

export type Cell = {
  word?: string;
  x: number;
  y: number;
};

export class CrosswordGenerator {
  private readonly search: ReturnType<typeof createDictSearcher>;
  private state: CrosswordStateInternal;
  constructor(private dict: Dict) {
    if (dict.length === 0) throw new Error(`Empty dict`);

    this.search = createDictSearcher(this.dict);
    this.state = this.createInitialState();
    this.addKeyword(
      this.createKeyword(
        randomSelect(this.search("_____", { exact: true }))[0],
        0,
        0,
        "across"
      )
    );
  }

  static getCells(state: CrosswordState): Cell[][] {
    const cells: { word?: string; x: number; y: number }[][] = range(
      0,
      state.height
    ).map((_, y) =>
      range(0, state.width).map((_, x) => ({
        x,
        y,
      }))
    );

    for (const keyword of state.keywords) {
      Array.from(keyword.answer).forEach((word, index) => {
        const indexY = keyword.y + (keyword.direction === "down" ? index : 0);
        const indexX = keyword.x + (keyword.direction === "across" ? index : 0);
        cells[indexY][indexX].word = word;
      });
    }
    return cells;
  }

  generate(): CrosswordState {
    while (this.state.failedCount < 1) {
      this.gen();
    }
    this.normalizeCoordinates();
    return this.state;
  }

  private failed(): void {
    this.state = {
      ...this.state,
      failedCount: this.state.failedCount + 1,
    };
  }

  private gen(): void {
    const [pickedKeyword] = randomSelect(this.state.keywords);
    const [crossingWordPicked, crossingIndexPicked] = randomSelect(
      pickedKeyword.answer
    );
    const crossingCoordinate = this.getKeywordCoordinates(pickedKeyword)[
      crossingIndexPicked
    ];

    // select keyword
    const keywordLength = randomInt(2, 10);
    const crossingIndexKeyword = randomInt(0, keywordLength); // TODO: or 0
    const query = Array.from(Array(keywordLength))
      .map((_, i) => (i === crossingIndexKeyword ? crossingWordPicked : "_"))
      .join("");
    const [dictEntry] = randomSelect(this.search(query, { exact: true }));
    if (!dictEntry) return this.failed();

    const keywordDirection =
      pickedKeyword.direction === "across" ? "down" : "across";
    const keyword = this.createKeyword(
      dictEntry,
      keywordDirection === "across"
        ? crossingCoordinate.x - crossingIndexKeyword
        : crossingCoordinate.x,
      keywordDirection === "down"
        ? crossingCoordinate.y - crossingIndexKeyword
        : crossingCoordinate.y,
      keywordDirection
    );

    // validate keyword
    const isValid = this.getKeywordCoordinates(keyword).every(
      ({ word, x, y }) => {
        const kwc = this.state.keywords
          .flatMap((kw) => this.getKeywordCoordinates(kw))
          .find((kwc) => kwc.x === x && kwc.y === y);
        return kwc == null || kwc.word === word;
      }
    );
    if (!isValid) return this.failed();

    this.addKeyword(keyword);
  }

  private getKeywordCoordinates(
    keyword: Keyword
  ): { word: string; x: number; y: number }[] {
    return Array.from(keyword.answer).map((word, index) => {
      return {
        word,
        x: keyword.x + (keyword.direction === "across" ? index : 0),
        y: keyword.y + (keyword.direction === "down" ? index : 0),
      };
    });
  }

  private createKeyword(
    entry: DictEntry,
    x: number,
    y: number,
    direction: Direction
  ): Keyword {
    return {
      answer: entry.reading,
      answerDetail: entry.heading,
      hint: entry.text,
      x,
      y,
      direction,
    };
  }

  private addKeyword(keyword: Keyword): void {
    this.state.keywords.push(keyword);
  }

  private createInitialState = (): CrosswordStateInternal => ({
    failedCount: 0,
    width: 0,
    height: 0,
    keywords: [],
  });

  private normalizeCoordinates(): void {
    const { minX, minY, maxX, maxY } = this.state.keywords
      .flatMap(this.getKeywordCoordinates)
      .reduce(
        ({ minX, minY, maxX, maxY }, { x, y }) => ({
          minX: Math.min(minX, x),
          minY: Math.min(minY, y),
          maxX: Math.max(maxX, x),
          maxY: Math.max(maxY, y),
        }),
        {
          minX: Number.MAX_SAFE_INTEGER,
          minY: Number.MAX_SAFE_INTEGER,
          maxX: Number.MIN_SAFE_INTEGER,
          maxY: Number.MIN_SAFE_INTEGER,
        }
      );
    const [offsetX, offsetY] = [-minX, -minY];

    this.state.keywords = this.state.keywords.map((keyword) => ({
      ...keyword,
      x: keyword.x + offsetX,
      y: keyword.y + offsetY,
    }));
    this.state.width = maxX - minX + 1;
    this.state.height = maxY - minY + 1;
  }
}

const randomInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max + 1));

const randomSelect = <T>(list: ArrayLike<T>): [T, number] => {
  const index = randomInt(0, list.length - 1);
  return [list[index], index];
};

const range = (min: number, max: number) =>
  Array.from(Array(max - min)).map((_, i) => min + i);
