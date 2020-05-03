import React, { useEffect, useMemo, useState } from "react";
import { Dict, loadDict } from "./DictLoader";
import useAsyncEffect from "use-async-effect";
import { CrosswordGenerator, CrosswordState } from "./CrosswordGenerator";

function App() {
  const [dict, setDict] = useState<Dict>([]);
  useAsyncEffect(async () => {
    setDict(await loadDict());
  }, []);
  const [crossword, setCrossword] = useState<CrosswordState | null>(null);
  useEffect(() => {
    if (dict.length === 0) return;
    const result = new CrosswordGenerator(dict).generate();
    setCrossword(result);
  }, [dict]);

  console.log("@crossword", crossword);
  const cells = useMemo(
    () => crossword && CrosswordGenerator.getCells(crossword),
    [crossword]
  );

  if (cells == null) return null;
  return (
    <div className="App">
      <div>
        {cells.map((row, i) => (
          <div key={i} style={{ display: "flex" }}>
            {row.map((cell) => (
              <div
                key={`${cell.x}_${cell.y}`}
                style={{
                  display: "flex",
                  border: "solid 2px black",
                  fontWeight: "bold",
                  width: "2rem",
                  height: "2rem",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: cell.word || "black",
                }}
              >
                {cell.word}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div>
        {crossword?.keywords.map((kw) => (
          <div key={kw.hint}>{kw.answer}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
