'use client';

import { Database, DatabaseBackup, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SelectionFooterProps = {
  selectedCount: number;
  selectedFiles: string[];
  selectedIndexedCount: number;
  selectedNotIndexedCount: number;
  showKnowledgeBaseButton?: boolean;
  onClearSelection: () => void;
  onShowKnowledgeBaseManager?: () => void;
  onBulkIndex?: (fileIds: string[]) => void;
  onBulkDeIndex?: (fileIds: string[]) => void;
  isBulkIndexing?: boolean;
  isBulkDeIndexing?: boolean;
}

export function SelectionFooter({
  selectedCount,
  selectedFiles,
  selectedIndexedCount,
  selectedNotIndexedCount,
  showKnowledgeBaseButton = false,
  onClearSelection,
  onShowKnowledgeBaseManager,
  onBulkIndex,
  onBulkDeIndex,
  isBulkIndexing = false,
  isBulkDeIndexing = false,
}: SelectionFooterProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="p-4 border-t bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          {selectedIndexedCount > 0 && selectedNotIndexedCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {selectedIndexedCount} indexed, {selectedNotIndexedCount} not indexed
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {selectedNotIndexedCount > 0 && onBulkIndex && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onBulkIndex(selectedFiles)}
              disabled={isBulkIndexing || isBulkDeIndexing}
            >
              {isBulkIndexing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Indexing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Add to Index ({selectedNotIndexedCount})
                </>
              )}
            </Button>
          )}

          {selectedIndexedCount > 0 && onBulkDeIndex && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onBulkDeIndex(selectedFiles)}
              disabled={isBulkIndexing || isBulkDeIndexing}
            >
              {isBulkDeIndexing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <DatabaseBackup className="w-4 h-4 mr-2" />
                  Remove from Index ({selectedIndexedCount})
                </>
              )}
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearSelection}
            disabled={isBulkIndexing || isBulkDeIndexing}
          >
            Clear Selection
          </Button>

          {showKnowledgeBaseButton && onShowKnowledgeBaseManager && (
            <Button 
              size="sm"
              onClick={onShowKnowledgeBaseManager}
              disabled={selectedCount === 0 || isBulkIndexing || isBulkDeIndexing}
            >
              <Database className="w-4 h-4 mr-2" />
              Create Knowledge Base
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
