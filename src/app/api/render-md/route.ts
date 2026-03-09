import { NextResponse } from 'next/server';
import { marked } from 'marked';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    const isHtml = content.trimStart().startsWith('<');
    const html = isHtml ? content : await marked(content);
    return NextResponse.json({ html });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to render' }, { status: 500 });
  }
}
