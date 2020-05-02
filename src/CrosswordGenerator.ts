import { createDictSearcher } from "./CreateDictSearcher";
import { Dict, DictEntry } from "./DictLoader";

type CrosswordState = {
  width: number;
  height: number;
  keywords: Keyword[];
};

type CrosswordStateInternal = CrosswordState & {
  failedCount: number;
};

type Keyword = {
  answer: string;
  answerDetail: string;
  hint: string;
  x: number;
  y: number;
  direction: Direction;
};

type Direction = "across" | "down";

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

  generate(): CrosswordState {
    while (this.state.failedCount < 1) {
      this.gen();
    }
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
    const crossingIndexKeyword = randomInt(0, keywordLength);
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

  private createKeyword = (
    entry: DictEntry,
    x: number,
    y: number,
    direction: Direction
  ): Keyword => ({
    answer: entry.reading,
    answerDetail: entry.heading,
    hint: entry.text.split("\n")[1],
    x,
    y,
    direction,
  });

  private addKeyword = (keyword: Keyword): void => {
    let nextState = { ...this.state };
    let normalizedKeyword = { ...keyword };

    if (keyword.x < 0) {
      normalizedKeyword.x = 0;
      nextState.width = nextState.width - keyword.x;
      nextState.keywords = nextState.keywords.map((k) => ({
        ...k,
        x: k.x - keyword.x,
      }));
    }
    if (keyword.y < 0) {
      normalizedKeyword.y = 0;
      nextState.height = nextState.height - keyword.y;
      nextState.keywords = nextState.keywords.map((k) => ({
        ...k,
        y: k.y - keyword.y,
      }));
    }
    if (
      keyword.direction === "across" &&
      keyword.answer.length > nextState.width
    ) {
      nextState.width = keyword.answer.length;
    }
    if (
      keyword.direction === "down" &&
      keyword.answer.length > nextState.height
    ) {
      nextState.height = keyword.answer.length;
    }

    nextState.keywords.push(normalizedKeyword);
    this.state = nextState;
  };

  private createInitialState = (): CrosswordStateInternal => ({
    failedCount: 0,
    width: 0,
    height: 0,
    keywords: [],
  });
}

const randomInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max + 1));

const randomSelect = <T>(list: ArrayLike<T>): [T, number] => {
  const index = randomInt(0, list.length - 1);
  return [list[index], index];
};
