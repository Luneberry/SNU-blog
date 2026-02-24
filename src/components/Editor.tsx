'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Image } from '@tiptap/extension-image';
import { 
  Bold, Italic, List, ListOrdered, Heading1, Heading2, 
  Image as ImageIcon, Save, Undo, Redo
} from 'lucide-react';
import React from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
}

const MenuBar = ({ editor, onSave }: { editor: any; onSave: () => void }) => {
  if (!editor) return null;

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
            editor.chain().focus().setImage({ src: data.url }).run();
          }
        } catch (err) {
          alert('이미지 업로드에 실패했습니다.');
        }
      }
    };
    input.click();
  };

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-2 bg-white sticky top-0 z-10 bg-white/80 backdrop-blur-md">
      <div className="flex gap-1 border-r pr-2">
        <button onClick={() => editor.chain().focus().undo().run()} className="p-1.5 hover:bg-lime-100 rounded">
          <Undo size={18} />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} className="p-1.5 hover:bg-lime-100 rounded">
          <Redo size={18} />
        </button>
      </div>

      <div className="flex gap-1 border-r pr-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-lime-500 text-white' : 'hover:bg-lime-100'}`}
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-lime-500 text-white' : 'hover:bg-lime-100'}`}
        >
          <Italic size={18} />
        </button>
      </div>

      <div className="flex gap-1 border-r pr-2">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-lime-500 text-white' : 'hover:bg-lime-100'}`}
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-lime-500 text-white' : 'hover:bg-lime-100'}`}
        >
          <Heading2 size={18} />
        </button>
      </div>

      <div className="flex gap-1 border-r pr-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded ${editor.isActive('bulletList') ? 'bg-lime-500 text-white' : 'hover:bg-lime-100'}`}
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded ${editor.isActive('orderedList') ? 'bg-lime-500 text-white' : 'hover:bg-lime-100'}`}
        >
          <ListOrdered size={18} />
        </button>
      </div>

      <div className="flex gap-1 border-r pr-2">
        <input
          type="color"
          onInput={(event: any) => editor.chain().focus().setColor(event.target.value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-8 h-8 p-1 rounded cursor-pointer"
        />
        <button onClick={addImage} className="p-1.5 hover:bg-lime-100 rounded">
          <ImageIcon size={18} />
        </button>
      </div>
    </div>
  );
};

function Editor({ content, onChange, onSave }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="w-full bg-white rounded-xl shadow-inner border border-gray-100 overflow-hidden min-h-[700px] flex flex-col">
      <MenuBar editor={editor} onSave={onSave} />
      <div className="px-4 md:px-12 py-8 flex-1 overflow-y-auto prose prose-slate max-w-none focus:outline-none">
        <EditorContent editor={editor} className="w-full" />
      </div>
    </div>
  );
}

export default Editor;