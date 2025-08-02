import graphql from "babel-plugin-relay/macro";
import { useFragment } from "react-relay";
import { ClipResultCard_clipMetadata$key } from "./__generated__/ClipResultCard_clipMetadata.graphql";

const fragment = graphql`
  fragment ClipResultCard_clipMetadata on EntClipMetadata {
    id
    filename
    fileURL
    fileSize
    duration
    format
    word
    sentence
  }
`;

export default function ClipResultCard({
  fragmentKey,
}: {
  fragmentKey: ClipResultCard_clipMetadata$key;
}) {
  const data = useFragment(fragment, fragmentKey);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // 格式化时长
  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "http://localhost:8081/" + data.fileURL;
    link.download = data.filename;
    link.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* 视频区域 */}
      <div className="relative aspect-video">
        <video
          className="w-full h-full object-cover"
          src={encodeURI("http://localhost:8081/" + data.fileURL)}
          controls
          preload="metadata"
          onError={(e) => {
            console.error("视频错误:", e);
            console.log("原始 URL:", "http://localhost:8081/" + data.fileURL);
            console.log(
              "编码 URL:",
              encodeURI("http://localhost:8081/" + data.fileURL)
            );

            // 测试网络请求
            fetch(encodeURI("http://localhost:8081/" + data.fileURL), {
              method: "HEAD",
            })
              .then((response) => {
                console.log("网络状态:", response.status);
                console.log(
                  "Content-Type:",
                  response.headers.get("Content-Type")
                );
              })
              .catch((err) => console.error("网络请求失败:", err));
          }}
          onLoadStart={() => console.log("✅ 开始加载视频")}
          onLoadedMetadata={() => console.log("✅ 元数据加载完成")}
          onCanPlay={() => console.log("✅ 视频可以播放")}
          onCanPlayThrough={() => console.log("✅ 视频可以流畅播放")}
          onPlay={() => console.log("▶️ 视频开始播放")}
          onPause={() => console.log("⏸️ 视频暂停")}
          onWaiting={() => console.log("⏳ 视频缓冲中")}
          onStalled={() => console.log("❌ 视频加载停滞")}
          onSuspend={() => console.log("⏹️ 视频加载暂停")}
        >
          <source
            src={encodeURI("http://localhost:8081/" + data.fileURL)}
            type="video/mp4"
          />
          <source
            src={encodeURI("http://localhost:8081/" + data.fileURL)}
            type={`video/${data.format.toLowerCase()}`}
          />
          您的浏览器不支持视频播放。
        </video>

        {/* 时长标签 */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {formatDuration(data.duration)}
        </div>

        {/* 格式标签 */}
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          {data.format.toUpperCase()}
        </div>
      </div>

      {/* 卡片内容 */}
      <div className="p-4">
        {/* 单词标题 */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            "{data.word}"
          </h3>
          <p className="text-sm text-gray-500 truncate" title={data.sentence}>
            {data.filename}
          </p>
        </div>

        {/* 元数据信息 */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span>{formatFileSize(data.fileSize)}</span>
          </div>

          <div className="text-xs text-gray-400">ID: {data.id}</div>
        </div>

        {/* 下载按钮 */}
        <div className="mt-4">
          <button
            onClick={handleDownload}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            下载
          </button>
        </div>
      </div>
    </div>
  );
}
