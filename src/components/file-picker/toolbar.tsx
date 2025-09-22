import { Search, SortAsc, SortDesc, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { SortField, SortDirection, FilterConfig } from '@/types/api';

type ToolbarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  filters: FilterConfig;
  onFilterChange: (filters: FilterConfig) => void;
}

export function Toolbar({
  searchQuery,
  onSearchChange,
  sortField,
  sortDirection,
  onSortChange,
  filters,
  onFilterChange,
}: ToolbarProps) {
  const handleSortFieldChange = (field: SortField) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b bg-background">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search files and folders..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {sortDirection === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
            Sort by {sortField}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleSortFieldChange('name')}>
            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortFieldChange('modifiedTime')}>
            Modified {sortField === 'modifiedTime' && (sortDirection === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortFieldChange('createdTime')}>
            Created {sortField === 'createdTime' && (sortDirection === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortFieldChange('size')}>
            Size {sortField === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onFilterChange({ ...filters, typeFilter: 'all' })}>
            All Items {filters.typeFilter === 'all' && '✓'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange({ ...filters, typeFilter: 'files' })}>
            Files Only {filters.typeFilter === 'files' && '✓'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange({ ...filters, typeFilter: 'folders' })}>
            Folders Only {filters.typeFilter === 'folders' && '✓'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onFilterChange({ ...filters, indexedFilter: 'all' })}>
            All Files {filters.indexedFilter === 'all' && '✓'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange({ ...filters, indexedFilter: 'indexed' })}>
            Indexed Only {filters.indexedFilter === 'indexed' && '✓'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange({ ...filters, indexedFilter: 'not-indexed' })}>
            Not Indexed {filters.indexedFilter === 'not-indexed' && '✓'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
