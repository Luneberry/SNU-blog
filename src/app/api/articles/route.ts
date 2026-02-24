import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 프로젝트 루트 기준 data 폴더 설정
const ARTICLES_PATH = path.join(process.cwd(), 'data', 'article');

export async function GET() {
  try {
    if (!fs.existsSync(ARTICLES_PATH)) {
      fs.mkdirSync(ARTICLES_PATH, { recursive: true });
    }

    const files = fs.readdirSync(ARTICLES_PATH);
    const articles = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const content = JSON.parse(fs.readFileSync(path.join(ARTICLES_PATH, file), 'utf8'));
        return {
          id: file.replace('.json', ''),
          title: content.title,
          date: content.date,
          year: new Date(content.date).getFullYear().toString(),
          month: (new Date(content.date).getMonth() + 1).toString(),
        };
      });

    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { id, title, content, date } = data;
    
    if (!fs.existsSync(ARTICLES_PATH)) {
      fs.mkdirSync(ARTICLES_PATH, { recursive: true });
    }

    const fileName = `${id || Date.now()}.json`;
    const filePath = path.join(ARTICLES_PATH, fileName);
    
    const articleData = {
      id: id || fileName.replace('.json', ''),
      title,
      content,
      date: date || new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(articleData, null, 2));

    return NextResponse.json({ success: true, article: articleData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save article' }, { status: 500 });
  }
}
