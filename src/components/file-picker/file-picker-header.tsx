'use client';

import { Breadcrumb } from './breadcrumb';
import { BreadcrumbItem } from '@/hooks/use-file-picker';

type FilePickerHeaderProps = {
  breadcrumbPath: BreadcrumbItem[];
  onBreadcrumbNavigate: (folderId?: string) => void;
}

export function FilePickerHeader({ 
  breadcrumbPath, 
  onBreadcrumbNavigate 
}: FilePickerHeaderProps) {
  return (
    <div className="p-4 border-b">
      <h2 className="text-xl font-semibold mb-2">Google Drive File Picker</h2>
      <Breadcrumb 
        path={breadcrumbPath} 
        onNavigate={onBreadcrumbNavigate}
      />
    </div>
  );
}
