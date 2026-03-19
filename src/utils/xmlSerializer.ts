/**
 * XML Serialization Utility
 * Converts game objects to/from XML using schema definitions
 */

import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import type { XMLSchema, XMLSchemaField, SchemaValidationResult, SchemaValidationError, SchemaFieldType } from '@/types/XMLSchema';

/**
 * Convert a JavaScript value to the appropriate type based on schema field
 */
function convertToType(value: any, field: XMLSchemaField): any {
  if (value === undefined || value === null) {
    return field.default ?? null;
  }

  switch (field.type) {
    case 'string':
      return String(value);
    case 'number':
      const num = Number(value);
      return isNaN(num) ? field.default ?? 0 : num;
    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        return lower === 'true' || lower === '1' || lower === 'yes';
      }
      return Boolean(value);
    case 'object':
      if (field.nested && typeof value === 'object') {
        return xmlToGameObjectInternal(value, field.nested);
      }
      return value;
    case 'array':
      if (Array.isArray(value)) return value;
      return [value];
    default:
      return value;
  }
}

/**
 * Convert a game object value to XML-compatible format
 */
function convertToXMLValue(value: any, fieldType: SchemaFieldType): any {
  if (value === undefined || value === null) {
    return '';
  }

  switch (fieldType) {
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      return String(value);
    case 'string':
    default:
      return String(value);
  }
}

/**
 * Internal function to convert parsed XML to game object
 */
function xmlToGameObjectInternal(parsedXml: any, schema: XMLSchema): any {
  const result: any = {};
  const rootTag = schema.rootTag;

  // Handle array of root elements
  const rootData = Array.isArray(parsedXml) ? parsedXml[0] : parsedXml;

  if (!rootData || typeof rootData !== 'object') {
    return result;
  }

  // Get the root element data
  let elementData = rootData[rootTag];
  if (!elementData) {
    // Maybe the parsed XML already is the root element
    elementData = rootData;
  }

  if (!elementData || typeof elementData !== 'object') {
    return result;
  }

  for (const field of schema.fields) {
    const xmlAttrName = field.xmlAttr || field.name;
    let value = elementData[xmlAttrName];

    // Try camelCase conversion if exact match not found
    if (value === undefined) {
      const camelCase = xmlAttrName.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      value = elementData[camelCase];
    }

    // Try PascalCase conversion
    if (value === undefined) {
      const pascalCase = xmlAttrName.charAt(0).toUpperCase() + xmlAttrName.slice(1);
      value = elementData[pascalCase];
    }

    // Use default if value is undefined
    if (value === undefined) {
      value = field.default;
    }

    result[field.name] = convertToType(value, field);
  }

  return result;
}

/**
 * Convert XML string to game object using schema
 * @param xml - XML string to parse
 * @param schema - Schema definition
 * @returns Game object
 * @throws Error if XML is invalid
 */
export function XMLToGameObject(xml: string, schema: XMLSchema): any {
  try {
    const parser = new XMLParser({
      allowBooleanAttributes: true,
      ignoreAttributes: false,
      parseAttributeValue: true,
      parseTagValue: true,
      isArray: (_tagName: string, _jPathOrMatcher: unknown, _isLeafNode: boolean, _isAttribute: boolean) => {
        // Handle arrays explicitly
        return false;
      },
    });

    const parsed = parser.parse(xml);
    return xmlToGameObjectInternal(parsed, schema);
  } catch (error: any) {
    throw new Error(`Failed to parse XML: ${error.message}`);
  }
}

/**
 * Internal function to convert game object to XML structure
 */
function gameObjectToXMLInternal(gameObject: any, schema: XMLSchema): any {
  const result: any = {};
  const rootTag = schema.rootTag;
  const elementData: any = {};

  for (const field of schema.fields) {
    const xmlAttrName = field.xmlAttr || field.name;
    const value = gameObject[field.name];

    if (value === undefined || value === null) {
      if (field.default !== undefined) {
        elementData[xmlAttrName] = convertToXMLValue(field.default, field.type);
      }
      continue;
    }

    if (field.type === 'object' && field.nested) {
      elementData[xmlAttrName] = gameObjectToXMLInternal(value, field.nested);
    } else if (field.type === 'array' && Array.isArray(value)) {
      elementData[xmlAttrName] = value.map((item: any) => String(item));
    } else {
      elementData[xmlAttrName] = convertToXMLValue(value, field.type);
    }
  }

  result[rootTag] = elementData;
  return result;
}

/**
 * Convert game object to XML string using schema
 * @param gameObject - Game object to convert
 * @param schema - Schema definition
 * @returns XML string
 */
export function gameObjectToXML(gameObject: any, schema: XMLSchema): string {
  const xmlObject = gameObjectToXMLInternal(gameObject, schema);

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '  ',
    suppressEmptyNode: false,
  });

  return builder.build(xmlObject);
}

/**
 * Validate XML against schema
 * @param xml - XML string to validate
 * @param schema - Schema definition
 * @returns Schema validation result with errors
 */
export function validateXMLSchema(xml: string, schema: XMLSchema): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];

  try {
    const gameObject = XMLToGameObject(xml, schema);

    for (const field of schema.fields) {
      if (field.required && (gameObject[field.name] === undefined || gameObject[field.name] === null)) {
        errors.push({
          field: field.name,
          message: `Required field "${field.name}" is missing`,
        });
      }

      // Type validation
      const value = gameObject[field.name];
      if (value !== undefined && value !== null) {
        switch (field.type) {
          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push({
                field: field.name,
                message: `Field "${field.name}" must be a number`,
              });
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push({
                field: field.name,
                message: `Field "${field.name}" must be a boolean`,
              });
            }
            break;
          case 'string':
            if (typeof value !== 'string') {
              errors.push({
                field: field.name,
                message: `Field "${field.name}" must be a string`,
              });
            }
            break;
          case 'object':
            if (typeof value !== 'object' || value === null) {
              errors.push({
                field: field.name,
                message: `Field "${field.name}" must be an object`,
              });
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors.push({
                field: field.name,
                message: `Field "${field.name}" must be an array`,
              });
            }
            break;
        }
      }
    }
  } catch (error: any) {
    errors.push({
      field: schema.rootTag,
      message: error.message || 'Failed to parse XML',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a default schema from a sample object (utility function)
 * @param sampleObject - Sample object to infer schema from
 * @param rootTag - Root XML tag name
 * @returns Inferred schema
 */
export function createSchemaFromObject(sampleObject: any, rootTag: string = 'root'): XMLSchema {
  const fields: XMLSchemaField[] = [];

  for (const [key, value] of Object.entries(sampleObject)) {
    const field: XMLSchemaField = {
      name: key,
      type: 'string',
      required: true,
    };

    if (value === null || value === undefined) {
      field.type = 'string';
    } else if (typeof value === 'string') {
      field.type = 'string';
    } else if (typeof value === 'number') {
      field.type = 'number';
    } else if (typeof value === 'boolean') {
      field.type = 'boolean';
    } else if (Array.isArray(value)) {
      field.type = 'array';
    } else if (typeof value === 'object') {
      field.type = 'object';
      field.nested = createSchemaFromObject(value, key);
    }

    fields.push(field);
  }

  return { rootTag, fields };
}
