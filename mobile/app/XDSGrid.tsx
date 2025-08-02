import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

// SVG Icons as React Native components
const MoreVertical = ({ size = 20, color = "#9CA3AF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12h.01M12 6h.01M12 18h.01"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export type ActionMenuItem<T> = {
  label: string;
  onClick: (item: T) => void;
  icon?: React.ReactNode;
};

export type GridItemRenderer<T> = (item: T) => React.ReactElement | null;

export type RelayPagination = {
  loadNext?: (count: number) => void;
  loadPrevious?: (count: number) => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isLoadingNext?: boolean;
  isLoadingPrevious?: boolean;
  refetch?: (variables: any) => void;
};

type Props<T> = {
  data: T[];
  renderItem: GridItemRenderer<T>;
  itemsPerPage?: number;
  onItemClick?: (item: T) => void;
  keyExtractor?: (item: T) => string | number;
  actions?: ActionMenuItem<T>[];
  showActions?: boolean;
  pagination?: RelayPagination;
  onSearchTermChange?: (term: string) => void;
  emptyStateMessage?: string;
  emptyStateComponent?: React.ReactElement;
};

type XDSGridProps<T> = Props<T> & {
  showTitle?: boolean;
  containerStyle?: any;
};

export default function XDSGrid<T>({
  data,
  renderItem,
  showActions = true,
  actions = [],
  itemsPerPage = 12,
  onItemClick,
  keyExtractor = (item: T) => JSON.stringify(item),
  pagination,
  onSearchTermChange,
  emptyStateMessage = "暂无数据",
  emptyStateComponent,
  containerStyle,
}: XDSGridProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | number | null>(
    null
  );

  // Using relay pagination or local pagination based on what's provided
  const isRelayPagination = !!pagination;

  // Calculate total pages for local pagination
  const totalPages = !isRelayPagination
    ? Math.ceil(data.length / itemsPerPage)
    : 0;

  // Paginate data locally if not using relay pagination
  const currentItems = isRelayPagination
    ? data
    : data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle action menu toggle
  const toggleActionMenu = (itemKey: string | number) => {
    setActionMenuOpen(actionMenuOpen === itemKey ? null : itemKey);
  };

  // Handle relay pagination
  const handleLoadNext = () => {
    if (
      pagination?.loadNext &&
      !pagination.isLoadingNext &&
      pagination.hasNext
    ) {
      pagination.loadNext(itemsPerPage);
    }
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchTerm("");
    onSearchTermChange && onSearchTermChange("");
  };

  // Handle load more for infinite scroll
  const handleLoadMore = () => {
    if (isRelayPagination) {
      handleLoadNext();
    } else if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Check if can load more
  const canLoadMore = isRelayPagination
    ? pagination?.hasNext && !pagination?.isLoadingNext
    : currentPage < totalPages;

  // Render list item (单列布局)
  const renderListItem = ({ item, index }: { item: T; index: number }) => {
    const itemKey = keyExtractor(item);

    return (
      <View style={styles.listItem}>
        <Pressable
          style={[styles.listItemContent, onItemClick && styles.clickable]}
          onPress={() => onItemClick && onItemClick(item)}
        >
          {renderItem(item)}

          {/* Action Menu */}
          {showActions && actions && actions.length > 0 && (
            <View style={styles.actionMenuContainer}>
              <TouchableOpacity
                style={styles.actionMenuButton}
                onPress={() => toggleActionMenu(itemKey)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MoreVertical size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
        </Pressable>

        {/* Action Menu Modal */}
        <Modal
          visible={actionMenuOpen === itemKey}
          transparent
          animationType="fade"
          onRequestClose={() => setActionMenuOpen(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActionMenuOpen(null)}
          >
            <View style={styles.actionMenuModal}>
              {actions.map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.actionMenuItem}
                  onPress={() => {
                    action.onClick(item);
                    setActionMenuOpen(null);
                  }}
                >
                  {action.icon && (
                    <View style={styles.actionMenuIcon}>{action.icon}</View>
                  )}
                  <Text style={styles.actionMenuText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {emptyStateComponent || (
        <View style={styles.emptyStateContent}>
          <Text style={styles.emptyStateIcon}>📁</Text>
          <Text style={styles.emptyStateText}>{emptyStateMessage}</Text>
          <Text style={styles.emptyStateSubtext}>
            {searchTerm ? "尝试调整搜索关键词" : "暂时没有内容"}
          </Text>
        </View>
      )}
    </View>
  );

  // Render footer (load more indicator)
  const renderFooter = () => {
    if (pagination?.isLoadingNext) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      );
    }

    if (canLoadMore && !isRelayPagination) {
      return (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
        >
          <Text style={styles.loadMoreText}>加载更多</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* List Container */}
      <View style={styles.listContainer}>
        {data.length > 0 ? (
          <FlatList
            data={isRelayPagination ? data : currentItems}
            renderItem={renderListItem}
            keyExtractor={(item) => String(keyExtractor(item))}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={renderFooter}
            onEndReached={isRelayPagination ? handleLoadMore : undefined}
            onEndReachedThreshold={0.3}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  searchContainerFocused: {
    backgroundColor: "white",
    borderColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 16,
    fontWeight: "400",
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  flatListContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  listItem: {
    marginBottom: 16,
  },
  listItemContent: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  clickable: {
    // 可以添加点击效果
  },
  separator: {
    height: 0,
  },
  actionMenuContainer: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  actionMenuButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionMenuModal: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  actionMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionMenuIcon: {
    marginRight: 12,
  },
  actionMenuText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyStateContent: {
    alignItems: "center",
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  loadingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  loadMoreButton: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  loadMoreText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
  },
});
