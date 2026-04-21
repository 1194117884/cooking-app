'use client';

import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { useCallback } from 'react';
import { Bold, Italic, Image as ImageIcon, Highlighter, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
  value: JSONContent | null;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
  onImageUpload?: () => void;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '写下你的烹饪步骤...',
  onImageUpload,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  const addImage = useCallback(() => {
    if (onImageUpload) {
      onImageUpload();
    }
  }, [onImageUpload]);

  if (!editor) {
    return <div className="border rounded-xl h-[200px] bg-gray-50" />;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex items-center gap-1 bg-gray-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <Bold className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <Italic className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
        >
          <Highlighter className="w-5 h-5" />
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="w-5 h-5" />
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton onClick={addImage}>
          <ImageIcon className="w-5 h-5" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Hint */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        支持 Markdown 快捷键：Ctrl+B 加粗、Ctrl+I 斜体
      </div>
    </div>
  );
}
