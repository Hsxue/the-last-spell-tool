/**
 * XML Schema Type Definitions
 * Defines how game objects map to XML structure
 */

/**
 * Supported field types for XML schema
 */
export type SchemaFieldType = 'string' | 'number' | 'boolean' | 'object' | 'array';

/**
 * Defines a single field in an XML schema
 */
export interface XMLSchemaField {
  /** Field name in the resulting game object */
  name: string;
  /** XML attribute name (optional, defaults to field name if not specified) */
  xmlAttr?: string;
  /** Field type for type conversion */
  type: SchemaFieldType;
  /** Nested schema for object types */
  nested?: XMLSchema;
  /** Whether this field is required */
  required?: boolean;
  /** Default value if field is missing */
  default?: any;
}

/**
 * Defines the complete schema for an XML structure
 */
export interface XMLSchema {
  /** Root XML tag name */
  rootTag: string;
  /** Fields defined in this schema */
  fields: XMLSchemaField[];
}

/**
 * Validation result for schema validation
 */
export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
}

/**
 * Schema validation error details
 */
export interface SchemaValidationError {
  field: string;
  message: string;
  line?: number;
  column?: number;
}

/**
 * Helper function to create a simple string field
 */
export function stringField(name: string, xmlAttr?: string, required: boolean = true): XMLSchemaField {
  return { name, xmlAttr, type: 'string', required };
}

/**
 * Helper function to create a number field
 */
export function numberField(name: string, xmlAttr?: string, required: boolean = true): XMLSchemaField {
  return { name, xmlAttr, type: 'number', required };
}

/**
 * Helper function to create a boolean field
 */
export function booleanField(name: string, xmlAttr?: string, required: boolean = true): XMLSchemaField {
  return { name, xmlAttr, type: 'boolean', required };
}

/**
 * Helper function to create an object field with nested schema
 */
export function objectField(
  name: string,
  nested: XMLSchema,
  xmlAttr?: string,
  required: boolean = true
): XMLSchemaField {
  return { name, xmlAttr, type: 'object', nested, required };
}

/**
 * Helper function to create an array field
 */
export function arrayField(name: string, xmlAttr?: string, required: boolean = true): XMLSchemaField {
  return { name, xmlAttr, type: 'array', required };
}
