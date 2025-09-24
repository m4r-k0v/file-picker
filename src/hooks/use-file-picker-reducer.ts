import { SortField, SortDirection, FilterConfig } from '@/types/api';

export type FilePickerState = {
  currentFolderId?: string;
  breadcrumbPath: BreadcrumbItem[];
  selectedFiles: Set<string>;
  searchQuery: string;
  sortField: SortField;
  sortDirection: SortDirection;
  filters: FilterConfig;
}

export type BreadcrumbItem = {
  id: string;
  name: string;
}

export type FilePickerAction =
  | { type: 'NAVIGATE_TO_FOLDER'; folderId?: string; folderName?: string }
  | { type: 'BREADCRUMB_NAVIGATE'; folderId?: string }
  | { type: 'SELECT_FILE'; fileId: string; selected: boolean }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_SORT'; field: SortField; direction: SortDirection }
  | { type: 'SET_FILTERS'; filters: FilterConfig }
  | { type: 'RESET_STATE' };

export const initialState: FilePickerState = {
  currentFolderId: undefined,
  breadcrumbPath: [],
  selectedFiles: new Set(),
  searchQuery: '',
  sortField: 'name',
  sortDirection: 'asc',
  filters: {
    typeFilter: 'all',
    indexedFilter: 'all',
  },
};

export function filePickerReducer(
  state: FilePickerState,
  action: FilePickerAction
): FilePickerState {
  switch (action.type) {
    case 'NAVIGATE_TO_FOLDER': {
      if (action.folderId) {
        return {
          ...state,
          currentFolderId: action.folderId,
          breadcrumbPath: [...state.breadcrumbPath, { id: action.folderId, name: action.folderName || 'Unknown' }],
          selectedFiles: new Set(),
        };
      } else {
        return {
          ...state,
          currentFolderId: undefined,
          breadcrumbPath: [],
          selectedFiles: new Set(),
        };
      }
    }

    case 'BREADCRUMB_NAVIGATE': {
      if (!action.folderId) {
        return {
          ...state,
          currentFolderId: undefined,
          breadcrumbPath: [],
          selectedFiles: new Set(),
        };
      } else {
        const folderIndex = state.breadcrumbPath.findIndex(item => item.id === action.folderId);
        if (folderIndex >= 0) {
          return {
            ...state,
            currentFolderId: action.folderId,
            breadcrumbPath: state.breadcrumbPath.slice(0, folderIndex + 1),
            selectedFiles: new Set(),
          };
        }
        return state;
      }
    }

    case 'SELECT_FILE': {
      const newSelectedFiles = new Set(state.selectedFiles);
      if (action.selected) {
        newSelectedFiles.add(action.fileId);
      } else {
        newSelectedFiles.delete(action.fileId);
      }
      return {
        ...state,
        selectedFiles: newSelectedFiles,
      };
    }

    case 'CLEAR_SELECTION': {
      return {
        ...state,
        selectedFiles: new Set(),
      };
    }

    case 'SET_SEARCH_QUERY': {
      return {
        ...state,
        searchQuery: action.query,
      };
    }

    case 'SET_SORT': {
      return {
        ...state,
        sortField: action.field,
        sortDirection: action.direction,
      };
    }

    case 'SET_FILTERS': {
      return {
        ...state,
        filters: action.filters,
      };
    }

    case 'RESET_STATE': {
      return initialState;
    }

    default:
      return state;
  }
}