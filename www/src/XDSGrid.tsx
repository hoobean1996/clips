import { ChevronLeft, ChevronRight, MoreVertical, Search } from "lucide-react";
import React, { useEffect, useState } from "react";

export type ActionMenuItem<T> = {
  label: string;
  onClick: (item: T) => void;
  icon?: React.ReactNode;
};

/**
 * Grid item render function type
 */
export type GridItemRenderer<T> = (item: T) => React.ReactElement | null;

/**
 * Relay pagination interface
 */
export type RelayPagination = {
  loadNext?: (count: number) => void;
  loadPrevious?: (count: number) => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isLoadingNext?: boolean;
  isLoadingPrevious?: boolean;
  refetch?: (variables: any) => void;
};

/**
 * Props for the XDSGrid component
 */
type Props<T> = {
  data: T[];
  renderItem: GridItemRenderer<T>;
  title?: string;
  showFilter?: boolean;
  itemsPerPage?: number;
  onItemClick?: (item: T) => void;
  keyExtractor?: (item: T) => string | number;
  actions?: ActionMenuItem<T>[];
  showActions?: boolean;
  pagination?: RelayPagination;
  onSearchTermChange?: (term: string) => void;
  refetch?: (variables: any) => void;
  gridCols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: number;
  emptyStateMessage?: string;
  emptyStateComponent?: React.ReactElement;
};

// 关于Pagination
// 1. Fragment中定义的是默认情况下，我们认为合适的分页大小
// 2. useLazyLoadQuery中的是第一次请求的大小
// 3. itemsPerPage 用于点击网格下一页的时候请求的大小
// - 三个值应该保持一致

export default function XDSGrid<T>({
  data,
  renderItem,
  title = "Data Grid",
  showFilter = true,
  showActions = true,
  actions = [],
  itemsPerPage = 12,
  onItemClick,
  keyExtractor = (item: T) => JSON.stringify(item),
  pagination,
  refetch,
  onSearchTermChange,
  gridCols = 3,
  gap = 4,
  emptyStateMessage = "No data available",
  emptyStateComponent,
}: Props<T>) {
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
  const toggleActionMenu = (itemKey: string | number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent item click when clicking on action menu
    setActionMenuOpen(actionMenuOpen === itemKey ? null : itemKey);
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActionMenuOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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

  const handleLoadPrevious = () => {
    if (
      pagination?.loadPrevious &&
      !pagination.isLoadingPrevious &&
      pagination.hasPrevious
    ) {
      pagination.loadPrevious(itemsPerPage);
    }
  };

  // Handle local pagination
  const handleNextPage = () => {
    if (isRelayPagination) {
      handleLoadNext();
    } else {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }
  };

  const handlePreviousPage = () => {
    if (isRelayPagination) {
      handleLoadPrevious();
    } else {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    }
  };

  // Handle refetch
  const handleRefetch = () => {
    if (pagination?.refetch) {
      pagination.refetch({});
    } else if (refetch) {
      refetch({});
    }
  };

  // Generate grid column classes
  const getGridColsClass = () => {
    const colsMap = {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
      6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
    };
    return colsMap[gridCols];
  };

  // Generate gap class
  const getGapClass = () => {
    return `gap-${gap}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Header with search and filter */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-medium text-gray-800">{title}</h2>
          {showFilter && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search ..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    onSearchTermChange && onSearchTermChange(e.target.value);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="p-5 min-h-[400px]">
        {currentItems.length > 0 ? (
          <div className={`grid ${getGridColsClass()} ${getGapClass()}`}>
            {currentItems.map((item) => (
              <div
                key={keyExtractor(item)}
                className={`relative group ${
                  onItemClick ? "cursor-pointer" : ""
                } hover:shadow-md transition-shadow duration-200`}
                onClick={() => onItemClick && onItemClick(item)}
              >
                {/* Grid Item Content */}
                <div className="w-full h-full">{renderItem(item)}</div>

                {/* Action Menu */}
                {showActions && actions && actions.length > 0 && (
                  <div
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="p-1 rounded-full bg-white shadow-md text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={(e) => toggleActionMenu(keyExtractor(item), e)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {actionMenuOpen === keyExtractor(item) && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div
                          className="py-1"
                          role="menu"
                          aria-orientation="vertical"
                        >
                          {actions.map((action, idx) => (
                            <button
                              key={idx}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(item);
                                setActionMenuOpen(null);
                              }}
                            >
                              {action.icon && (
                                <span className="mr-2">{action.icon}</span>
                              )}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            {emptyStateComponent || (
              <div className="text-center">
                <p className="text-sm">{emptyStateMessage}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {((isRelayPagination &&
        (pagination?.hasNext || pagination?.hasPrevious)) ||
        (!isRelayPagination && totalPages > 1)) && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={
                isRelayPagination
                  ? !pagination?.hasPrevious || pagination?.isLoadingPrevious
                  : currentPage === 1
              }
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                (
                  isRelayPagination
                    ? !pagination?.hasPrevious || pagination?.isLoadingPrevious
                    : currentPage === 1
                )
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {pagination?.isLoadingPrevious ? "Loading..." : "Previous"}
            </button>
            <button
              onClick={handleNextPage}
              disabled={
                isRelayPagination
                  ? !pagination?.hasNext || pagination?.isLoadingNext
                  : currentPage === totalPages
              }
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                (
                  isRelayPagination
                    ? !pagination?.hasNext || pagination?.isLoadingNext
                    : currentPage === totalPages
                )
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {pagination?.isLoadingNext ? "Loading..." : "Next"}
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              {!isRelayPagination && (
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, data.length)}
                  </span>{" "}
                  of <span className="font-medium">{data.length}</span> items
                </p>
              )}
              {isRelayPagination && (
                <p className="text-sm text-gray-700">
                  {pagination?.isLoadingNext || pagination?.isLoadingPrevious
                    ? "Loading..."
                    : `Showing ${data.length} items`}
                </p>
              )}
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                {/* Previous button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={
                    isRelayPagination
                      ? !pagination?.hasPrevious ||
                        pagination?.isLoadingPrevious
                      : currentPage === 1
                  }
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${
                    (
                      isRelayPagination
                        ? !pagination?.hasPrevious ||
                          pagination?.isLoadingPrevious
                        : currentPage === 1
                    )
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft size={16} />
                </button>

                {/* Page numbers - only show for local pagination */}
                {!isRelayPagination && totalPages <= 5
                  ? [...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                          currentPage === i + 1
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))
                  : !isRelayPagination &&
                    [
                      ...Array(
                        Math.min(
                          5,
                          totalPages -
                            Math.max(
                              0,
                              currentPage + 2 - Math.min(totalPages, 5)
                            )
                        )
                      ),
                    ].map((_, i) => {
                      const pageNum = Math.max(
                        1,
                        currentPage -
                          Math.min(
                            2,
                            Math.max(
                              0,
                              currentPage + 2 - Math.min(totalPages, 5)
                            )
                          ) +
                          i
                      );
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            currentPage === pageNum
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                {/* Next button */}
                <button
                  onClick={handleNextPage}
                  disabled={
                    isRelayPagination
                      ? !pagination?.hasNext || pagination?.isLoadingNext
                      : currentPage === totalPages
                  }
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${
                    (
                      isRelayPagination
                        ? !pagination?.hasNext || pagination?.isLoadingNext
                        : currentPage === totalPages
                    )
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {(pagination?.isLoadingNext || pagination?.isLoadingPrevious) && (
        <div className="flex justify-center items-center p-4 border-t border-gray-200">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}
