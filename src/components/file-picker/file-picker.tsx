'use client';

import { useFilePicker } from '@/hooks/use-file-picker';
import { FilePickerHeader } from './file-picker-header';
import { Toolbar } from './toolbar';
import { FileList } from './file-list';
import { FileListVirtualized } from './file-list-virtualized';
import { SelectionFooter } from './selection-footer';

type FilePickerProps = {
  onResourceSelection?: (resourceIds: string[]) => void;
  showKnowledgeBaseButton?: boolean;
  onShowKnowledgeBaseManager?: () => void;
}

export function FilePicker({
  onResourceSelection,
  showKnowledgeBaseButton = false,
  onShowKnowledgeBaseManager
}: FilePickerProps = {}) {
  const {
    // State
    breadcrumbPath,
    selectedFiles,
    searchQuery,
    sortField,
    sortDirection,
    filters,

    // Data
    filteredFiles,
    isItemIndexed,
    isLoading,

    // Selection statistics
    selectedFilesArray,
    selectedIndexedCount,
    selectedNotIndexedCount,

    // Actions
    handleNavigate,
    handleBreadcrumbNavigate,
    handleFileSelect,
    clearSelection,
    handleSortChange,
    setSearchQuery,
    setFilters,

    // Bulk actions
    handleBulkIndex,
    handleBulkDeIndex,
    isBulkIndexing,
    isBulkDeIndexing,
  } = useFilePicker({ onResourceSelection });


  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <FilePickerHeader
        breadcrumbPath={breadcrumbPath}
        onBreadcrumbNavigate={handleBreadcrumbNavigate}
      />

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        filters={filters}
        onFilterChange={setFilters}
      />

      <div className="min-h-96">
        {filteredFiles.length > 50 ? (
          <FileListVirtualized
            files={filteredFiles}
            isLoading={isLoading}
            searchQuery={searchQuery}
            selectedFiles={selectedFiles}
            isItemIndexed={isItemIndexed}
            onFileSelect={handleFileSelect}
            onNavigate={handleNavigate}
          />
        ) : (
          <FileList
            files={filteredFiles}
            isLoading={isLoading}
            searchQuery={searchQuery}
            selectedFiles={selectedFiles}
            isItemIndexed={isItemIndexed}
            onFileSelect={handleFileSelect}
            onNavigate={handleNavigate}
          />
        )}
      </div>

      <SelectionFooter
        selectedCount={selectedFiles.size}
        selectedFiles={selectedFilesArray}
        selectedIndexedCount={selectedIndexedCount}
        selectedNotIndexedCount={selectedNotIndexedCount}
        showKnowledgeBaseButton={showKnowledgeBaseButton}
        onClearSelection={clearSelection}
        onShowKnowledgeBaseManager={onShowKnowledgeBaseManager}
        onBulkIndex={handleBulkIndex}
        onBulkDeIndex={handleBulkDeIndex}
        isBulkIndexing={isBulkIndexing}
        isBulkDeIndexing={isBulkDeIndexing}
      />
    </div>
  );
}