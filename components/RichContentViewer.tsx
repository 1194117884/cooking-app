'use client';

import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';

interface RichContentViewerProps {
  content: JSONContent | string | null;
}

export default function RichContentViewer({ content }: RichContentViewerProps) {
  // 处理旧格式（字符串数组 JSON）
  let parsedContent: JSONContent;

  if (!content) {
    parsedContent = { type: 'doc', content: [] };
  } else if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        // 旧格式：字符串数组
        parsedContent = {
          type: 'doc',
          content: parsed.map((step: string) => ({
            type: 'paragraph',
            content: [{ type: 'text', text: step }],
          })),
        };
      } else {
        parsedContent = parsed;
      }
    } catch {
      // 纯文本字符串
      parsedContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: content }],
          },
        ],
      };
    }
  } else {
    parsedContent = content;
  }

  const editor = useEditor({
    extensions: [StarterKit, Image, Highlight],
    content: parsedContent,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  if (!editor) {
    return <div className="animate-pulse h-20 bg-gray-100 rounded-lg" />;
  }

  return <EditorContent editor={editor} />;
}
