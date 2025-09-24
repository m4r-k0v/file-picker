import { NextRequest, NextResponse } from 'next/server';
import { DriveItem, ListFilesResponse } from '@/types/api';


const mockFiles: DriveItem[] = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    createdTime: '2024-01-15T10:30:00Z',
    modifiedTime: '2024-01-20T14:45:00Z',
    webViewLink: 'https://drive.google.com/file/d/',
  },
  {
    id: '2',
    name: 'Images',
    type: 'folder',
    createdTime: '2024-01-10T09:15:00Z',
    modifiedTime: '2024-01-18T16:20:00Z',
    webViewLink: 'https://drive.google.com/file/d/',
  },
  {
    id: '3',
    name: 'Project Proposal.pdf',
    type: 'file',
    mimeType: 'application/pdf',
    size: 2547832,
    createdTime: '2024-01-12T11:20:00Z',
    modifiedTime: '2024-01-12T11:20:00Z',
    webViewLink: 'https://drive.google.com/file/d/',
  },
  {
    id: '4',
    name: 'Meeting Notes.docx',
    type: 'file',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 45678,
    createdTime: '2024-01-14T15:30:00Z',
    modifiedTime: '2024-01-16T09:45:00Z',
    webViewLink: 'https://drive.google.com/file/d/',
  },
  {
    id: '5',
    name: 'Budget Spreadsheet.xlsx',
    type: 'file',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 123456,
    createdTime: '2024-01-08T13:15:00Z',
    modifiedTime: '2024-01-19T10:30:00Z',
    webViewLink: 'https://drive.google.com/file/d/',
  },
  {
    id: '6',
    name: 'presentation.pptx',
    type: 'file',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 8765432,
    createdTime: '2024-01-11T16:45:00Z',
    modifiedTime: '2024-01-17T12:20:00Z',
    webViewLink: 'https://drive.google.com/file/d/',
  },
];


const folderContents: Record<string, DriveItem[]> = {
  '1': [ 
    {
      id: '7',
      name: 'Contract.pdf',
      type: 'file',
      mimeType: 'application/pdf',
      size: 567890,
      createdTime: '2024-01-13T14:20:00Z',
      modifiedTime: '2024-01-13T14:20:00Z',
      parentId: '1',
      webViewLink: 'https://drive.google.com/file/d/',
    },
    {
      id: '8',
      name: 'Report.docx',
      type: 'file',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 234567,
      createdTime: '2024-01-15T11:30:00Z',
      modifiedTime: '2024-01-15T11:30:00Z',
      parentId: '1',
      webViewLink: 'https://drive.google.com/file/d/',
    },
  ],
  '2': [ 
    {
      id: '9',
      name: 'logo.png',
      type: 'file',
      mimeType: 'image/png',
      size: 45678,
      createdTime: '2024-01-09T10:15:00Z',
      modifiedTime: '2024-01-09T10:15:00Z',
      parentId: '2',
      webViewLink: 'https://drive.google.com/file/d/',
    },
    {
      id: '10',
      name: 'screenshot.jpg',
      type: 'file',
      mimeType: 'image/jpeg',
      size: 123456,
      createdTime: '2024-01-11T15:45:00Z',
      modifiedTime: '2024-01-11T15:45:00Z',
      parentId: '2',
      webViewLink: 'https://drive.google.com/file/d/',
    },
  ],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');
  const nameFilter = searchParams.get('nameFilter');
  const orderBy = searchParams.get('orderBy') as 'name' | 'createdTime' | 'modifiedTime' | 'size';
  const sortDirection = searchParams.get('sortDirection') as 'asc' | 'desc';

  
  let files = folderId ? (folderContents[folderId] || []) : mockFiles;

  
  if (nameFilter) {
    files = files.filter(file => 
      file.name.toLowerCase().includes(nameFilter.toLowerCase())
    );
  }

  
  if (orderBy) {
    files.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (orderBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'size':
          aValue = a.size || 0;
          bValue = b.size || 0;
          break;
        case 'createdTime':
          aValue = new Date(a.createdTime);
          bValue = new Date(b.createdTime);
          break;
        case 'modifiedTime':
          aValue = new Date(a.modifiedTime);
          bValue = new Date(b.modifiedTime);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const response: ListFilesResponse = {
    files,
    hasMore: false,
  };

  return NextResponse.json(response);
}
