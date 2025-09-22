'use client';

import { useState, useMemo, useEffect } from 'react';
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

  // Navigation handlers
  const handleNavigate = (folderId?: string, folderName?: string) => {
    if (folderId) {
      // Navigate into folder
      setBreadcrumbPath(prev => [...prev, { id: folderId, name: folderName || 'Unknown' }]);
    } else {
      // Navigate to root
      setBreadcrumbPath([]);
    }
    setCurrentFolderId(folderId);
    setSelectedFiles(new Set());
  };

  const handleBreadcrumbNavigate = (folderId?: string) => {
    if (!folderId) {
      // Navigate to root
      setBreadcrumbPath([]);
      setCurrentFolderId(undefined);
    } else {
      // Navigate to specific folder in breadcrumb
      const folderIndex = breadcrumbPath.findIndex(item => item.id === folderId);
      if (folderIndex >= 0) {
        setBreadcrumbPath(breadcrumbPath.slice(0, folderIndex + 1));
        setCurrentFolderId(folderId);
      }
    }
    setSelectedFiles(new Set());
  };

  // Selection handlers
  const handleFileSelect = (fileId: string, selected: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(fileId);
      } else {
        newSet.delete(fileId);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  // Sort handlers
  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  // Notify parent component about selected resources
  useEffect(() => {
    if (onResourceSelection) {
      onResourceSelection(Array.from(selectedFiles));
    }
  }, [selectedFiles, onResourceSelection]);

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
