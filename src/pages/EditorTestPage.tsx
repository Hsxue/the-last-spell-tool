// src/pages/EditorTestPage.tsx
import { useState } from 'react';
import { useXMLMode } from '@/hooks/useXMLMode';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import type { XMLSchema } from '@/types/XMLSchema';

interface SimpleWeapon {
  id: number;
  name: string;
  damage: number;
  rare: boolean;
  description?: string;
}

// Simple weapon schema for testing
const weaponSchema: XMLSchema = {
  rootTag: 'weapon',
  fields: [
    { name: 'id', xmlAttr: 'id', type: 'number' },
    { name: 'name', type: 'string' },
    { name: 'damage', type: 'number' },
    { name: 'rare', type: 'boolean' },
    { name: 'description', type: 'string', required: false },
  ]
};

export function EditorTestPage() {
  const [weapon, setWeapon] = useState<SimpleWeapon>({
    id: 1,
    name: 'Sword',
    damage: 10,
    rare: true,
    description: 'A basic sword'
  });

  const {
    isXMLMode,
    openXMLMode,
    closeXMLMode,
    handleApply,
    xmlContent,
  } = useXMLMode({
    gameObject: weapon,
    schema: weaponSchema,
    onApply: (updated) => setWeapon(updated),
  });

  return (
    <div className="p-4">
      <h1 data-testid="page-title">Editor Test Page</h1>
      <button 
        onClick={openXMLMode} 
        data-testid="open-xml-mode-btn"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Open XML Mode
      </button>
      <div data-testid="weapon-name">Name: {weapon.name}</div>
      <div data-testid="weapon-damage">Damage: {weapon.damage}</div>
      <div data-testid="weapon-rare">Rare: {weapon.rare.toString()}</div>
      <div data-testid="weapon-description">Description: {weapon.description || ''}</div>
      <XMLEditorModal
        isOpen={isXMLMode}
        onClose={closeXMLMode}
        value={xmlContent}
        language="xml"
        onApply={handleApply}
      />
    </div>
  );
}

export default EditorTestPage;