# AGENTS.md - Development Guide for This Repository

## Project Overview

**Stack**: React 19 + TypeScript + Vite + Zustand + Tailwind CSS v4
**Game**: The Last Spell - Weapon & Skill Editor Tool
**Key Libraries**: 
- State: Zustand (with Immer middleware)
- UI: Radix UI primitives, Tailwind CSS v4
- XML: fast-xml-parser
- Graphics: Konva + react-konva
- Testing: Vitest (unit), Playwright (E2E)

---

## Build & Development Commands

```bash
npm run dev          # Start dev server with HMR (Vite)
npm run build        # Type-check + production build
npm run lint         # ESLint check
npm run preview      # Preview production build
npm test             # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
```

### Running Single Tests

**Unit Tests (Vitest)**:
```bash
npm test -- filename.test.ts           # Run specific test file
npm test -- -t "test name pattern"     # Run tests matching pattern
npm test -- --ui                       # Open Vitest UI dashboard
```

**E2E Tests (Playwright)**:
```bash
npm run test:e2e -- filename.spec.ts   # Run specific E2E test
npm run test:e2e -- --headed           # Run in headed mode (see browser)
npm run test:e2e -- --debug            # Debug mode with Playwright inspector
```

**Test Files Location**:
- Unit tests: `src/__tests__/`, `*.test.ts`, `*.test.tsx`
- E2E tests: `e2e/*.spec.ts`

---

## Code Style Guidelines

### Imports

```typescript
// 1. React & external libraries
import { useState, useEffect } from 'react';
import { XMLParser } from 'fast-xml-parser';

// 2. Radix UI components
import { Button } from '@/components/ui/button';

// 3. Internal modules (use @ alias)
import { useWeaponSkillStore } from '@/store/weaponSkillStore';
import type { WeaponDefinition } from '@/types/weapon-skill';

// 4. Relative imports (same directory)
import { WeaponTreeView } from './WeaponTreeView';
```

**Rules**:
- Use `@/` alias for all `src/` imports
- Group imports by category (React → Libraries → UI → Internal → Relative)
- Use named exports over default exports
- Type imports: `import type { TypeName }`

### TypeScript

```typescript
// ✅ Use explicit types for function parameters
function updateWeapon(weapon: WeaponDefinition) {
  // ...
}

// ✅ Use type guards for runtime validation
function isWeapon(obj: unknown): obj is WeaponDefinition {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}

// ✅ Use optional chaining and nullish coalescing
const damage = weapon.levelVariations?.[level]?.baseDamage ?? [0, 0];

// ❌ Avoid `any` - use `unknown` with type guards
function parseData(data: unknown): WeaponDefinition {
  if (!isWeapon(data)) throw new Error('Invalid data');
  return data;
}
```

**Strict Mode Rules** (enforced by tsconfig):
- `strict: true` - All strict type-checking options
- `noUnusedLocals: true` - No unused variables
- `noUncheckedIndexedAccess: true` - Index access returns `T | undefined`

### Naming Conventions

```typescript
// Components: PascalCase
function WeaponEditor() { return <div />; }

// Types/Interfaces: PascalCase
interface WeaponDefinition { id: string; }
type SkillCategory = 'Melee' | 'Ranged';

// Variables/Functions: camelCase
const selectedWeapon = useStore(...);
function handleSave() { /* ... */ }

// Constants: UPPER_SNAKE_CASE
const UTF16_LE_BOM = new Uint8Array([0xff, 0xfe]);

// Files: PascalCase for components, kebab-case for utilities
// ✅ WeaponEditor.tsx, weapon-xml-parser.ts
```

### Error Handling

```typescript
// ✅ Use try-catch for external operations (XML parsing, file I/O)
try {
  const parsed = parseWeapons(xmlString);
} catch (error) {
  console.error('Failed to parse weapons:', error);
  throw new Error('Invalid weapon XML format');
}

// ✅ Use Result pattern for expected failures
function safeParse(xml: string): { ok: true; data: T } | { ok: false; error: string } {
  try {
    return { ok: true, data: parse(xml) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ❌ Never suppress errors silently
// Bad: catch(e) {}
// Bad: try { ... } catch (e) { console.log(e); }
```

### State Management (Zustand)

```typescript
// ✅ Use plain objects/Record instead of Map/Set for Zustand store
interface WeaponStore {
  weapons: WeaponDefinition[];
  levelVariations: Record<number, WeaponLevel>;  // NOT Map<number, ...>
}

// ✅ Create new objects, don't mutate
updateWeapon: (weapon) => {
  set((state) => ({
    weapons: state.weapons.map(w => 
      w.id === weapon.id ? { ...weapon } : w
    )
  }));
}

// ❌ Avoid: Direct Map mutation (Immer may not track)
// state.levelVariations.set(level, data)  // May not trigger re-render
```

### XML Serialization

```typescript
// ✅ Symmetric serialization (export ↔ import)
function weaponToXml(weapon): XmlFormat {
  return {
    BaseDamage: { Min: weapon.baseDamage[0], Max: weapon.baseDamage[1] }
  };
}

function xmlToWeapon(xml): WeaponDefinition {
  // Handle both object {Min, Max} and array [min, max] formats
  const damage = parseNumberTuple(xml.BaseDamage);
  return { baseDamage: damage };
}

// ✅ Add round-trip tests
test('weapon XML round-trip', () => {
  const original = createWeapon();
  const xml = exportWeapons([original]);
  const parsed = parseWeapons(xml)[0];
  expect(parsed).toEqual(original);
});
```

### Component Structure

```typescript
import { useState } from 'react';
import { useWeaponSkillStore } from '@/store/weaponSkillStore';

interface Props {
  weaponId: string;
  onSave?: (weapon: WeaponDefinition) => void;
}

export function WeaponEditor({ weaponId, onSave }: Props) {
  // 1. Hooks first
  const selectedWeapon = useWeaponSkillStore(...);
  const [editedWeapon, setEditedWeapon] = useState(null);

  // 2. Effect hooks
  useEffect(() => {
    if (selectedWeapon) setEditedWeapon({ ...selectedWeapon });
  }, [selectedWeapon]);

  // 3. Event handlers
  const handleSave = () => {
    onSave?.(editedWeapon);
  };

  // 4. Early returns
  if (!selectedWeapon) return <EmptyState />;

  // 5. Main render
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  );
}
```

---

## Common Patterns

### Data Parsing Pattern

```typescript
const parseNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
};

// Usage
const damage = parseNumber(xml.BaseDamage);
```

### File Operations

```typescript
// Export to file
const handleExport = () => {
  const xml = exportWeapons(weapons);
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'weapons.xml';
  a.click();
  URL.revokeObjectURL(url);
};
```

---

## Testing Guidelines

### Unit Tests (Vitest)

```typescript
import { describe, it, expect } from 'vitest';
import { parseWeapons, exportWeapons } from './weapon-xml-parser';

describe('weapon-xml-parser', () => {
  it('handles empty levelVariations', () => {
    const weapon = { id: 'test', levelVariations: {} };
    expect(() => exportWeapons([weapon])).not.toThrow();
  });

  it('preserves all fields in round-trip', () => {
    const original = createFullWeapon();
    const xml = exportWeapons([original]);
    const parsed = parseWeapons(xml)[0];
    expect(parsed.levelVariations).toEqual(original.levelVariations);
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('XML editor: edit and apply changes', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('open-xml').click();
  await page.locator('#xml-content').fill('<weapon><damage>50</damage></weapon>');
  await page.getByTestId('apply').click();
  await expect(page.getByTestId('damage-field')).toContainText('50');
});
```

---

## Git & Commit Guidelines

### Commit Message Format

```
<type>: <short description>

<detailed description (optional)>

Fixes: #issue-number (if applicable)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring (no functionality change)
- `docs`: Documentation only
- `test`: Adding/updating tests
- `chore`: Build/config changes

**Example**:
```
fix: weapon level serialization with Record type

- Change levelVariations from Map to Record for Zustand compatibility
- Add defensive null checks in XML parser
- Update type definitions

Fixes: #123
```

---

## Debugging Tips

### Enable XML Serialization Debug Logs

```typescript
// In XML parsers, console.log is used for debugging
// Check browser console for:
// - [weaponToXml] - Export process
// - [parseLevelVariations] - Import process
// - [store.updateWeapon] - Store updates
```

### Zustand DevTools

Install Redux DevTools extension to inspect Zustand store state in real-time.

---

## Common Pitfalls

1. **Map/Set in Zustand**: Use `Record` or plain objects instead
2. **Undefined in XML**: Always provide defaults with `??` operator
3. **Asymmetric serialization**: Export format must match import expectations
4. **Direct mutation**: Always create new objects in Zustand actions
5. **Missing type guards**: Validate external data before using

---

## Additional Resources

- **Docs**: `/docs/` directory (API reference, XML editor usage)
- **Skills Available**: `webapp-testing` for Playwright tasks
- **Zustand**: https://zustand.docs.pmnd.rs
- **Tailwind v4**: https://tailwindcss.com/docs
