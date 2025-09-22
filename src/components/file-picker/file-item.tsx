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
  showCheckbox?: boolean;
  indexedFileIds: string[];
}

export function FileItem({
  item,
  isSelected,
  onSelect,
  onNavigate,
  showCheckbox = false,
  indexedFileIds,
}: FileItemProps) {
  const isIndexed = indexedFileIds.includes(item.id);

  const handleItemClick = () => {
    if (item.type === 'folder' && onNavigate) {
      onNavigate(item.id);
    }
  };


  return (
    <div className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg group">
      {/* Checkbox */}
      {showCheckbox && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
        />
      )}

      {/* File Icon */}
      <FileIcon item={item} className="w-6 h-6 text-muted-foreground" />

      {/* File Info */}
      <FileInfo 
        item={item}
        isIndexed={isIndexed}
        onClick={handleItemClick}
      />

      {/* Actions */}
      <FileActions 
        item={item}
        isIndexed={isIndexed}
      />
    </div>
  );
}
