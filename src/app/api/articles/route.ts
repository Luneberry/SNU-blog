import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ARTICLES_PATH = path.join(process.cwd(), 'data', 'article');

export async function GET() {
  try {
    if (!fs.existsSync(ARTICLES_PATH)) {
      fs.mkdirSync(ARTICLES_PATH, { recursive: true });
    }

    const files = fs.readdirSync(ARTICLES_PATH);
    const articles = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const raw = fs.readFileSync(path.join(ARTICLES_PATH, file), 'utf8');
        const { data } = matter(raw);
        const id = file.replace('.md', '');
        const date = data.date || new Date().toISOString();
        return {
          id,
          title: data.title || 'Untitled',
          date,
          year: new Date(date).getFullYear().toString(),
          month: (new Date(date).getMonth() + 1).toString(),
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

    const fileId = id || String(Date.now());
    const filePath = path.join(ARTICLES_PATH, `${fileId}.md`);

    const frontmatter = [
      '---',
      `title: "${(title || 'Untitled').replace(/"/g, '\\"')}"`,
      `date: "${date || new Date().toISOString()}"`,
      '---',
    ].join('\n');

    const md = frontmatter + '\n\n' + (content || '');
    fs.writeFileSync(filePath, md, 'utf8');

    return NextResponse.json({ success: true, article: { id: fileId, title, date } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save article' }, { status: 500 });
  }
}
