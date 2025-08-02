import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

const SearchIcon = ({ size = 64, color = "#E5E7EB" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={1.5} />
    <Path
      d="m21 21-4.35-4.35"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function ClipEmptyResult() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 图标 */}
        <View style={styles.iconContainer}>
          <SearchIcon size={72} color="#D1D5DB" />
        </View>

        {/* 主标题 */}
        <Text style={styles.title}>开始搜索</Text>

        {/* 描述文字 */}
        <Text style={styles.description}>输入关键词搜索相关视频片段</Text>

        {/* 提示文字 */}
        <Text style={styles.hint}>💡 试试搜索单词、短语或话题</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  content: {
    alignItems: "center",
    maxWidth: 280,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  hint: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
});
