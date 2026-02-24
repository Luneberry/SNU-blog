import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ASSETS_PATH = path.join(process.cwd(), 'data', 'assets', 'pictures');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!fs.existsSync(ASSETS_PATH)) {
      fs.mkdirSync(ASSETS_PATH, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(ASSETS_PATH, fileName);

    fs.writeFileSync(filePath, buffer);

    // 웹에서 접근 가능한 경로 반환 (public 폴더 심볼릭 링크 등이 필요할 수 있음)
    // 여기서는 간단하게 로컬 경로만 반환하거나, 에셋을 public으로 복사하는 방식을 고려
    return NextResponse.json({ 
      success: true, 
      url: `/api/assets/${fileName}`,
      fileName 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload asset' }, { status: 500 });
  }
}
