'use client';

import { Loader2, FolderOpen } from 'lucide-react';
import { FileItem } from './file-item';
import { DriveItem } from '@/types/api';

type FileListProps = {
  files: DriveItem[];
  isLoading: boolean;
  searchQuery: string;
  selectedFiles: Set<string>;
  isItemIndexed: (item: DriveItem) => boolean;
  onFileSelect: (fileId: string, selected: boolean) => void;
  onNavigate: (folderId: string, folderName: string) => void;
}

export function FileList({
  files,
  isLoading,
  searchQuery,
  selectedFiles,
  isItemIndexed,
  onFileSelect,
  onNavigate,
}: FileListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading files...</span>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No files found</h3>
        <p className="text-muted-foreground">
          {searchQuery 
            ? `No files match "${searchQuery}"`
            : 'This folder is empty'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {files.map((item) => (
        <FileItem
          key={item.id}
          item={item}
          isSelected={selectedFiles.has(item.id)}
          onSelect={(selected) => onFileSelect(item.id, selected)}
          onNavigate={item.type === 'folder' ? () => onNavigate(item.id, item.name) : undefined}
          isIndexed={isItemIndexed(item)}
        />
      ))}
    </div>
  );
}
