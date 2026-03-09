'use client';

import React, { useState } from 'react';
import { Eye, Code, Save, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
}

function Editor({ content, onChange, onSave }: EditorProps) {
  const [preview, setPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  const handlePreview = async () => {
    if (!preview) {
      // Render markdown server-side
      try {
        const res = await fetch('/api/render-md', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        const data = await res.json();
        setPreviewHtml(data.html);
      } catch {
        setPreviewHtml('<p style="color:red;">미리보기 실패</p>');
      }
    }
    setPreview(!preview);
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await fetch('/api/assets', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.success) {
            const imgMd = `![${file.name}](${data.url})`;
            onChange(content + '\n\n' + imgMd);
          }
        } catch {
          alert('이미지 업로드에 실패했습니다.');
        }
      }
    };
    input.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSave();
    }
    // Tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newContent);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-inner border border-gray-100 overflow-hidden min-h-[700px] flex flex-col">
      <div className="border-b border-gray-200 p-2 flex gap-2 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={handlePreview}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded font-medium text-sm transition-colors",
            preview
              ? "bg-lime-500 text-white"
              : "hover:bg-lime-100 text-gray-600"
          )}
        >
          {preview ? <Code size={16} /> : <Eye size={16} />}
          {preview ? 'Markdown' : 'Preview'}
        </button>
        <button onClick={addImage} className="p-1.5 hover:bg-lime-100 rounded text-gray-600">
          <ImageIcon size={18} />
        </button>
        <div className="flex-1" />
        <span className="text-xs text-gray-400 self-center mr-2">Ctrl+S로 저장</span>
      </div>

      {preview ? (
        <div
          className="px-4 md:px-12 py-8 flex-1 overflow-y-auto prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      ) : (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="px-4 md:px-12 py-8 flex-1 w-full resize-none outline-none font-mono text-sm text-gray-800 leading-relaxed bg-transparent"
          placeholder="Markdown으로 작성하세요..."
          spellCheck={false}
        />
      )}
    </div>
  );
}

export default Editor;
