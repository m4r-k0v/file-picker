import { NextResponse } from 'next/server';
import { KnowledgeBase } from '@/types/api';


const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: 'kb1',
    name: 'General Knowledge Base',
    description: 'Main knowledge base for all indexed documents',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z',
  },
  {
    id: 'kb2',
    name: 'Project Documentation',
    description: 'Knowledge base for project-related documents',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-19T15:30:00Z',
  },
];

export async function GET() {
  return NextResponse.json(mockKnowledgeBases);
}
