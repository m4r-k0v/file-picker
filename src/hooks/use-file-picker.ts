'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useFiles, useIndexedFiles, useBulkIndexFiles, useBulkDeIndexFiles } from '@/hooks/use-stackai-files';
import { SortField, SortDirection, FilterConfig, DriveItem } from '@/types/api';

export type BreadcrumbItem = {
  id: string;
  name: string;
}

export type UseFilePickerProps = {
  onResourceSelection?: (resourceIds: string[]) => void;
}

export function useFilePicker({ onResourceSelection }: UseFilePickerProps = {}) {
  // State management
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterConfig>({
    typeFilter: 'all',
    indexedFilter: 'all',
  });

  // Use ref to store the callback to avoid dependency issues
  const onResourceSelectionRef = useRef(onResourceSelection);
  onResourceSelectionRef.current = onResourceSelection;

  // API queries
  const { data: filesData, isLoading, error, refetch } = useFiles({
    folderId: currentFolderId,
    nameFilter: searchQuery || undefined,
  });

  const { data: indexedData = { resourceIds: [], indexedFolders: [] } } = useIndexedFiles();
  const indexedFileIds = useMemo(() => indexedData.resourceIds || [], [indexedData.resourceIds]);

  // Bulk operations
  const bulkIndexMutation = useBulkIndexFiles();
  const bulkDeIndexMutation = useBulkDeIndexFiles();

  // Helper function to check if an item is indexed (directly or through parent folder)
  const isItemIndexed = useCallback((item: DriveItem) => {
    // Check if the item itself is indexed
    if (indexedFileIds.includes(item.id)) {
      return true;
    }
    
    // For files, check if they're in an indexed folder
    // This is a simplified check - in a real app you'd need proper path matching
    if (item.type === 'file' && item.parentId) {
      return indexedFileIds.includes(item.parentId);
    }
    
    return false;
  }, [indexedFileIds]);

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    if (!filesData?.files) return [];

    let filtered = filesData.files;

    // Apply type filter
    if (filters.typeFilter === 'files') {
      filtered = filtered.filter(item => item.type === 'file');
    } else if (filters.typeFilter === 'folders') {
      filtered = filtered.filter(item => item.type === 'folder');
    }

    // Apply indexed filter
    if (filters.indexedFilter === 'indexed') {
      filtered = filtered.filter(item => isItemIndexed(item));
    } else if (filters.indexedFilter === 'not-indexed') {
      filtered = filtered.filter(item => !isItemIndexed(item));
    }

    // Apply client-side sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'size':
          aValue = a.size || 0;
          bValue = b.size || 0;
          break;
        case 'createdTime':
          aValue = new Date(a.createdTime);
          bValue = new Date(b.createdTime);
          break;
        case 'modifiedTime':
          aValue = new Date(a.modifiedTime);
          bValue = new Date(b.modifiedTime);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [filesData?.files, filters, isItemIndexed, sortField, sortDirection]);

  // Navigation handlers - memoized to prevent unnecessary re-renders
  const handleNavigate = useCallback((folderId?: string, folderName?: string) => {
    if (folderId) {
      // Navigate into folder
      setBreadcrumbPath(prev => [...prev, { id: folderId, name: folderName || 'Unknown' }]);
    } else {
      // Navigate to root
      setBreadcrumbPath([]);
    }
    setCurrentFolderId(folderId);
    setSelectedFiles(new Set());
  }, []);

  const handleBreadcrumbNavigate = useCallback((folderId?: string) => {
    if (!folderId) {
      // Navigate to root
      setBreadcrumbPath([]);
      setCurrentFolderId(undefined);
    } else {
      // Navigate to specific folder in breadcrumb
      setBreadcrumbPath(prev => {
        const folderIndex = prev.findIndex(item => item.id === folderId);
        if (folderIndex >= 0) {
          return prev.slice(0, folderIndex + 1);
        }
        return prev;
      });
      setCurrentFolderId(folderId);
    }
    setSelectedFiles(new Set());
  }, []);

  // Selection handlers - memoized to prevent unnecessary re-renders
  const handleFileSelect = useCallback((fileId: string, selected: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(fileId);
      } else {
        newSet.delete(fileId);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  // Sort handlers - memoized to prevent unnecessary re-renders
  const handleSortChange = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  // Calculate selection statistics
  const selectedFilesArray = useMemo(() => Array.from(selectedFiles), [selectedFiles]);
  const selectedItems = useMemo(() => {
    if (!filesData?.files) return [];
    return filesData.files.filter(item => selectedFiles.has(item.id));
  }, [filesData?.files, selectedFiles]);

  const selectedIndexedCount = useMemo(() => {
    return selectedItems.filter(item => isItemIndexed(item)).length;
  }, [selectedItems, isItemIndexed]);

  const selectedNotIndexedCount = useMemo(() => {
    return selectedItems.filter(item => !isItemIndexed(item)).length;
  }, [selectedItems, isItemIndexed]);

  // Bulk action handlers
  const handleBulkIndex = useCallback((fileIds: string[]) => {
    const notIndexedIds = fileIds.filter(id => {
      const item = filesData?.files?.find(f => f.id === id);
      return item && !isItemIndexed(item);
    });
    if (notIndexedIds.length > 0) {
      bulkIndexMutation.mutate({ fileIds: notIndexedIds });
    }
  }, [filesData?.files, isItemIndexed, bulkIndexMutation]);

  const handleBulkDeIndex = useCallback((fileIds: string[]) => {
    const indexedIds = fileIds.filter(id => {
      const item = filesData?.files?.find(f => f.id === id);
      return item && isItemIndexed(item);
    });
    if (indexedIds.length > 0) {
      bulkDeIndexMutation.mutate({ fileIds: indexedIds });
    }
  }, [filesData?.files, isItemIndexed, bulkDeIndexMutation]);

  // Only trigger when selectedFiles actually changes
  useEffect(() => {
    const selectedIds = Array.from(selectedFiles);
    if (onResourceSelectionRef.current) {
      onResourceSelectionRef.current(selectedIds);
    }
  }, [selectedFiles]); // Remove notifyResourceSelection from dependencies

  return {
    // State
    currentFolderId,
    breadcrumbPath,
    selectedFiles,
    searchQuery,
    sortField,
    sortDirection,
    filters,
    
    // Data
    filteredFiles,
    indexedFileIds,
    isItemIndexed, // Add the helper function
    isLoading,
    error,
    
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
    refetch,
    
    // Bulk actions
    handleBulkIndex,
    handleBulkDeIndex,
    isBulkIndexing: bulkIndexMutation.isPending,
    isBulkDeIndexing: bulkDeIndexMutation.isPending,
  };
}
