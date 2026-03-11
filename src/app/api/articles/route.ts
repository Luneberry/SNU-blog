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
          series: data.series || null,
          order: data.order ?? null,
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
    const { id, title, content, date, series, order } = data;

    if (!fs.existsSync(ARTICLES_PATH)) {
      fs.mkdirSync(ARTICLES_PATH, { recursive: true });
    }

    const fileId = id || String(Date.now());
    const filePath = path.join(ARTICLES_PATH, `${fileId}.md`);

    // 기존 파일이 있으면 frontmatter의 series/order를 보존
    let existingSeries = series;
    let existingOrder = order;
    if (existingSeries === undefined && fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const { data: existing } = matter(raw);
      if (existing.series) existingSeries = existing.series;
      if (existing.order != null) existingOrder = existing.order;
    }

    const frontmatterLines = [
      '---',
      `title: "${(title || 'Untitled').replace(/"/g, '\\"')}"`,
      `date: "${date || new Date().toISOString()}"`,
    ];
    if (existingSeries) frontmatterLines.push(`series: "${existingSeries}"`);
    if (existingOrder != null) frontmatterLines.push(`order: ${existingOrder}`);
    frontmatterLines.push('---');

    const frontmatter = frontmatterLines.join('\n');

    const md = frontmatter + '\n\n' + (content || '');
    fs.writeFileSync(filePath, md, 'utf8');

    return NextResponse.json({ success: true, article: { id: fileId, title, date } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save article' }, { status: 500 });
  }
}
