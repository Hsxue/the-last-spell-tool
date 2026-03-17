# Draft: Terrain Rendering Optimization

**Plan Location**: `.sisyphus/plans/terrain-optimization.md`
**Working Directory**: `E:\SteamLibrary\steamapps\common\The Last Spell\export\WebDev2`

## Current Implementation Analysis

### Project Stack
- **Framework**: React 19 + Vite
- **Canvas Library**: Konva 10.2.1 + react-konva 19.2.3
- **State Management**: Zustand
- **Map Size**: 51x51 tiles (2601 max tiles)
- **Tile Size**: 20px

### Current Architecture

**File Structure**:
- `src/components/canvas/MapCanvas.tsx` - Main stage container
- `src/components/canvas/TerrainLayer.tsx` - Terrain rendering (397 lines)
- `src/components/canvas/GridLayer.tsx` - Grid lines
- `src/components/canvas/BuildingLayer.tsx` - Building rendering
- `src/components/canvas/FlagLayer.tsx` - Flag markers
- `src/types/map.ts` - Type definitions
- `src/store/mapStore.ts` - State management

### Current Terrain Rendering Approach

**Two-Layer Architecture**:
1. **Static Layer**: `terrainElements` - Renders all terrain from store
   - Uses `useMemo` to cache React elements
   - `useEffect` triggers cache update when `terrainData` changes
   - Ref: `staticTerrainRef`

2. **Dynamic Layer**: `pendingElements` - Renders pending terrain during drawing
   - Shows preview before committing to store
   - Throttled cache updates (100ms interval)
   - Ref: `dynamicTerrainRef`

**Current Optimizations Already Applied**:
- ✅ `perfectDrawEnabled={false}` on all rects
- ✅ `listening={false}` on terrain tiles
- ✅ `hitStrokeWidth={0}` to skip hit detection
- ✅ `stroke={undefined}` and `strokeWidth={0}`
- ✅ Caching with `cache()` on groups
- ✅ `batchDraw()` on layer
- ✅ Throttled cache updates (100ms)
- ✅ `useMemo` for element generation
- ✅ RequestAnimationFrame for cache updates

### Identified Performance Issues

| Issue | Impact | Severity |
|-------|--------|----------|
| **No viewport culling** | Renders ALL 2601 tiles even when only 100 visible | HIGH |
| **No batchDraw() for clear/add cycles** | React render cycle overhead | MEDIUM |
| **Individual Rect per tile** | 2601 React components, 2601 Konva Shape objects | MEDIUM |
| **No sprite sheet approach** | Using solid colors (acceptable for current use case) | LOW |
| **Cache rebuilds on every change** | clearCache() + cache() is expensive | MEDIUM |
| **imageSmoothingEnabled not set** | Minor anti-aliasing artifacts | LOW |

### Key Files to Modify

1. **`TerrainLayer.tsx`** - Main optimization target
   - Add viewport-based culling
   - Optimize cache strategy
   - Consider single-canvas approach for static terrain

2. **`MapCanvas.tsx`** - May need layer configuration updates
   - Add `imageSmoothingEnabled: false`
   - Configure layer for batch rendering

3. **`mapStore.ts`** (optional) - If we need visible viewport tracking

## Optimization Strategies to Consider

### Option A: Viewport Culling (Recommended, Minimal Changes)
- Calculate visible tile range from viewport state
- Only render tiles within visible area + buffer
- Keep existing React component structure
- **Effort**: Low-Medium
- **Expected Gain**: 10-20x fewer objects rendered

### Option B: Single Canvas Static Layer (Aggressive)
- Render static terrain to offscreen canvas
- Use Konva.Image to display cached terrain
- Only update when terrain actually changes
- **Effort**: Medium-High
- **Expected Gain**: 50-100x fewer draw calls

### Option C: Hybrid Approach (Best of Both)
- Viewport culling for dynamic layer
- Single canvas for static layer
- **Effort**: Medium
- **Expected Gain**: Maximum performance

## Recommended Approach: Option A + Cache Optimization

**Rationale**:
1. Viewport culling gives biggest bang for buck
2. Existing code structure is already well-organized
3. Preserves React component model
4. Can implement incrementally
5. Low risk of breaking existing functionality

**Specific Changes**:
1. Calculate visible tile bounds from `viewport.offsetX/Y` + `viewport.zoom`
2. Filter `terrainElements` to only visible + buffer zone
3. Optimize cache invalidation strategy
4. Add `imageSmoothingEnabled: false` to layers
5. Consider batchDraw() for batch updates

## Open Questions

1. Should we add visual tile brush preview (highlight tiles under cursor)?
2. What's the expected max map size? (currently 51x51)
3. Do we need smooth zoom transitions or is snap-zoom acceptable?
4. Should we add layer visibility toggle for terrain layer?

## References from Konva Best Practices

- Use `batchDraw()` instead of `draw()` for multiple updates
- Disable `listening` on non-interactive objects ✅ (already done)
- Use `cache()` on static content ✅ (already done)
- Set `imageSmoothingEnabled: false` for pixel art
- Use viewport culling for large grids
- Consider `transformsEnabled: 'position'` for position-only changes
- Set `pixelRatio: 1` to avoid over-rendering on high DPI

## Decisions Needed

1. **Viewport culling buffer size**: How many tiles beyond viewport to render? (recommend: 2-3 tiles)
2. **Cache strategy**: Keep throttled cache or use different approach?
3. **Test scenario**: Should we create a large map (>2000 tiles) for performance testing?
