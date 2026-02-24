import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ARTICLES_PATH = path.join(process.cwd(), 'data', 'article');

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const filePath = path.join(ARTICLES_PATH, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const filePath = path.join(ARTICLES_PATH, `${id}.json`);

    if (fs.existsSync(filePath)) {
      // 1. 에셋 삭제를 위해 파일 내용 읽기
      const articleContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const content = articleContent.content || '';
      
      // 2. 본문에서 이미지 파일명 추출 (더 정교한 정규표현식)
      // src="/api/assets/파일명" 형태를 찾음
      const assetRegex = /src="\/api\/assets\/([^"]+)"/g;
      let match;
      const ASSETS_DIR = path.join(process.cwd(), 'data', 'assets', 'pictures');

      while ((match = assetRegex.exec(content)) !== null) {
        try {
          // URL 인코딩된 파일명을 원래대로 복구 (예: %EB%A1%9C... -> 제목)
          let fileName = match[1];
          // 중첩된 인코딩 가능성 배제
          fileName = decodeURIComponent(fileName);
          
          const assetPath = path.join(ASSETS_DIR, fileName);
          
          if (fs.existsSync(assetPath)) {
            fs.unlinkSync(assetPath);
          }
        } catch (e) {
          console.error('Failed to parse or delete asset filename:', match[1], e);
        }
      }

      // 3. 글 파일 삭제
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
