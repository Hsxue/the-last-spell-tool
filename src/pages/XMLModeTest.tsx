/**
 * XML Mode Test Page
 * Demonstrates integration and usage of the XML mode toggling functionality
 */

import { useState, useEffect } from 'react';
import { useXMLMode } from '@/hooks/useXMLMode';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { weaponSchema, characterSchema } from '@/types/XMLSchemas';

// Define Weapon interface
interface Weapon {
  id: number;
  name: string;
  damage: number;
  rare: boolean;
  description?: string;
  tags: string[];
}

// Define Character interface
interface Character {
  id: number;
  name: string;
  level: number;
  class: string;
  weapons: Weapon[];
}

export function XMLModeTest() {
  // Initial weapon data
  const [weapon, setWeapon] = useState<Weapon>({
    id: 1,
    name: 'Fire Sword',
    damage: 50,
    rare: true,
    description: 'A powerful sword that burns enemies',
    tags: ['melee', 'fire', 'weapon'],
  });

  // Initial character data
  const [character, setCharacter] = useState<Character>({
    id: 1,
    name: 'Hero',
    level: 10,
    class: 'Warrior',
    weapons: [weapon],
  });

  // Initialize hook for weapon
  const weaponXMLMode = useXMLMode({
    gameObject: weapon,
    schema: weaponSchema,
    onApply: (updatedWeapon: Weapon) => setWeapon(updatedWeapon),
  });

  // Initialize hook for character
  const characterXMLMode = useXMLMode({
    gameObject: character,
    schema: characterSchema,
    onApply: (updatedCharacter: Character) => setCharacter(updatedCharacter),
  });

  // Track which XML mode we're showing
  const [activeMode, setActiveMode] = useState<'weapon' | 'character' | null>(null);

  // Close all modes when both hooks report closed
  useEffect(() => {
    if (!weaponXMLMode.isXMLMode && !characterXMLMode.isXMLMode) {
      setActiveMode(null);
    }
  }, [weaponXMLMode.isXMLMode, characterXMLMode.isXMLMode]);

  // Open mode handlers
  const openWeaponXMLMode = () => {
    setActiveMode('weapon');
    weaponXMLMode.openXMLMode();
  };

  const openCharacterXMLMode = () => {
    setActiveMode('character');
    characterXMLMode.openXMLMode();
  };

  // Close mode handler
  const closeModal = () => {
    if (activeMode === 'weapon') {
      weaponXMLMode.closeXMLMode();
    } else if (activeMode === 'character') {
      characterXMLMode.closeXMLMode();
    }
    setActiveMode(null);
  };

  // Apply changes handler
  const applyChanges = (xml: string) => {
    if (activeMode === 'weapon') {
      weaponXMLMode.handleApply(xml);
    } else if (activeMode === 'character') {
      characterXMLMode.handleApply(xml);
    }
  };

  // Get current XML content based on active mode
  const getCurrentXMLContent = () => {
    if (activeMode === 'weapon') {
      return weaponXMLMode.xmlContent;
    } else if (activeMode === 'character') {
      return characterXMLMode.xmlContent;
    }
    return '';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">XML Mode Integration Test</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-gray-600 mb-8">
          This page demonstrates how to integrate XML mode switching functionality into your components.
          Click the buttons below to experience direct XML editing capabilities.
        </p>
      </div>

      {/* Weapon Section */}
      <section className="border rounded-lg p-6 mb-8 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Weapon Data</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded">
          <div className="space-y-2">
            <p><strong>ID:</strong> {weapon.id}</p>
            <p><strong>Name:</strong> {weapon.name}</p>
            <p><strong>Damage:</strong> {weapon.damage}</p>
            <p><strong>Rare:</strong> {weapon.rare.toString()}</p>
          </div>
          <div className="space-y-2">
            <p><strong>Description:</strong> {weapon.description || 'N/A'}</p>
            <p><strong>Tags:</strong> {weapon.tags.join(', ')}</p>
          </div>
        </div>

        <button
          onClick={openWeaponXMLMode}
          disabled={weaponXMLMode.isLoading}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            weaponXMLMode.isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {weaponXMLMode.isLoading ? 'Loading...' : 'Edit in XML Mode'}
        </button>

        {weaponXMLMode.error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            <strong>Error:</strong> {weaponXMLMode.error.message}
          </div>
        )}
      </section>

      {/* Character Section */}
      <section className="border rounded-lg p-6 mb-8 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Character Data</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded">
          <div className="space-y-2">
            <p><strong>ID:</strong> {character.id}</p>
            <p><strong>Name:</strong> {character.name}</p>
            <p><strong>Level:</strong> {character.level}</p>
            <p><strong>Class:</strong> {character.class}</p>
          </div>
          <div className="space-y-2">
            <p><strong>Weapons:</strong></p>
            {character.weapons.map((wpn, index) => (
              <div key={index} className="ml-4 text-sm">
                <span>{wpn.name} (Dmg: {wpn.damage})</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={openCharacterXMLMode}
          disabled={characterXMLMode.isLoading}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            characterXMLMode.isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {characterXMLMode.isLoading ? 'Loading...' : 'Edit Character in XML Mode'}
        </button>

        {characterXMLMode.error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            <strong>Error:</strong> {characterXMLMode.error.message}
          </div>
        )}
      </section>

      {/* Integration Instructions */}
      <section className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Integration Guide</h2>
        <div className="prose prose-gray max-w-none">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Import the required functions: <code className="bg-gray-100 px-1 rounded">useXMLMode</code>, <code className="bg-gray-100 px-1 rounded">XMLEditorModal</code></li>
            <li>Define your schema according to <code className="bg-gray-100 px-1 rounded">XMLSchema</code> interface</li>
            <li>Create state for your game object using useState</li>
            <li>Call <code className="bg-gray-100 px-1 rounded">useXMLMode</code> hook with your game object, schema and onApply callback</li>
            <li>Add a button that triggers the <code className="bg-gray-100 px-1 rounded">openXMLMode</code> function</li>
            <li>Render the <code className="bg-gray-100 px-1 rounded">XMLEditorModal</code> and pass relevant state and callbacks</li>
          </ol>
        </div>
      </section>

      {/* XML Modal */}
      <XMLEditorModal
        isOpen={!!activeMode}
        onClose={closeModal}
        value={getCurrentXMLContent()}
        language="xml"
        title={`${activeMode} XML Editor`}
        readOnly={activeMode === 'character' ? characterXMLMode.isLoading : weaponXMLMode.isLoading}
        onApply={applyChanges}
      />
    </div>
  );
}

export default XMLModeTest;