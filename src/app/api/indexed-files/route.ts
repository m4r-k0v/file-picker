import { NextResponse } from 'next/server';

// Mock indexed files data
const indexedFiles = new Set(['3', '5']); // Some files are pre-indexed

export async function GET() {
  // In a real implementation, you would filter by knowledgeBaseId
  return NextResponse.json(Array.from(indexedFiles));
}
