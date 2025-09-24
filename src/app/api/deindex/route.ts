import { NextRequest, NextResponse } from 'next/server';

// Mock indexed files data - in a real app, this would be in a database
const indexedFiles = new Set(['3', '5']);

export async function POST(request: NextRequest) {
  try {
    const { fileId, knowledgeBaseId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Simulate de-indexing process
    // De-indexing file from knowledge base
    
    // Add some processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Remove from indexed files
    indexedFiles.delete(fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to de-index file' },
      { status: 500 }
    );
  }
}
