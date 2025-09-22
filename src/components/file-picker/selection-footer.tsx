'use client';

import { Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SelectionFooterProps = {
  selectedCount: number;
  showKnowledgeBaseButton?: boolean;
  onClearSelection: () => void;
  onShowKnowledgeBaseManager?: () => void;
}

export function SelectionFooter({
  selectedCount,
  showKnowledgeBaseButton = false,
  onClearSelection,
  onShowKnowledgeBaseManager,
}: SelectionFooterProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="p-4 border-t bg-muted/50">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selectedCount} file{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearSelection}
          >
            Clear Selection
          </Button>
          {showKnowledgeBaseButton && onShowKnowledgeBaseManager && (
            <Button 
              size="sm"
              onClick={onShowKnowledgeBaseManager}
              disabled={selectedCount === 0}
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
