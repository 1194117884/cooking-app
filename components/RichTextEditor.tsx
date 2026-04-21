'use client';

import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { useCallback, useState } from 'react';
import { Bold, Italic, Image as ImageIcon, Highlighter, Undo, Redo } from 'lucide-react';
import { getAuthToken } from '@/lib/auth-client';

interface RichTextEditorProps {
  value: JSONContent | null;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
}

async function uploadImage(file: File): Promise<string> {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || '上传失败');
  }

  const data = await res.json();
  return data.url;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '写下你的烹饪步骤...',
}: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const handleImageUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      return url;
    } finally {
      setUploading(false);
    }
  }, []);

  const handlePaste = useCallback(
    (view: any, event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return false;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            handleImageUpload(file).then((url) => {
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src: url })
                )
              );
            }).catch((err) => {
              console.error('Image upload failed:', err);
            });
            return true;
          }
        }
      }
      return false;
    },
    [handleImageUpload]
  );

  const handleDrop = useCallback(
    (view: any, event: DragEvent, _slice: any, moved: boolean) => {
      if (moved) return false;

      const files = event.dataTransfer?.files;
      if (!files) return false;

      const imageFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          imageFiles.push(file);
        }
      }

      if (imageFiles.length === 0) return false;

      event.preventDefault();

      for (const file of imageFiles) {
        handleImageUpload(file).then((url) => {
          view.dispatch(
            view.state.tr.replaceSelectionWith(
              view.state.schema.nodes.image.create({ src: url })
            )
          );
        }).catch((err) => {
          console.error('Image upload failed:', err);
        });
      }
      return true;
    },
    [handleImageUpload]
  );

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
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
      handlePaste,
      handleDrop,
    },
  });

  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        const url = await handleImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  }, [editor, handleImageUpload]);

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
        <ToolbarButton onClick={addImage} disabled={uploading}>
          {uploading ? (
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ImageIcon className="w-5 h-5" />
          )}
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Hint */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        支持粘贴/拖拽上传图片，快捷键：Ctrl+B 加粗、Ctrl+I 斜体
      </div>
    </div>
  );
}
