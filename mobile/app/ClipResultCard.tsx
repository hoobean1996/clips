import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { graphql, useFragment } from "react-relay";
import { ClipResultCard_clipMetadata$key } from "./__generated__/ClipResultCard_clipMetadata.graphql";

// SVG Icons
const FileIcon = ({ size = 16, color = "#6B7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DownloadIcon = ({ size = 16, color = "#6B7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlayIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 5v14l11-7z"
      fill={color}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PauseIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 4h4v16H6zM14 4h4v16h-4z"
      fill={color}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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
  const videoUrl = `http://192.168.1.6:8081/${data.fileURL}`;
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // 使用新的 expo-video API
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.muted = true; // 静音预加载
    // 预加载到第一帧但不播放
    player.currentTime = 0;
  });

  // 监听播放状态变化
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // 监听视频状态变化
  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });

  // 当视频准备就绪时，显示第一帧
  useEffect(() => {
    if (status === "readyToPlay") {
      setIsVideoReady(true);
      // 确保停在第一帧
      if (!hasStartedPlaying) {
        player.currentTime = 0;
      }
    }
  }, [status, hasStartedPlaying]);

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

  const handleDownload = async () => {
    const url = `http://192.168.1.6:8081/${data.fileURL}`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        Alert.alert("下载视频", "即将在浏览器中打开下载链接", [
          { text: "取消", style: "cancel" },
          {
            text: "确定",
            onPress: () => Linking.openURL(url),
          },
        ]);
      } else {
        Alert.alert("错误", "无法打开下载链接");
      }
    } catch (error) {
      console.error("下载错误:", error);
      Alert.alert("下载失败", "请稍后重试");
    }
  };

  // 处理播放/暂停
  const handlePlayPause = () => {
    try {
      if (isPlaying) {
        player.pause();
      } else {
        // 第一次播放时取消静音并标记已开始播放
        if (!hasStartedPlaying) {
          player.muted = false;
          setHasStartedPlaying(true);
        }
        player.play();
      }
    } catch (error) {
      console.error("视频播放控制错误:", error);
    }
  };

  return (
    <View style={styles.card}>
      {/* 视频区域 */}
      <View style={styles.videoContainer}>
        {/* 视频播放器 - 始终显示 */}
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
          nativeControls={false}
        />

        {/* 加载占位符 */}
        {!isVideoReady && (
          <View style={styles.placeholderContainer}>
            <View style={styles.placeholderContent}>
              <PlayIcon size={48} color="#9CA3AF" />
              <Text style={styles.placeholderText}>加载中...</Text>
            </View>
          </View>
        )}

        {/* 播放控制覆盖层 */}
        {isVideoReady && (
          <TouchableOpacity
            style={styles.videoOverlay}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            {/* 播放按钮 - 只在未播放时显示 */}
            {!isPlaying && (
              <View style={styles.playButton}>
                <PlayIcon size={32} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* 时长标签 */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatDuration(data.duration)}
          </Text>
        </View>

        {/* 格式标签 */}
        <View style={styles.formatBadge}>
          <Text style={styles.formatText}>{data.format.toUpperCase()}</Text>
        </View>

        {/* 状态指示器 */}
        {status === "error" && (
          <TouchableOpacity
            style={styles.statusOverlay}
            onPress={() => {
              // 重新加载视频
              setIsVideoReady(false);
              setHasStartedPlaying(false);
              player.replace(videoUrl);
            }}
          >
            <Text style={styles.statusText}>加载失败，点击重试</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 卡片内容 */}
      <View style={styles.cardContent}>
        {/* 单词标题 */}
        <View style={styles.titleSection}>
          <Text style={styles.wordTitle}>"{data.word}"</Text>
          <Text style={styles.filename} numberOfLines={1}>
            {data.filename}
          </Text>
        </View>

        {/* 元数据信息 */}
        <View style={styles.metadataRow}>
          <View style={styles.fileSizeContainer}>
            <FileIcon size={16} color="#6B7280" />
            <Text style={styles.metadataText}>
              {formatFileSize(data.fileSize)}
            </Text>
          </View>

          <Text style={styles.idText}>ID: {data.id}</Text>
        </View>

        {/* 操作按钮组 */}
        <View style={styles.actionsContainer}>
          {/* 播放控制按钮 */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePlayPause}
            activeOpacity={0.7}
          >
            {isPlaying ? (
              <PauseIcon size={16} color="#3B82F6" />
            ) : (
              <PlayIcon size={16} color="#3B82F6" />
            )}
            <Text style={styles.actionButtonText}>
              {isPlaying ? "暂停" : "播放"}
            </Text>
          </TouchableOpacity>

          {/* 下载按钮 */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDownload}
            activeOpacity={0.7}
          >
            <DownloadIcon size={16} color="#6B7280" />
            <Text style={styles.actionButtonTextSecondary}>下载</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  videoContainer: {
    position: "relative",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContent: {
    alignItems: "center",
    opacity: 0.6,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  durationBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  durationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  formatBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  formatText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statusOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#3B82F6",
    borderTopColor: "transparent",
    marginBottom: 12,
    // 注意：React Native 不支持 CSS 动画，这里只是样式
  },
  statusText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  cardContent: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  wordTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  filename: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
    lineHeight: 20,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  fileSizeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metadataText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  idText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  actionButtonText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtonTextSecondary: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});
