import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PINNED_PATH = path.join(process.cwd(), 'data', 'pinned.json');

function loadPinned(): string[] {
  if (fs.existsSync(PINNED_PATH)) {
    return JSON.parse(fs.readFileSync(PINNED_PATH, 'utf8'));
  }
  return [];
}

function savePinned(pinned: string[]) {
  fs.writeFileSync(PINNED_PATH, JSON.stringify(pinned, null, 2));
}

export async function GET() {
  return NextResponse.json(loadPinned());
}

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    const pinned = loadPinned();

    if (pinned.includes(id)) {
      savePinned(pinned.filter(p => p !== id));
    } else {
      savePinned([id, ...pinned]);
    }

    return NextResponse.json({ success: true, pinned: loadPinned() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle pin' }, { status: 500 });
  }
}
