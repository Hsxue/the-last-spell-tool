/**
 * ContextMenu - Right-click context menu for map tiles
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ContextMenuProps {
  tileX: number;
  tileY: number;
  worldX: number;
  worldY: number;
  screenX: number;
  screenY: number;
  onClose: () => void;
}

export function ContextMenu({ tileX, tileY, worldX, worldY, screenX, screenY, onClose }: ContextMenuProps) {
  const [position, setPosition] = useState({ x: screenX + 10, y: screenY + 10 });

  useEffect(() => {
    // Position menu at bottom-right of mouse cursor to avoid covering it
    const menuWidth = 200;
    const menuHeight = 200;
    const padding = 10;
    
    // Start from mouse position with 10px offset (bottom-right corner)
    let newX = screenX + 10;
    let newY = screenY + 10;
    
    // Adjust if menu would go off-screen right
    if (newX + menuWidth > window.innerWidth - padding) {
      newX = screenX - menuWidth - 10;
    }
    
    // Adjust if menu would go off-screen bottom
    if (newY + menuHeight > window.innerHeight - padding) {
      newY = screenY - menuHeight - 10;
    }
    
    setPosition({ x: newX, y: newY });
    
    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    // Close on any click outside
    const handleClickOutside = () => {
      onClose();
    };
    
    // Small delay before adding click listener to prevent immediate close
    const timeoutId = setTimeout(() => {
      window.addEventListener('click', handleClickOutside, { once: true });
    }, 100);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      clearTimeout(timeoutId);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [screenX, screenY, onClose]);

  return createPortal(
    <div
      className="fixed bg-background border border-border rounded-md shadow-lg py-2 z-50 min-w-[200px]"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b border-border">
        <div className="text-sm font-semibold">Tile ({tileX}, {tileY})</div>
        <div className="text-xs text-muted-foreground">
          World: ({worldX}, {worldY})
        </div>
      </div>
      
      <div className="py-1">
        <button
          className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            navigator.clipboard.writeText(`${tileX},${tileY}`);
            onClose();
          }}
        >
          📋 Copy Coordinates
        </button>
        
        <button
          className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('centerontile', {
              detail: { tileX, tileY },
            }));
            onClose();
          }}
        >
          🎯 Center Camera
        </button>
        
        <div className="border-t border-border my-1" />
        
        <button
          className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('inspecttile', {
              detail: { tileX, tileY },
            }));
            onClose();
          }}
        >
          🔍 Inspect
        </button>
      </div>
    </div>,
    document.body
  );
}
