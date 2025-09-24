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

  const onResourceSelectionRef = useRef(onResourceSelection);
  onResourceSelectionRef.current = onResourceSelection;

  const { data: filesData, isLoading, error, refetch } = useFiles({
    folderId: currentFolderId,
    nameFilter: searchQuery || undefined,
  });

  const { data: indexedData = { resourceIds: [], indexedFolders: [] } } = useIndexedFiles();
  const indexedFileIds = useMemo(() => indexedData.resourceIds || [], [indexedData.resourceIds]);

  const bulkIndexMutation = useBulkIndexFiles();
  const bulkDeIndexMutation = useBulkDeIndexFiles();

  const isItemIndexed = useCallback((item: DriveItem) => {
    
    if (indexedFileIds.includes(item.id)) {
      return true;
    }
    
    
    
    if (item.type === 'file' && item.parentId) {
      return indexedFileIds.includes(item.parentId);
    }
    
    return false;
  }, [indexedFileIds]);

  
  const filteredFiles = useMemo(() => {
    if (!filesData?.files) return [];

    let filtered = filesData.files;

    
    if (filters.typeFilter === 'files') {
      filtered = filtered.filter(item => item.type === 'file');
    } else if (filters.typeFilter === 'folders') {
      filtered = filtered.filter(item => item.type === 'folder');
    }

    
    if (filters.indexedFilter === 'indexed') {
      filtered = filtered.filter(item => isItemIndexed(item));
    } else if (filters.indexedFilter === 'not-indexed') {
      filtered = filtered.filter(item => !isItemIndexed(item));
    }

    
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

  
  const handleNavigate = useCallback((folderId?: string, folderName?: string) => {
    if (folderId) {
      
      setBreadcrumbPath(prev => [...prev, { id: folderId, name: folderName || 'Unknown' }]);
    } else {
      
      setBreadcrumbPath([]);
    }
    setCurrentFolderId(folderId);
    setSelectedFiles(new Set());
  }, []);

  const handleBreadcrumbNavigate = useCallback((folderId?: string) => {
    if (!folderId) {
      
      setBreadcrumbPath([]);
      setCurrentFolderId(undefined);
    } else {
      
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

  
  const handleSortChange = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  
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

  
  useEffect(() => {
    const selectedIds = Array.from(selectedFiles);
    if (onResourceSelectionRef.current) {
      onResourceSelectionRef.current(selectedIds);
    }
  }, [selectedFiles]); 

  return {
    
    currentFolderId,
    breadcrumbPath,
    selectedFiles,
    searchQuery,
    sortField,
    sortDirection,
    filters,
    
    
    filteredFiles,
    indexedFileIds,
    isItemIndexed, 
    isLoading,
    error,
    
    
    selectedFilesArray,
    selectedIndexedCount,
    selectedNotIndexedCount,
    
    
    handleNavigate,
    handleBreadcrumbNavigate,
    handleFileSelect,
    clearSelection,
    handleSortChange,
    setSearchQuery,
    setFilters,
    refetch,
    
    
    handleBulkIndex,
    handleBulkDeIndex,
    isBulkIndexing: bulkIndexMutation.isPending,
    isBulkDeIndexing: bulkDeIndexMutation.isPending,
  };
}
