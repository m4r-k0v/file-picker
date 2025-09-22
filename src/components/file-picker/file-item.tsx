import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { FileIcon } from './file-icon';
import { FileInfo } from './file-info';
import { FileActions } from './file-actions';
import { DriveItem } from '@/types/api';

type FileItemProps = {
  item: DriveItem;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onNavigate?: (folderId: string) => void;
  isIndexed: boolean;
}

export function FileItem({
  item,
  onNavigate,
  isIndexed,
}: FileItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleItemClick = () => {
    if (item.type === 'folder' && onNavigate) {
      onNavigate(item.id);
    }
  };

  const handleLoadingStateChange = (loading: boolean) => {
    setIsLoading(loading);
  };


  return (
    <div className={`flex items-center gap-3 p-3 hover:bg-blue-50 group transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
      <FileIcon item={item} className="w-6 h-6 text-muted-foreground" />

      <FileInfo
        item={item}
        isIndexed={isIndexed}
        onClick={handleItemClick}
      />

      <FileActions
        item={item}
        isIndexed={isIndexed}
        onLoadingStateChange={handleLoadingStateChange}
      />
    </div>
  );
}