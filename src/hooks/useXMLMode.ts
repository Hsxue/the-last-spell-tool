/**
 * useXMLMode Hook
 * Provides state management for XML mode switching in game object editors
 */

import { useState, useCallback } from 'react';
import type { XMLSchema } from '@/types/XMLSchema';
import { gameObjectToXML, XMLToGameObject } from '@/utils/xmlSerializer';
import { validateXML, validateJSON } from '@/utils/xmlValidator';

export interface UseXMLModeOptions<T> {
  /** The game object to edit */
  gameObject: T;
  /** Schema for XML conversion */
  schema: XMLSchema;
  /** Callback when changes are applied */
  onApply: (updatedObject: T) => void;
  /** Optional error callback */
  onError?: (error: Error) => void;
}

export interface UseXMLModeReturn {
  /** Whether XML mode is currently active */
  isXMLMode: boolean;
  /** Current XML content */
  xmlContent: string;
  /** Whether an operation is in progress */
  isLoading: boolean;
  /** Current error state */
  error: Error | null;
  /** Open XML mode and convert game object to XML */
  openXMLMode: () => void;
  /** Close XML mode and reset state */
  closeXMLMode: () => void;
  /** Toggle XML mode on/off */
  toggleXMLMode: () => void;
  /** Apply XML changes back to game object */
  handleApply: (xml: string) => void;
}

/**
 * Hook for managing XML mode state in game object editors
 * 
 * @example
 * ```typescript
 * function WeaponEditor() {
 *   const [weapon, setWeapon] = useState({ id: 1, name: 'Sword', damage: 10 });
 *   
 *   const {
 *     isXMLMode,
 *     openXMLMode,
 *     closeXMLMode,
 *     handleApply,
 *     xmlContent,
 *   } = useXMLMode({
 *     gameObject: weapon,
 *     schema: weaponSchema,
 *     onApply: (updatedWeapon) => setWeapon(updatedWeapon),
 *   });
 * 
 *   return (
 *     <>
 *       <Button onClick={openXMLMode}>XML Mode</Button>
 *       <XMLEditorModal
 *         isOpen={isXMLMode}
 *         onClose={closeXMLMode}
 *         value={xmlContent}
 *         onApply={handleApply}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function useXMLMode<T>({
  gameObject,
  schema,
  onApply,
  onError,
}: UseXMLModeOptions<T>): UseXMLModeReturn {
  const [isXMLMode, setIsXMLMode] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Open XML mode by converting the game object to XML
   */
  const openXMLMode = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      const xml = gameObjectToXML(gameObject, schema);
      setXmlContent(xml);
      setIsXMLMode(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to convert to XML');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [gameObject, schema, onError]);

  /**
   * Close XML mode and reset all state
   */
  const closeXMLMode = useCallback(() => {
    setIsXMLMode(false);
    setXmlContent('');
    setError(null);
  }, []);

  /**
   * Toggle XML mode on or off
   */
  const toggleXMLMode = useCallback(() => {
    if (isXMLMode) {
      closeXMLMode();
    } else {
      openXMLMode();
    }
  }, [isXMLMode, closeXMLMode, openXMLMode]);

  /**
   * Apply XML changes by converting back to game object
   * @param xml - The XML content to apply
   * @throws Error if XML is invalid or conversion fails
   */
  const handleApply = useCallback((xml: string) => {
    try {
      // Determine content type and validate
      const isXML = xml.includes('<');
      const validation = isXML 
        ? validateXML(xml)
        : validateJSON(xml);
      
      if (!validation.valid) {
        throw new Error(
          `Invalid ${isXML ? 'XML' : 'JSON'}: ${validation.error?.message}`
        );
      }

      // Convert XML back to game object
      const updatedObject = XMLToGameObject(xml, schema);
      onApply(updatedObject);
      closeXMLMode();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to apply changes');
      setError(error);
      onError?.(error);
      throw error; // Re-throw so caller knows it failed
    }
  }, [xmlContent, schema, onApply, closeXMLMode, onError]);

  return {
    isXMLMode,
    openXMLMode,
    closeXMLMode,
    toggleXMLMode,
    xmlContent,
    handleApply,
    isLoading,
    error,
  };
}
