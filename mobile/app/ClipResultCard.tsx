import { ClipResultCard_clipMetadata$key } from "../graphql/__generated__/ClipResultCard_clipMetadata.graphql";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { graphql, useFragment } from "react-relay";

// SVG Icons (保持原有的图标组件)
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

// 更新GraphQL fragment，添加thumbnail字段
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
    thumbnail # 添加缩略图字段
  }
`;

export default function ClipResultCard({
  fragmentKey,
}: {
  fragmentKey: ClipResultCard_clipMetadata$key;
}) {
  const data = useFragment(fragment, fragmentKey);
  const videoUrl = `http://192.168.1.6:8081/${data.fileURL}`;
  const thumbnailUrl = data.thumbnail
    ? `http://192.168.1.6:8081/${data.thumbnail}`
    : null;

  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // 控制是否显示视频播放器

  // 使用新的 expo-video API
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.muted = true;
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

  // 当视频准备就绪时
  useEffect(() => {
    if (status === "readyToPlay") {
      setIsVideoReady(true);
      if (!hasStartedPlaying) {
        player.currentTime = 0;
      }
    }
  }, [status, hasStartedPlaying]);

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
        // 第一次播放时显示视频播放器并取消静音
        if (!hasStartedPlaying) {
          setShowVideo(true);
          player.muted = false;
          setHasStartedPlaying(true);
        }
        player.play();
      }
    } catch (error) {
      console.error("视频播放控制错误:", error);
    }
  };

  // 处理缩略图点击
  const handleThumbnailPress = () => {
    setShowVideo(true);
    handlePlayPause();
  };

  return (
    <View style={styles.card}>
      {/* 视频区域 */}
      <View style={styles.videoContainer}>
        {/* 缩略图层 - 优先显示 */}
        {!showVideo && thumbnailUrl && (
          <TouchableOpacity
            style={styles.thumbnailContainer}
            onPress={handleThumbnailPress}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              onLoad={() => setThumbnailLoaded(true)}
              onError={() => setThumbnailError(true)}
              resizeMode="cover"
            />

            {/* 缩略图加载状态 */}
            {!thumbnailLoaded && !thumbnailError && (
              <View style={styles.thumbnailPlaceholder}>
                <View style={styles.placeholderContent}>
                  <PlayIcon size={48} color="#9CA3AF" />
                  <Text style={styles.placeholderText}>加载缩略图...</Text>
                </View>
              </View>
            )}

            {/* 缩略图加载失败 */}
            {thumbnailError && (
              <View style={styles.thumbnailPlaceholder}>
                <View style={styles.placeholderContent}>
                  <PlayIcon size={48} color="#9CA3AF" />
                  <Text style={styles.placeholderText}>无缩略图</Text>
                </View>
              </View>
            )}

            {/* 播放按钮覆盖层 */}
            {(thumbnailLoaded || thumbnailError) && (
              <View style={styles.thumbnailOverlay}>
                <View style={styles.playButton}>
                  <PlayIcon size={32} color="#FFFFFF" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* 视频播放器 - 仅在需要时显示 */}
        {(showVideo || !thumbnailUrl) && (
          <>
            <VideoView
              style={styles.video}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
              nativeControls={false}
            />

            {/* 视频加载占位符 */}
            {!isVideoReady && (
              <View style={styles.placeholderContainer}>
                <View style={styles.placeholderContent}>
                  <PlayIcon size={48} color="#9CA3AF" />
                  <Text style={styles.placeholderText}>加载视频...</Text>
                </View>
              </View>
            )}

            {/* 视频播放控制覆盖层 */}
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

            {/* 错误状态 */}
            {status === "error" && (
              <TouchableOpacity
                style={styles.statusOverlay}
                onPress={() => {
                  setIsVideoReady(false);
                  setHasStartedPlaying(false);
                  setShowVideo(false); // 重置到缩略图状态
                  player.replace(videoUrl);
                }}
              >
                <Text style={styles.statusText}>加载失败，点击重试</Text>
              </TouchableOpacity>
            )}
          </>
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
      </View>

      {/* 卡片内容 */}
      <View style={styles.cardContent}>
        {/* 单词标题 */}
        <View style={styles.titleSection}>
          <Text style={styles.wordTitle}>"{data.word}"</Text>
          <Text style={styles.filename} numberOfLines={1}>
            {data.sentence}
          </Text>
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
  // 缩略图相关样式
  thumbnailContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)", // 半透明遮罩
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
