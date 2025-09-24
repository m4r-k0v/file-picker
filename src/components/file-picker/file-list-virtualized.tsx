'use client';

import { FileItem } from './file-item';
import { DriveItem } from '@/types/api';

type FileListVirtualizedProps = {
  files: DriveItem[];
  isLoading: boolean;
  searchQuery: string;
  selectedFiles: Set<string>;
  isItemIndexed: (item: DriveItem) => boolean;
  onFileSelect: (fileId: string, selected: boolean) => void;
  onNavigate: (folderId?: string, folderName?: string) => void;
}

export function FileListVirtualized({
  files,
  isLoading,
  searchQuery,
  selectedFiles,
  isItemIndexed,
  onFileSelect,
  onNavigate,
}: FileListVirtualizedProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading files...</span>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-muted-foreground mb-2">
          {searchQuery ? 'No files match your search' : 'No files in this folder'}
        </div>
        {searchQuery && (
          <div className="text-sm text-muted-foreground">
            Try adjusting your search terms or filters
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
      {files.map((item) => (
        <FileItem
          key={item.id}
          item={item}
          isSelected={selectedFiles.has(item.id)}
          onSelect={(selected) => onFileSelect(item.id, selected)}
          onNavigate={(folderId) => onNavigate(folderId, item.name)}
          isIndexed={isItemIndexed(item)}
        />
      ))}
    </div>
  );
}