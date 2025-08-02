import { useState } from "react";
import ClipResultContainer from "../src/ClipResultContainer";
import ClipSearch from "./ClipSearch";

function App() {
  const [query, setQuery] = useState<string>("");
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 左侧搜索区域 */}
      <div className="w-2/5 flex-shrink-0">
        <ClipSearch
          onSearch={(query: string) => {
            setQuery(query);
          }}
        />
      </div>

      {/* 右侧结果区域 */}
      <div className="flex-1">
        <ClipResultContainer query={query} />
      </div>
    </div>
  );
}

export default App;
