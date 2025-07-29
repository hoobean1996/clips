import { useState } from "react";

interface ClipEmptyResultProps {
  query?: string;
  onRetry?: () => Promise<void>;
  onClearSearch?: () => void;
  onTagClick?: (tag: string) => void;
}

export default function ClipEmptyResult({
  query,
  onRetry,
  onClearSearch,
  onTagClick,
}: ClipEmptyResultProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    if (onRetry) {
      await onRetry();
    }
    setTimeout(() => setIsRetrying(false), 1000);
  };

  const popularTags = ["风景", "美食", "旅行", "音乐"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 可爱的空状态图标 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4">
            <div className="text-4xl">🎬</div>
          </div>
        </div>

        {/* 标题 */}
        {query && (
          <p className="text-gray-500 mb-6">
            搜索 "<span className="font-medium text-gray-700">{query}</span>"
            暂无结果
          </p>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3 mb-8">
          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-70 disabled:scale-100"
            >
              {isRetrying ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>搜索中...</span>
                </div>
              ) : (
                "🔄 重新搜索"
              )}
            </button>
          )}

          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="bg-white text-gray-600 px-6 py-3 rounded-full font-medium border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              ✨ 清除搜索
            </button>
          )}
        </div>

        {/* 热门标签 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
            试试其他标签
          </h3>

          <div className="flex flex-wrap justify-center gap-2">
            {popularTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => onTagClick?.(tag)}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 rounded-full text-sm font-medium hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 hover:scale-105 shadow-sm"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* 底部提示 */}
        <p className="text-gray-400 text-sm mt-6 flex items-center justify-center gap-1">
          <span>💡</span>
          换个关键词试试看吧
        </p>
      </div>
    </div>
  );
}

export type { ClipEmptyResultProps };
