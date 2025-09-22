import { Badge } from '@/components/ui/badge';
import { DriveItem } from '@/types/api';

type FileInfoProps = {
  item: DriveItem;
  isIndexed: boolean;
  onClick?: () => void;
}

export function FileInfo({ item, isIndexed, onClick }: FileInfoProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div 
      className="flex-1 min-w-0 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground truncate">
          {item.name}
        </span>
        {isIndexed && (
          <Badge variant="secondary" className="text-xs">
            Indexed
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
        <span>{item.type === 'folder' ? 'Folder' : formatFileSize(item.size)}</span>
        <span>Modified {formatDate(item.modifiedTime)}</span>
      </div>
    </div>
  );
}
