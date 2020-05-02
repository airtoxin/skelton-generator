import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dict, loadDict } from "./DictLoader";
import useAsyncEffect from "use-async-effect";
import replaceString from "react-string-replace";
import { createDictSearcher } from "./CreateDictSearcher";
import { CrosswordGenerator } from "./CrosswordGenerator";

function App() {
  const [dict, setDict] = useState<Dict>([]);
  const [query, setQuery] = useState<string>("");
  useAsyncEffect(async () => {
    setDict(await loadDict());
  }, []);
  const search = useCallback(createDictSearcher(dict), [dict.length]);
  const entries = useMemo(() => (query.length >= 3 ? search(query) : []), [
    search,
    query,
  ]);

  useEffect(() => {
    if (dict.length === 0) return;
    const result = new CrosswordGenerator(dict).generate();
    console.log("@result", result);
  }, [dict]);

  return (
    <div className="App">
      <input
        type="text"
        value={query || ""}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />

      {entries.map((e) => (
        <div key={e.text || e.heading} style={{ margin: "1rem" }}>
          <div style={{ fontWeight: "bold" }}>
            {e.heading}
            <span>(ヨミ: {e.reading})</span>
          </div>
          <div>
            {replaceString(e.text, /\n/, () => (
              <br />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
