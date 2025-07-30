import { Suspense, useState, useMemo, useCallback } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import ClipResultContainerQueryContainer from "../ClipResultGridContainerQueryContainer";

export default function HomeScreen() {
  const [query, setQuery] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>(""); // 用于实际搜索的状态

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 搜索区域 */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleTextChange}
            placeholder="搜索视频、关键词..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            selectTextOnFocus={false}
            blurOnSubmit={false}
          />
        </View>

        {/* 结果区域 */}
        <Suspense fallback={<ActivityIndicator />}>
          <View style={styles.resultsSection}>
            <ClipResultContainerQueryContainer keyword={searchQuery} />
          </View>
        </Suspense>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
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
  resultsSection: {
    flex: 1,
  },
});
