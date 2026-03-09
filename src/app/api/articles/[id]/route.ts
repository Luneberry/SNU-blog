import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const ARTICLES_PATH = path.join(process.cwd(), 'data', 'article');

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = path.join(ARTICLES_PATH, `${id}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);

    // content가 HTML인지 Markdown인지 판별 (기존 마이그레이션 호환)
    const isHtml = content.trimStart().startsWith('<');
    const html = isHtml ? content : await marked(content);

    return NextResponse.json({
      id,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      content,      // raw markdown (에디터용)
      html,         // rendered HTML (뷰용)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = path.join(ARTICLES_PATH, `${id}.md`);

    if (fs.existsSync(filePath)) {
      // 에셋 삭제: 본문에서 이미지 참조 찾기
      const raw = fs.readFileSync(filePath, 'utf8');
      const assetRegex = /\/api\/assets\/([^\s)"']+)/g;
      let match;
      const ASSETS_DIR = path.join(process.cwd(), 'data', 'assets', 'pictures');

      while ((match = assetRegex.exec(raw)) !== null) {
        try {
          const fileName = decodeURIComponent(match[1]);
          const assetPath = path.join(ASSETS_DIR, fileName);
          if (fs.existsSync(assetPath)) {
            fs.unlinkSync(assetPath);
          }
        } catch (e) {
          console.error('Failed to delete asset:', match[1], e);
        }
      }

      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
