import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json({ success: true });
}
