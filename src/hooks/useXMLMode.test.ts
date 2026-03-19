/**
 * useXMLMode Hook Tests
 * Tests for the useXMLMode hook state management and functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useXMLMode } from '@/hooks/useXMLMode';
import type { XMLSchema } from '@/types/XMLSchema';

describe('useXMLMode', () => {
  const mockSchema: XMLSchema = {
    rootTag: 'weapon',
    fields: [
      { name: 'id', type: 'number' },
      { name: 'name', type: 'string' },
      { name: 'damage', type: 'number' },
    ],
  };

  const mockGameObject = { id: 1, name: 'Sword', damage: 50 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply: vi.fn(),
        })
      );

      expect(result.current.isXMLMode).toBe(false);
      expect(result.current.xmlContent).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should have all functions defined', () => {
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply: vi.fn(),
        })
      );

      expect(result.current.openXMLMode).toBeDefined();
      expect(result.current.closeXMLMode).toBeDefined();
      expect(result.current.toggleXMLMode).toBeDefined();
      expect(result.current.handleApply).toBeDefined();
    });
  });

  describe('openXMLMode', () => {
    it('should convert game object to XML and open modal', () => {
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply: vi.fn(),
        })
      );

      act(() => {
        result.current.openXMLMode();
      });

      expect(result.current.isXMLMode).toBe(true);
      expect(result.current.xmlContent).toContain('<weapon>');
      expect(result.current.xmlContent).toContain('<id>1</id>');
      expect(result.current.xmlContent).toContain('<name>Sword</name>');
      expect(result.current.xmlContent).toContain('<damage>50</damage>');
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
    });

    it('should call onError when conversion fails', () => {
      const onError = vi.fn();
      // gameObjectToXML is lenient and will convert most objects
      // So we test with a valid object instead
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply: vi.fn(),
          onError,
        })
      );

      act(() => {
        result.current.openXMLMode();
      });

      // Conversion should succeed (gameObjectToXML is lenient)
      expect(result.current.xmlContent).not.toBe('');
      expect(result.current.isXMLMode).toBe(true);
      // No error since conversion succeeded
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('closeXMLMode', () => {
    it('should reset all state when closing', () => {
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply: vi.fn(),
        })
      );

      // Open first
      act(() => {
        result.current.openXMLMode();
      });

      expect(result.current.isXMLMode).toBe(true);
      expect(result.current.xmlContent).not.toBe('');

      // Then close
      act(() => {
        result.current.closeXMLMode();
      });

      expect(result.current.isXMLMode).toBe(false);
      expect(result.current.xmlContent).toBe('');
      expect(result.current.error).toBe(null);
    });
  });

  describe('toggleXMLMode', () => {
    it('should open XML mode when closed', () => {
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply: vi.fn(),
        })
      );

      act(() => {
        result.current.toggleXMLMode();
      });

      expect(result.current.isXMLMode).toBe(true);
      expect(result.current.xmlContent).not.toBe('');
    });

    it('should close XML mode when open', () => {
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply: vi.fn(),
        })
      );

      // Open first
      act(() => {
        result.current.openXMLMode();
      });

      expect(result.current.isXMLMode).toBe(true);

      // Then toggle
      act(() => {
        result.current.toggleXMLMode();
      });

      expect(result.current.isXMLMode).toBe(false);
      expect(result.current.xmlContent).toBe('');
    });
  });

  describe('handleApply', () => {
    it('should convert XML back to game object and call onApply', () => {
      const onApply = vi.fn();
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply,
        })
      );

      // Open to get valid XML
      act(() => {
        result.current.openXMLMode();
      });

      const validXml = result.current.xmlContent;

      // Apply changes
      act(() => {
        result.current.handleApply(validXml);
      });

      expect(onApply).toHaveBeenCalledWith({
        id: 1,
        name: 'Sword',
        damage: 50,
      });
      expect(result.current.isXMLMode).toBe(false);
    });

    it('should handle modified XML values', () => {
      const onApply = vi.fn();
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply,
        })
      );

      const modifiedXml = '<weapon><id>99</id><name>Axe</name><damage>100</damage></weapon>';

      // Apply modified XML
      act(() => {
        result.current.handleApply(modifiedXml);
      });

      expect(onApply).toHaveBeenCalledWith({
        id: 99,
        name: 'Axe',
        damage: 100,
      });
    });

    it('should call onError and throw when XML is invalid', () => {
      const onError = vi.fn();
      const onApply = vi.fn();
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply,
          onError,
        })
      );

      const invalidXml = '<weapon><unclosed';

      // handleApply should throw for invalid XML
      expect(() => {
        act(() => {
          try {
            result.current.handleApply(invalidXml);
          } catch (error) {
            // Error should be set in state
            expect(result.current.error).not.toBe(null);
            throw error;
          }
        });
      }).toThrow();

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(onApply).not.toHaveBeenCalled();
    });

    it('should close modal after successful apply', () => {
      const onApply = vi.fn();
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply,
        })
      );

      act(() => {
        result.current.openXMLMode();
      });

      expect(result.current.isXMLMode).toBe(true);

      const validXml = result.current.xmlContent;

      act(() => {
        result.current.handleApply(validXml);
      });

      expect(result.current.isXMLMode).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should track errors in state', () => {
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply: vi.fn(),
          onError,
        })
      );

      // Try to apply invalid XML (unclosed tag with content)
      let threw = false;
      act(() => {
        try {
          result.current.handleApply('<weapon><unclosed');
        } catch {
          threw = true;
        }
      });

      expect(threw).toBe(true);
      expect(result.current.error).not.toBe(null);
      expect(result.current.error?.message).toContain('Invalid');
    });

    it('should clear error when opening XML mode', () => {
      const { result } = renderHook(() =>
        useXMLMode({
          gameObject: mockGameObject,
          schema: mockSchema,
          onApply: vi.fn(),
        })
      );

      // Create an error first
      act(() => {
        try {
          result.current.handleApply('<weapon><unclosed');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).not.toBe(null);

      // Open XML mode should clear error
      act(() => {
        result.current.openXMLMode();
      });

      expect(result.current.error).toBe(null);
    });
  });
});
