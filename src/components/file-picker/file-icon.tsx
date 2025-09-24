import { 
  FileText, 
  Video, 
  Music, 
  Archive, 
  File, 
  Folder,
  Sheet,
  Image,
  FileType
} from 'lucide-react';
import { DriveItem } from '@/types/api';

type FileIconProps = {
  item: DriveItem;
  className?: string;
}

export function FileIcon({ item, className = "w-5 h-5" }: FileIconProps) {
  if (item.type === 'folder') {
    return <Folder className={className} />;
  }

  // Get icon based on mime type or file extension
  const mimeType = item.mimeType?.toLowerCase() || '';
  const fileName = item.name.toLowerCase();

  if (mimeType.includes('image/') || /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/.test(fileName)) {
    {/* eslint-disable-next-line jsx-a11y/alt-text */}
    return <Image className={className} />;
  }

  if (mimeType.includes('video/') || /\.(mp4|avi|mov|wmv|flv|webm)$/.test(fileName)) {
    return <Video className={className} />;
  }

  if (mimeType.includes('audio/') || /\.(mp3|wav|flac|aac|ogg)$/.test(fileName)) {
    return <Music className={className} />;
  }

  if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
    return <FileType className={className} />;
  }

  if (mimeType.includes('spreadsheet') || /\.(xlsx?|csv)$/.test(fileName)) {
    return <Sheet className={className} />;
  }

  if (mimeType.includes('zip') || mimeType.includes('archive') || 
      /\.(zip|rar|7z|tar|gz)$/.test(fileName)) {
    return <Archive className={className} />;
  }

  if (mimeType.includes('text/') || /\.(txt|md|json|xml|yaml|yml)$/.test(fileName)) {
    return <FileText className={className} />;
  }

  // Default file icon
  return <File className={className} />;
}
