import { useState } from "react";

export default function ClipSearch({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const [keyword, setKeyword] = useState("");

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 to-blue-600 overflow-hidden relative">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full opacity-10 animate-pulse">
          <div className="w-96 h-96 rounded-full bg-white absolute top-1/4 left-1/4"></div>
          <div className="w-64 h-64 rounded-full bg-white absolute bottom-1/4 right-1/4"></div>
        </div>
      </div>

      <div className="text-center w-full max-w-lg px-8 relative z-10">
        {/* 标题 */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight animate-fade-in-up">
          🎬 Clip Finder
        </h1>

        <p className="text-lg text-white/80 mb-8 font-light animate-fade-in-up animation-delay-100">
          通过关键词找到您需要的视频片段
        </p>

        {/* 搜索框 */}
        <div className="relative mb-8 animate-fade-in-up animation-delay-200">
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-2xl bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent pointer-events-none">
            🔍
          </div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="输入关键词搜索视频片段..."
            className="w-full h-16 text-lg px-8 pl-16 py-4 rounded-full bg-white/95 backdrop-blur-md shadow-2xl outline-none transition-all duration-300 ease-out hover:bg-white hover:shadow-3xl focus:bg-white focus:shadow-3xl focus:-translate-y-1 text-gray-800 placeholder-gray-500"
          />
        </div>

        {/* 搜索提示 */}
        <div className="text-white/60 text-sm animate-fade-in-up animation-delay-300">
          <p>💡 试试搜索：风景、美食、旅行、音乐...</p>
        </div>
      </div>
    </div>
  );
}
