import { ZodIssue } from 'zod';
import sanitizeHtml from 'sanitize-html';

/**
 * Format Zod validation errors to user-friendly error messages
 * @param issues Zod validation issue array
 * @returns Formatted error message
 */
export function formatZodErrors(issues: ZodIssue[]): string {
  const errors = issues.map(issue => {
    const field = issue.path.join('.');
    const message = issue.message;
    return `${field}: ${message}`;
  });

  return errors.join('; ');
}

/**
 * Sanitize user input data
 * @param input User input
 * @returns Sanitized data
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // First trim whitespace
  let sanitized = input.trim();

  // Then sanitize HTML content to prevent XSS
  sanitized = sanitizeHtml(sanitized, {
    allowedTags: [], // Allow no HTML tags for basic text input
    allowedAttributes: {},
    disallowedTagsMode: 'escape',
  });

  return sanitized;
}

/**
 * Sanitize rich text that may contain safe HTML
 * @param input User input that may contain basic HTML
 * @returns Sanitized HTML content
 */
export function sanitizeRichInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Sanitize HTML content allowing only safe tags for rich text
  sanitized = sanitizeHtml(sanitized, {
    allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    allowedAttributes: {},
    disallowedTagsMode: 'escape',
  });

  return sanitized;
}

/**
 * Validate user input with a generic function
 * @param data Data to validate
 * @param schema Zod validation schema
 * @returns Validation result
 */
export function validateInput<T>(
  data: unknown,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: any } }
): { success: boolean; data?: T; error?: string } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessage = formatZodErrors(result.error.issues);
    return { success: false, error: errorMessage };
  }

  return { success: true, data: result.data };
}

/**
 * Validate ID parameter
 * @param id ID to validate
 * @returns Whether it's a valid ID
 */
export function validateId(id: string): boolean {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate query parameters
 * @param params Query parameters
 * @returns Validated safe parameters
 */
export function validateQueryParams(params: Record<string, string | undefined>): Record<string, string> {
  const validated: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      // Validate key name to prevent malicious parameter names
      if (/^[a-zA-Z0-9_-]+$/.test(key)) {
        validated[key] = sanitizeInput(value);
      }
    }
  }

  return validated;
}