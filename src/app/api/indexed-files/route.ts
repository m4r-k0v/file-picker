import { NextResponse } from 'next/server';


const indexedFiles = new Set(['3', '5']); 

export async function GET() {
  
  return NextResponse.json(Array.from(indexedFiles));
}
