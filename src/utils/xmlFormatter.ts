/**
 * XML/JSON formatting utility
 * Provides formatting functions for XML and JSON content
 */

import xmlFormatter from 'xml-formatter';

/**
 * Format XML string with proper indentation
 * @param xml - Raw XML string to format
 * @returns Formatted XML string
 * @throws Error if XML is invalid
 */
export function formatXML(xml: string): string {
  try {
    return xmlFormatter(xml, {
      indentation: '  ',
      collapseContent: true,
      lineSeparator: '\n',
    });
  } catch (error) {
    throw new Error('Invalid XML format');
  }
}

/**
 * Format JSON string with proper indentation
 * @param json - Raw JSON string to format
 * @returns Formatted JSON string
 * @throws Error if JSON is invalid
 */
export function formatJSON(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

/**
 * Format content based on language type
 * @param content - Raw content string to format
 * @param language - Language type ('xml' or 'json')
 * @returns Formatted content string
 * @throws Error if content is invalid for the specified language
 */
export function formatContent(content: string, language: 'xml' | 'json'): string {
  if (language === 'xml') {
    return formatXML(content);
  } else {
    return formatJSON(content);
  }
}
