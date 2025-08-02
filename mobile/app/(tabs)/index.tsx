import { Suspense, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import ClipResultContainerQueryContainer from "../ClipResultGridContainerQueryContainer";
import ClipEmptyResult from "../ClipEmptyResult";

// 搜索图标
const SearchIcon = ({ size = 20, color = "#9CA3AF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2} />
    <Path
      d="m21 21-4.35-4.35"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 清除图标
const ClearIcon = ({ size = 18, color = "#6B7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
    <Path
      d="m15 9-6 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="m9 9 6 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function HomeScreen() {
  const [query, setQuery] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>(""); // 用于实际搜索的状态
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // 防抖处理 - 延迟更新搜索查询
  const updateSearchQuery = useMemo(() => {
    let timeoutId: number;

    return (newQuery: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSearchQuery(newQuery);
      }, 300); // 300ms 延迟
    };
  }, []);

  // 处理输入变化
  const handleTextChange = useCallback(
    (text: string) => {
      setQuery(text); // 立即更新输入框显示
      updateSearchQuery(text); // 延迟更新搜索
    },
    [updateSearchQuery]
  );

  // 清除搜索内容
  const handleClear = useCallback(() => {
    setQuery("");
    setSearchQuery("");
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 搜索区域 */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchContainer,
              isFocused && styles.searchContainerFocused,
            ]}
          >
            {/* 搜索图标 */}
            <View style={styles.searchIconContainer}>
              <SearchIcon color={isFocused ? "#3B82F6" : "#9CA3AF"} size={20} />
            </View>

            {/* 搜索输入框 */}
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={handleTextChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="搜索视频、关键词..."
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              selectTextOnFocus={false}
            />

            {/* 清除按钮 */}
            {query.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
                activeOpacity={0.7}
              >
                <ClearIcon color="#9CA3AF" size={18} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Suspense fallback={<ActivityIndicator />}>
          <View style={styles.resultsSection}>
            {searchQuery === "" && <ClipEmptyResult />}
            {searchQuery !== "" && (
              <ClipResultContainerQueryContainer keyword={searchQuery} />
            )}
          </View>
        </Suspense>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchContainerFocused: {
    borderColor: "#3B82F6",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    height: 44,
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  resultsSection: {
    flex: 1,
  },
});
