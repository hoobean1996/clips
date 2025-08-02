import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

// TypeScript 接口定义
interface IconProps {
  size?: number;
  color?: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  progress: number;
  thumbnail: string;
}

interface MockData {
  dailyGoal: {
    current: number;
    target: number;
    unit: string;
  };
  streak: {
    days: number;
  };
  recentCourses: Course[];
  stats: {
    wordsLearned: number;
    videosCompleted: number;
  };
}

interface ProgressBarProps {
  progress: number;
  color?: string;
  backgroundColor?: string;
}

interface CourseCardProps {
  course: Course;
}

interface StatCardProps {
  value: number;
  label: string;
  color?: string;
}

interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

interface BottomTabProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

// SVG Icons
const TargetIcon: React.FC<IconProps> = ({ size = 20, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth={2} />
    <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth={2} />
  </Svg>
);

const TrendingUpIcon: React.FC<IconProps> = ({
  size = 20,
  color = "#10B981",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 7l-8.5 8.5-4-4L2 19"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 7h6v6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClockIcon: React.FC<IconProps> = ({ size = 16, color = "#6B7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
    <Path
      d="M12 6v6l4 2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HomeIcon: React.FC<IconProps> = ({ size = 24, color = "#9CA3AF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12h6v10"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BookIcon: React.FC<IconProps> = ({ size = 24, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 19.5A2.5 2.5 0 016.5 17H20"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UserIcon: React.FC<IconProps> = ({ size = 24, color = "#9CA3AF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={2} />
  </Svg>
);

// 模拟数据
const mockData: MockData = {
  dailyGoal: {
    current: 18,
    target: 30,
    unit: "分钟",
  },
  streak: {
    days: 7,
  },
  recentCourses: [
    {
      id: "1",
      title: "Ten Easy English Words",
      category: "Vocabulary",
      duration: "2小时前",
      progress: 80,
      thumbnail: "https://via.placeholder.com/60x40/E5E7EB/6B7280?text=EN",
    },
    {
      id: "2",
      title: "Daily Conversation Practice",
      category: "Speaking",
      duration: "昨天",
      progress: 45,
      thumbnail: "https://via.placeholder.com/60x40/E5E7EB/6B7280?text=SP",
    },
  ],
  stats: {
    wordsLearned: 156,
    videosCompleted: 12,
  },
};

// 进度条组件
const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = "#3B82F6",
  backgroundColor = "#E5E7EB",
}) => (
  <View style={[styles.progressBarContainer, { backgroundColor }]}>
    <View
      style={[
        styles.progressBarFill,
        {
          width: `${Math.min(Math.max(progress, 0), 100)}%`,
          backgroundColor: color,
        },
      ]}
    />
  </View>
);

// 课程卡片组件
const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const handleContinuePress = (): void => {
    console.log(`Continue course: ${course.id}`);
  };

  return (
    <View style={styles.courseCard}>
      <Image
        source={{ uri: course.thumbnail }}
        style={styles.courseThumbnail}
        resizeMode="cover"
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {course.title}
        </Text>
        <View style={styles.courseMetaContainer}>
          <Text style={styles.courseMeta}>{course.category}</Text>
          <Text style={styles.courseDot}>•</Text>
          <Text style={styles.courseMeta}>{course.duration}</Text>
        </View>
        <View style={styles.courseProgressContainer}>
          <ProgressBar progress={course.progress} />
          <Text style={styles.courseProgressText}>{course.progress}%</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinuePress}
        activeOpacity={0.7}
      >
        <Text style={styles.continueButtonText}>继续</Text>
      </TouchableOpacity>
    </View>
  );
};

// 统计卡片组件
const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  color = "#3B82F6",
}) => (
  <View style={styles.statCard}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// 标签页组件
const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.tabButtonActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text
      style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

// 底部导航组件
const BottomTab: React.FC<BottomTabProps> = ({
  icon: Icon,
  label,
  isActive,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.bottomTabButton}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon color={isActive ? "#3B82F6" : "#9CA3AF"} />
    <Text
      style={[
        styles.bottomTabLabel,
        { color: isActive ? "#3B82F6" : "#9CA3AF" },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// 主组件
export default function LearningScreen(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<string>("学习进度");
  const [activeBottomTab, setActiveBottomTab] =
    React.useState<string>("Learning");

  const handleTabPress = React.useCallback((tabName: string): void => {
    setActiveTab(tabName);
  }, []);

  const handleBottomTabPress = React.useCallback((tabName: string): void => {
    setActiveBottomTab(tabName);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>学习记录</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 目标和连续学习卡片 */}
        <View style={styles.statsRow}>
          {/* 今日目标 */}
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <TargetIcon size={20} color="#3B82F6" />
              <Text style={styles.goalTitle}>今日目标</Text>
            </View>
            <View style={styles.goalContent}>
              <Text style={styles.goalNumber}>
                {mockData.dailyGoal.current}
                <Text style={styles.goalTarget}>
                  {" / "}
                  {mockData.dailyGoal.target}
                  {mockData.dailyGoal.unit}
                </Text>
              </Text>
              <ProgressBar
                progress={
                  (mockData.dailyGoal.current / mockData.dailyGoal.target) * 100
                }
                color="#3B82F6"
              />
            </View>
          </View>

          {/* 连续学习 */}
          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <TrendingUpIcon size={20} color="#10B981" />
              <Text style={styles.streakTitle}>连续学习</Text>
            </View>
            <Text style={styles.streakNumber}>{mockData.streak.days} 天</Text>
          </View>
        </View>

        {/* 标签页 */}
        <View style={styles.tabContainer}>
          <TabButton
            title="学习进度"
            isActive={activeTab === "学习进度"}
            onPress={() => handleTabPress("学习进度")}
          />
          <TabButton
            title="收藏夹"
            isActive={activeTab === "收藏夹"}
            onPress={() => handleTabPress("收藏夹")}
          />
        </View>

        {/* 最近学习 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ClockIcon size={16} color="#6B7280" />
            <Text style={styles.sectionTitle}>最近学习</Text>
          </View>

          {mockData.recentCourses.map((course: Course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </View>

        {/* 学习统计 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学习统计</Text>
          <View style={styles.statsContainer}>
            <StatCard
              value={mockData.stats.wordsLearned}
              label="累计单词"
              color="#3B82F6"
            />
            <StatCard
              value={mockData.stats.videosCompleted}
              label="完成视频"
              color="#10B981"
            />
          </View>
        </View>

        {/* 底部留白 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 24,
  },
  goalCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  goalContent: {
    gap: 8,
  },
  goalNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  goalTarget: {
    fontSize: 16,
    fontWeight: "400",
    color: "#9CA3AF",
  },
  streakCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  tabButtonTextActive: {
    color: "#1F2937",
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  courseCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  courseThumbnail: {
    width: 60,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  courseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  courseMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  courseMeta: {
    fontSize: 12,
    color: "#6B7280",
  },
  courseDot: {
    fontSize: 12,
    color: "#6B7280",
    marginHorizontal: 6,
  },
  courseProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  courseProgressText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    minWidth: 32,
  },
  continueButton: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 20,
  },
  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  bottomTabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  bottomTabLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
});
