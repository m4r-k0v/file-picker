import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

type BreadcrumbItem = {
  id: string;
  name: string;
}

type BreadcrumbProps = {
  path: BreadcrumbItem[];
  onNavigate: (folderId?: string) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  return (
    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => onNavigate()}
      >
        <Home className="w-4 h-4" />
        <span className="ml-1">Root</span>
      </Button>
      
      {path.map((item) => (
        <div key={item.id} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => onNavigate(item.id)}
          >
            {item.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
