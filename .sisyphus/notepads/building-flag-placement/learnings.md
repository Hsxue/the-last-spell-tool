# Learnings - Building Flag Placement

## Codebase Conventions
- Zustand store with Immer middleware for mutable syntax
- React-Konva for canvas rendering with caching
- Viewport culling pattern in TerrainLayer.tsx
- Two-layer rendering: static (store) + dynamic (pending)
- Tile size: 20px constant
- Map default: 51x51

## Building Data
- Source: `E:/SteamLibrary/steamapps/common/The Last Spell/export/TextAsset/BuildingDefinitions.txt`
- Format: XML with `<BuildingDefinition Id="...">` containing `<Tiles OriginX="..." OriginY="...">`
- Total: 141 buildings in source file
- Categories: Obstacle (50), None (11), Turret (8), LitBrazier (8), Wall (5), etc.
- Tile characters: B (building block)

## Store Pattern
- All mutations use `set((state) => { state.xxx = yyy })` Immer pattern
- Selectors are curried functions: `export const selectX = (param) => (state) => value`
- Map data uses Map<string, T> collections for sparse data

## Rendering Pattern
- Use `useMemo` for element arrays
- Use `useRef` for Konva node references
- Cache with `requestAnimationFrame` timing
- Separate static/dynamic layers for performance
