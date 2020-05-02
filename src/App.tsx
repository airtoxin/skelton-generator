import React, { useMemo, useState } from "react";
import { Dict, loadDict } from "./DictLoader";
import useAsyncEffect from "use-async-effect";
import replaceString from "react-string-replace";

function App() {
  const [dict, setDict] = useState<Dict>([]);
  const [query, setQuery] = useState<string>("");
  useAsyncEffect(async () => {
    setDict(await loadDict());
  }, []);
  const regexp = useMemo(() => new RegExp(query.replace(/_/g, ".")), [query]);
  const entries = useMemo(() => {
    return query.length < 3 ? [] : dict.filter((d) => regexp.test(d.reading));
  }, [dict, query]);

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
