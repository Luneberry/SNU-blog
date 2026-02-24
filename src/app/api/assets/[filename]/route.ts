import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ASSETS_PATH = path.join(process.cwd(), 'data', 'assets', 'pictures');

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = path.join(ASSETS_PATH, filename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.mp4') contentType = 'video/mp4';

    return new NextResponse(fileBuffer, {
      headers: { 'Content-Type': contentType }
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
