import { NextRequest, NextResponse } from 'next/server';

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

    
    
    
    
    await new Promise(resolve => setTimeout(resolve, 500));

    
    indexedFiles.delete(fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to de-index file' },
      { status: 500 }
    );
  }
}
