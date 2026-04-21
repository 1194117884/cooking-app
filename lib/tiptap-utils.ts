import { JSONContent } from '@tiptap/react';

// 空的 Tiptap 文档
export function createEmptyDoc(): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
  };
}

// 检查是否是有效的 Tiptap JSON
export function isValidTiptapJson(content: unknown): boolean {
  if (!content || typeof content !== 'object') return false;
  const doc = content as JSONContent;
  return doc.type === 'doc' && Array.isArray(doc.content);
}

// 将旧格式（字符串数组）转换为 Tiptap JSON
export function convertLegacyStepsToTiptap(steps: string[]): JSONContent {
  return {
    type: 'doc',
    content: steps.map((step) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: step }],
    })),
  };
}

// 从 Tiptap JSON 提取纯文本（用于预览）
export function extractTextFromTiptap(content: JSONContent): string {
  if (!content.content) return '';

  return content.content
    .map((node) => {
      if (node.type === 'paragraph' && node.content) {
        return node.content
          .map((child) => (child.type === 'text' ? child.text : ''))
          .join('');
      }
      return '';
    })
    .filter((text) => text.trim())
    .join('\n');
}
