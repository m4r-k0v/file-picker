import { useState, memo } from 'react';
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

export const FileItem = memo(function FileItem({
  item,
  isSelected,
  onSelect,
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
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelect(!!checked)}
        disabled={isLoading}
      />
      
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
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isIndexed === nextProps.isIndexed &&
    prevProps.onNavigate === nextProps.onNavigate &&
    prevProps.onSelect === nextProps.onSelect
  );
});