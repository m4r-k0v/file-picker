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

    
    
    
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    
    indexedFiles.add(fileId);

    return NextResponse.json({
      success: true,
      indexedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to index file' },
      { status: 500 }
    );
  }
}
