import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

const PlayIcon = ({ color = "#FFFFFF" }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
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

const HeartIcon = ({ color = "#6B7280" }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DownloadIcon = ({ color = "#6B7280" }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShareIcon = ({ color = "#6B7280" }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FireIcon = ({ color = "#F59E0B" }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.5 2 8.5 6 8.5 6s-1.5-2-4.5-2c0 4 2 6 2 6-2 2-2 6 2 8 1 1 2 1 4 1s3 0 4-1c4-2 4-6 2-8 0 0 2-2 2-6-3 0-4.5 2-4.5 2S15.5 2 12 2z"
      fill={color}
    />
  </Svg>
);

// 模拟数据
const mockData = {
  date: "2025年8月2日星期六",
  day: 15,
  streak: 15,
  word: "Serendipity",
  level: "Advanced",
  chineseMeaning: "意外发现珍奇事物的能力；巧合",
  englishMeaning:
    "The occurrence and development of events by chance in a happy or beneficial way",
  examples: [
    {
      english:
        "A fortunate stroke of serendipity brought the two old friends together.",
      chinese: "一次幸运的巧合让两个老朋友重逢了。",
    },
  ],
  video: {
    title: "Understanding 'Serendipity' - Daily Word",
    thumbnail: "https://via.placeholder.com/400x225/8B5CF6/FFFFFF?text=Video",
    duration: "3:45",
    views: "2.1k",
  },
};

export default function DailyWordScreen() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleVideoPress = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 单词卡片 */}
        <View style={styles.wordCard}>
          <Text style={styles.word}>{mockData.word}</Text>

          <View style={styles.levelContainer}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>noun</Text>
            </View>
            <View style={[styles.levelBadge, styles.advancedBadge]}>
              <Text style={styles.advancedText}>{mockData.level}</Text>
            </View>
          </View>

          {/* 英文释义 */}
          <View style={styles.meaningSection}>
            <Text style={styles.sectionTitle}>英文释义</Text>
            <Text style={styles.englishMeaning}>{mockData.englishMeaning}</Text>
          </View>

          {/* 配套视频 */}
          <View style={styles.videoSection}>
            <Text style={styles.sectionTitle}>▶️ 配套视频</Text>

            <TouchableOpacity
              style={styles.videoContainer}
              onPress={handleVideoPress}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: mockData.video.thumbnail }}
                style={styles.videoThumbnail}
                resizeMode="cover"
              />

              {/* 播放按钮覆盖层 */}
              <View style={styles.videoOverlay}>
                <View style={styles.playButton}>
                  <PlayIcon />
                </View>
              </View>

              {/* 视频信息 */}
              <View style={styles.videoInfo}>
                <View style={styles.videoStats}>
                  <Text style={styles.videoViews}>
                    👁 {mockData.video.views}
                  </Text>
                  <Text style={styles.videoDuration}>
                    {mockData.video.duration}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <Text style={styles.videoTitle}>{mockData.video.title}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  streakBadge: {
    backgroundColor: "#FEF3F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  streakText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  dateText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  navText: {
    fontSize: 14,
    color: "#8B5CF6",
    fontWeight: "500",
  },
  dayIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  wordCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  word: {
    fontSize: 36,
    fontWeight: "700",
    color: "#8B5CF6",
    textAlign: "center",
    marginBottom: 12,
  },
  levelContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  levelBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  advancedBadge: {
    backgroundColor: "#F3E8FF",
  },
  advancedText: {
    fontSize: 12,
    color: "#8B5CF6",
    fontWeight: "600",
  },
  meaningSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  chineseMeaning: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
  },
  englishMeaning: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    fontStyle: "italic",
  },
  exampleSection: {
    marginBottom: 24,
  },
  exampleItem: {
    backgroundColor: "#FFFBEB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  exampleEnglish: {
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 20,
  },
  exampleChinese: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  videoSection: {
    marginBottom: 24,
  },
  videoContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  videoThumbnail: {
    width: "100%",
    height: 200,
    backgroundColor: "#F3F4F6",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(139, 92, 246, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoInfo: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  videoStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  videoViews: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  videoDuration: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  videoActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  progressSection: {
    marginTop: 8,
  },
  progressCard: {
    backgroundColor: "#8B5CF6",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  progressStatus: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.9,
  },
});
