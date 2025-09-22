import { useEffect } from 'react';
import {
  MoreVertical,
  Trash2,
  Database,
  DatabaseBackup,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DriveItem } from '@/types/api';
import { useDeleteFile, useIndexFile, useDeIndexFile } from '@/hooks/use-stackai-files';

type FileActionsProps = {
  item: DriveItem;
  isIndexed: boolean;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

export function FileActions({ item, isIndexed, onLoadingStateChange }: FileActionsProps) {
  const deleteFileMutation = useDeleteFile();
  const indexFileMutation = useIndexFile();
  const deIndexFileMutation = useDeIndexFile();

  const handleDelete = () => {
    deleteFileMutation.mutate({ fileId: item.id });
  };

  const handleIndex = () => {
    if (isIndexed) {
      deIndexFileMutation.mutate({ fileId: item.id });
    } else {
      indexFileMutation.mutate({ fileId: item.id });
    }
  };

  // Notify parent component about loading state changes
  const isIndexing = indexFileMutation.isPending || deIndexFileMutation.isPending;
  
  useEffect(() => {
    onLoadingStateChange?.(isIndexing);
  }, [isIndexing, onLoadingStateChange]);

  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {(deleteFileMutation.isError || indexFileMutation.isError || deIndexFileMutation.isError) && (
        <span className="text-xs text-destructive opacity-100">
          Error
        </span>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          {item.type === 'file' && (
            <DropdownMenuItem
              onClick={handleIndex}
              disabled={indexFileMutation.isPending || deIndexFileMutation.isPending}
            >
              {(indexFileMutation.isPending || deIndexFileMutation.isPending) ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isIndexed ? (
                <DatabaseBackup className="w-4 h-4 mr-2" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              {isIndexed ? 'Remove from Index' : 'Add to Index'}
            </DropdownMenuItem>
          )}

          {/* Delete option */}
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={deleteFileMutation.isPending}
            className="text-destructive"
          >
            {deleteFileMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Remove from List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}