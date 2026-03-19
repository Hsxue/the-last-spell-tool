/**
 * XML/JSON Syntax Validation Utility
 * Provides real-time syntax validation with error markers
 */

import { XMLParser } from 'fast-xml-parser';

export interface ValidationError {
  line: number;
  column: number;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: ValidationError;
}

/**
 * Validate XML string syntax
 * @param xml - XML string to validate
 * @returns ValidationResult with valid status and optional error details
 */
export function validateXML(xml: string): ValidationResult {
  if (!xml || xml.trim() === '') {
    return { valid: false, error: { line: 1, column: 1, message: 'Empty XML content' } };
  }

  try {
    const parser = new XMLParser({
      allowBooleanAttributes: true,
      ignoreAttributes: false,
      parseAttributeValue: true,
      parseTagValue: true,
    });
    parser.parse(xml);
    return { valid: true };
  } catch (error: any) {
    // fast-xml-parser provides line/column in error object
    return {
      valid: false,
      error: {
        line: error.line || 1,
        column: error.column || 1,
        message: error.message || 'Unknown XML parsing error',
      },
    };
  }
}

/**
 * Validate JSON string syntax
 * @param json - JSON string to validate
 * @returns ValidationResult with valid status and optional error details
 */
export function validateJSON(json: string): ValidationResult {
  if (!json || json.trim() === '') {
    return { valid: false, error: { line: 1, column: 1, message: 'Empty JSON content' } };
  }

  try {
    JSON.parse(json);
    return { valid: true };
  } catch (error: any) {
    // JSON.parse doesn't provide line info, but we can extract position from message
    const positionMatch = error.message.match(/position\s+(\d+)/i);
    const position = positionMatch ? parseInt(positionMatch[1], 10) : 0;

    // Try to calculate line/column from position
    let line = 1;
    let column = 1;
    if (position > 0) {
      const linesBefore = json.slice(0, position).split('\n');
      line = linesBefore.length;
      column = linesBefore[linesBefore.length - 1].length + 1;
    }

    return {
      valid: false,
      error: {
        line,
        column,
        message: error.message || 'Unknown JSON parsing error',
      },
    };
  }
}

/**
 * Validate content based on language type
 * @param content - Content string to validate
 * @param language - Language type ('xml' or 'json')
 * @returns ValidationResult with valid status and optional error details
 */
export function validateContent(content: string, language: 'xml' | 'json'): ValidationResult {
  if (language === 'json') {
    return validateJSON(content);
  }
  return validateXML(content);
}

/**
 * Create a debounced validation function
 * @param delay - Debounce delay in milliseconds (default: 500)
 * @returns Function that returns a promise resolving to ValidationResult
 */
export function createDebouncedValidator(delay: number = 500) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debouncedValidate(
    content: string,
    language: 'xml' | 'json'
  ): Promise<ValidationResult> {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const result = validateContent(content, language);
        resolve(result);
      }, delay);
    });
  };
}
