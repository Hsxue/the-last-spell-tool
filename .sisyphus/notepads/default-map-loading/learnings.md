# parseTileMap() Implementation Learnings

## Implementation Date
2026-03-26

## TDD Flow Summary

### RED Phase
- Created 16 comprehensive tests covering:
  - Valid XML parsing with terrain and flags
  - UTF-16 LE BOM handling
  - Empty Grounds/Flags sections
  - Malformed XML handling
  - Missing required elements (Width, Height, Grounds)
  - Edge cases (whitespace, multiple flag types)

### GREEN Phase
- Implemented `parseTileMap(xmlBuffer: ArrayBuffer): MapData` function
- Used `fast-xml-parser` v5.5.9 with options: `{ ignoreAttributes: false, attributeNamePrefix: '@_' }`
- UTF-16 decoding via `TextDecoder('utf-16', { fatal: false })`
- Proper BOM detection (UTF-16 LE, BE, and UTF-8)

### REFACTOR Phase
- All 16 tests pass
- No TypeScript errors
- No ESLint errors in new files
- Clean code structure with helper functions

## Key Design Decisions

### 1. Distance Data Handling
- Ground coordinates format: `x,y,distToCity,distToMagic`
- Parser discards distance data (editor doesn't use it)
- Only stores `"x,y" -> terrainType` in MapData.terrain

### 2. Error Handling Strategy
- `MalformedXmlError`: XML parsing failures, invalid structure
- `MissingElementError`: Required elements missing (Width, Height, Grounds)
- Gracefully skips invalid coordinates rather than failing

### 3. BOM Detection Order
1. UTF-16 LE (0xFF 0xFE)
2. UTF-16 BE (0xFE 0xFF)
3. UTF-8 BOM (0xEF 0xBB 0xBF)
4. Fallback: UTF-8 → UTF-16

### 4. Reference Implementation
- Used `TileMapEditor/map_parser.py` lines 47-138 as logic reference
- Matched Python version's parsing behavior
- Maintained compatibility with existing TileMap XML format

## Test Coverage

### Valid Parsing (5 tests)
- TutorialMap_TileMap.xml structure
- Distance data discarded
- Empty ground type
- Empty Grounds section
- Empty Flags section

### BOM Handling (2 tests)
- UTF-16 LE BOM
- No BOM (raw UTF-8/UTF-16)

### Error Handling (5 tests)
- Invalid XML structure (graceful skip)
- Unclosed tags (graceful handling)
- Invalid coordinate format (skip invalid)
- Missing Grounds (throw MissingElementError)
- Missing Width/Height (throw MissingElementError)

### Edge Cases (4 tests)
- Single coordinate without pipe separator
- Multiple flag types
- Coordinates with whitespace
- Various terrain types (Crater, Dirt, Stone, Empty)

## Files Modified

### Created
- `src/lib/mapXmlImporter.test.ts` - 16 tests
- `src/lib/mapXmlImporter.ts` - Implementation (174 lines)

### Key Functions
```typescript
parseTileMap(xmlBuffer: ArrayBuffer): MapData
decodeXmlBuffer(buffer: ArrayBuffer): string
parseRequiredNumber(obj: Record<string, unknown>, key: string): number
```

## Next Steps
- Implement `parseBuildings()` function for Buildings XML parsing
- Integrate `parseTileMap()` into the map loading workflow
- Add round-trip tests (parse → export → parse)

---

# Integration Tests Implementation (2026-03-26)

## Summary

Created comprehensive integration tests for `mapXmlImporter` with **20 tests** covering:
- Round-trip serialization (parse → export → parse)
- Multiple game map parsing (TutorialMap, Lakeburg, Glenwald)
- Edge cases (empty sections, missing dimensions, whitespace handling)

## Key Findings

### 1. Export Format Mismatch (FIXED)

**Issue**: The `exportBuildingsToXml` function was exporting buildings with elements:
```xml
<Building>
  <Id>Barrels</Id>
  <X>21</X>
  <Y>12</Y>
</Building>
```

But the game format and parser expect **attributes**:
```xml
<Building Id="Barrels" X="21" Y="12" />
```

**Fix**: Updated `exportBuildingsToXml` in `mapXmlExporter.ts` to use attribute format matching the game's expected format.

### 2. UTF-16 Encoding Critical

**Issue**: Round-trip tests failed when using UTF-8 encoding because the parser expects UTF-16 LE with BOM.

**Solution**: Tests now properly encode exported XML as UTF-16 LE with BOM:
```typescript
const bom = new Uint8Array([0xFF, 0xFE]);
// Convert each character to UTF-16 LE bytes
for (let i = 0; i < xmlString.length; i++) {
  const code = xmlString.charCodeAt(i);
  utf16Bytes.push(code & 0xFF, (code >> 8) & 0xFF);
}
```

### 3. Test Fixtures Available

- `src/test/fixtures/TutorialMap_TileMap.xml` - 51x51 tutorial map
- `src/test/fixtures/TutorialMap_Buildings.xml` - Building placements
- `TextAsset/TutorialMap_TileMap/TutorialMap_TileMap` - Original game file
- `TextAsset/Lakeburg_TileMap/Lakeburg_TileMap` - Lakeburg map
- `TextAsset/Glenwald_TileMap/Glenwald_TileMap` - Glenwald map

## Test Coverage

### Round-trip Tests (3 tests)
- Building data preservation through export/parse cycle
- Terrain data structure validation
- Map dimension preservation

### Multiple Game Maps (4 tests)
- TutorialMap parsing (51x51)
- TutorialMap buildings parsing (with MagicCircle verification)
- Lakeburg map from TextAsset (with skip if not found)
- Glenwald map from TextAsset (with skip if not found)

### Edge Cases (9 tests)
- Empty Grounds section → empty terrain map
- Empty Flags section → empty flags map
- Missing Width → throws MissingElementError
- Missing Height → throws MissingElementError
- Missing TileMap root → throws MalformedXmlError
- Missing Grounds → throws MissingElementError
- Whitespace in coordinates → handled gracefully
- Empty Buildings → empty array
- Malformed XML → graceful handling

### Additional Integration Tests (4 tests)
- Large coordinate values (99,99)
- Multiple terrain types in same map
- Building with Health attribute
- Building without Health attribute

## Files Modified

1. **Created**: `src/lib/mapXmlImporter.integration.test.ts` (428 lines, 20 tests)
2. **Modified**: `src/lib/mapXmlExporter.ts` (exportBuildingsToXml function - attribute format)

## Verification

✅ All 20 tests pass: `npm test -- src/lib/mapXmlImporter.integration.test.ts`
✅ TypeScript compiles cleanly: `npx tsc --noEmit`
✅ No lint errors introduced

## Notes

- Tests handle missing TextAsset files gracefully (skip with console.log)
- UTF-16 encoding is critical for parser compatibility
- Export format must match game's expected attribute-based format
- Health element is optional and should only be included when >= 0
