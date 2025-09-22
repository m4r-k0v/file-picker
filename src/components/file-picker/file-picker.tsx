'use client';

import { useFilePicker } from '@/hooks/use-file-picker';
import { FilePickerHeader } from './file-picker-header';
import { Toolbar } from './toolbar';
import { FileList } from './file-list';
import { SelectionFooter } from './selection-footer';
import { ErrorState } from './error-state';

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
    indexedFileIds,
    isItemIndexed,
    isLoading,
    error,

    // Actions
    handleNavigate,
    handleBreadcrumbNavigate,
    handleFileSelect,
    clearSelection,
    handleSortChange,
    setSearchQuery,
    setFilters,
    refetch,
  } = useFilePicker({ onResourceSelection });

  // if (error) {
  //   return <ErrorState onRetry={refetch} />;
  // }

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
        <FileList
          files={filteredFiles}
          isLoading={isLoading}
          searchQuery={searchQuery}
          selectedFiles={selectedFiles}
          isItemIndexed={isItemIndexed}
          onFileSelect={handleFileSelect}
          onNavigate={handleNavigate}
        />
      </div>

      <SelectionFooter
        selectedCount={selectedFiles.size}
        showKnowledgeBaseButton={showKnowledgeBaseButton}
        onClearSelection={clearSelection}
        onShowKnowledgeBaseManager={onShowKnowledgeBaseManager}
      />
    </div>
  );
}