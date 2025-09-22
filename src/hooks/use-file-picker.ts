'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useFiles, useIndexedFiles } from '@/hooks/use-stackai-files';
import { SortField, SortDirection, FilterConfig } from '@/types/api';

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

  const { data: indexedFileIds = [] } = useIndexedFiles();

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
      filtered = filtered.filter(item => indexedFileIds.includes(item.id));
    } else if (filters.indexedFilter === 'not-indexed') {
      filtered = filtered.filter(item => !indexedFileIds.includes(item.id));
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
  }, [filesData?.files, filters, indexedFileIds, sortField, sortDirection]);

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

  // Notify parent component about selected resources
  // Use useCallback to memoize the notification function
  const notifyResourceSelection = useCallback((selectedIds: string[]) => {
    if (onResourceSelectionRef.current) {
      onResourceSelectionRef.current(selectedIds);
    }
  }, []);

  // Only trigger when selectedFiles actually changes
  useEffect(() => {
    const selectedIds = Array.from(selectedFiles);
    notifyResourceSelection(selectedIds);
  }, [selectedFiles, notifyResourceSelection]);

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
  };
}
