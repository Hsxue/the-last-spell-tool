## WeaponSkillStore Creation - Wed Mar 18 2026

### State Design Decisions

1. **Pattern Consistency**: Followed `mapStore.ts` pattern exactly:
   - Zustand + Immer middleware for immutable state updates
   - State interface separated from actions
   - Default state object for initial values
   - Selectors exported as standalone functions

2. **State Properties**:
   - `currentView`: Controls weapons vs skills tab visibility
   - `selectedWeaponId` / `selectedSkillId`: Track active selection in each view
   - `editingWeaponLevel`: Tracks which weapon level is being edited (null when not editing)
   - `weapons`: Array of WeaponDefinition objects
   - `skills`: Array of SkillDefinition objects
   - `hasUnsavedChanges`: Flag for tracking pending changes (file-based persistence only)
   - `errors`: Error message collection (following mapStore pattern)

3. **Action Design**:
   - All mutations use Immer pattern: `state.property = value`
   - Data mutations (add/update/remove) automatically set `hasUnsavedChanges = true`
   - Remove actions clear associated selected ID if matching
   - Simple setters for view state (no unsaved changes flag)

4. **Selectors**:
   - `selectWeaponById(id)`: Returns weapon or null
   - `selectSkillById(id)`: Returns skill or null
   - `selectWeaponsByCategory(category)`: Filters by weapon category
   - `selectSkillsByCategory(category)`: Filters by skill category
   - `selectSelectedWeapon`: Convenience selector for currently selected weapon
   - `selectSelectedSkill`: Convenience selector for currently selected skill

5. **Type Safety**:
   - All state typed from `src/types/weapon-skill.ts`
   - WeaponCategory and SkillCategory used for filtering
   - WeaponSkillView type for view state

### Key Differences from MapStore

- No complex nested data structures (Map objects) - using simple arrays for weapons/skills
- No viewport or layer visibility state (not applicable to weapon/skill editing)
- Simpler mutation patterns (no terrain/ building position-based operations)

## Localization Implementation - Wed Mar 18 2026

### Implementation Details

1. **Structure**:
   - Created localization.ts utility with support for 6 languages: English, Français, 简体中文, 日本語, Deutsch, Español
   - Implemented loadLocalization() to parse translation files in TextAsset/Loc_TLS format
   - Implemented getTranslation() with fallback to English for missing translations
   - Used Map<string, Map<SupportedLanguage, string>> structure for efficient lookup

2. **TextAsset/Loc_TLS Format**:
   - Designed to handle the expected JSON structure with standardized ISO language codes (en, fr, zh, ja, de, es)
   - Properly mapped these codes to the full language names in SupportedLanguage type

3. **Fallback Logic**:
   - Primary strategy: requested language -> English fallback -> first available translation
   - Handles missing translations gracefully with appropriate fallbacks
   - Always guarantees some translation is returned (or empty string if completely missing)

4. **Technical Implementation**:
   - Proper TypeScript import syntax with type-only imports
   - Efficient iteration over Map objects
   - Proper error handling for missing keys and translations
   - Type checking with supported languages from weapon-skill.ts types

## XML Parser Implementation (Task 5) - $(date)

### XML Structure Decisions

**Weapon XML Format:**
```xml
<?xml version="1.0" encoding="utf-16"?>
<Weapons>
  <Weapon>
    <Id>weapon_id</Id>
    <Category>MeleeWeapon</Category>
    <Hands>OneHand</Hands>
    <Tags>
      <Tag>Sword</Tag>
      <Tag>Steel</Tag>
    </Tags>
    <LevelVariations>
      <Level>
        <Level>1</Level>
        <BaseDamage>
          <Min>10</Min>
          <Max>20</Max>
        </BaseDamage>
        <BasePrice>100</BasePrice>
        <BaseStatBonuses>
          <StatName>Strength</StatName>
          <Value>5</Value>
        </BaseStatBonuses>
        <Skills>
          <Skill>skill_id_1</Skill>
          <Skill>skill_id_2</Skill>
        </Skills>
      </Level>
    </LevelVariations>
  </Weapon>
</Weapons>
```

**Skill XML Format:**
```xml
<?xml version="1.0" encoding="utf-16"?>
<Skills>
  <Skill>
    <Id>skill_id</Id>
    <Description>Skill description</Description>
    <IconPath>path/to/icon</IconPath>
    <TemplateId>template_id</TemplateId>
    <ActionPointsCost>3</ActionPointsCost>
    <ManaCost>10</ManaCost>
    <HealthCost>0</HealthCost>
    <UsesPerTurnCount>1</UsesPerTurnCount>
    <Category>MeleeWeapons</Category>
    <SkillRange>
      <Min>1</Min>
      <Max>5</Max>
      <CardinalDirectionOnly>false</CardinalDirectionOnly>
      <Modifiable>true</Modifiable>
    </SkillRange>
    <SkillTarget>
      <ValidTargets>
        <Target>Enemy</Target>
      </ValidTargets>
      <AffectedUnits>
        <Unit>Single</Unit>
      </AffectedUnits>
    </SkillTarget>
    <AreaOfEffect>
      <OriginX>0</OriginX>
      <OriginY>0</OriginY>
      <Pattern>cross</Pattern>
    </AreaOfEffect>
    <AttackAction>
      <AttackType>Physical</AttackType>
      <BaseDamageMin>15</BaseDamageMin>
      <BaseDamageMax>25</BaseDamageMax>
      <DamageMultiplier>1.5</DamageMultiplier>
      <CriticalChance>10</CriticalChance>
      <Follow>false</Follow>
      <Maneuver>false</Maneuver>
      <MultiHit>true</MultiHit>
      <ArmorPiercing>false</ArmorPiercing>
    </AttackAction>
    <CastFX>
      <VFX>fire_burst</VFX>
      <Sound>cast_fire</Sound>
      <CamShake>0.5</CamShake>
      <CasterAnim>attack_slash</CasterAnim>
    </CastFX>
    <Conditions>
      <Phase>Combat</Phase>
      <TargetInRange>true</TargetInRange>
      <InWatchtower>false</InWatchtower>
    </Conditions>
  </Skill>
</Skills>
```

### Encoding Handling

**UTF-16 LE with BOM:**
- Export always includes BOM (FF FE bytes) at the start
- Import detects BOM and handles UTF-16 LE, UTF-16 BE, and UTF-8
- Game requires UTF-16 LE encoding for proper character display

**BOM Detection Logic:**
1. Check for FF FE (UTF-16 LE)
2. Check for FE FF (UTF-16 BE)
3. Check for EF BB BF (UTF-8)
4. Default to UTF-16 LE if no BOM found

### fast-xml-parser Configuration

**Parser Options:**
- `ignoreAttributes: false` - Process attributes
- `parseTagValue: true` - Convert numeric strings to numbers
- `isArray` callback - Handle arrays for Tags, Skills, LevelVariations, etc.

**Builder Options:**
- `format: true` - Pretty print XML
- `indentBy: '  '` - Two-space indentation
- `suppressEmptyNode: false` - Keep empty nodes for game compatibility

### Type Mapping

**Maps Handling:**
- `Map<number, WeaponLevel>` → Array of level objects with Level property
- `Map<string, number>` (stat bonuses) → Array of {StatName, Value} objects
- `Map<string, unknown>` (generic parameters) → Array of {Key, Value} objects

**Tuples:**
- `[number, number]` (base damage) → {Min, Max} object

### Lessons Learned

1. **Iteration with older TypeScript targets**: Use `Array.from()` or `.forEach()` instead of `for...of` with Map iterators to avoid `--downlevelIteration` requirement.

2. **XMLParser isArray callback**: The callback signature uses `unknown` for jpath parameter in fast-xml-parser v5, not `string`.

3. **XMLBuilder arrayNodeName**: This option expects a string, not a function. Handle array naming in the data structure instead.

4. **UTF-16 encoding in browser**: Manually encode to UTF-16 LE by extracting low/high bytes from char codes for proper game compatibility.

5. **Round-trip testing**: Essential for verifying parse → export → parse produces identical data structure.

### Files Created

- `src/lib/xml/weapon-xml-parser.ts` - Weapon XML parsing/export
- `src/lib/xml/skill-xml-parser.ts` - Skill XML parsing/export

### Exports

**Weapon Parser:**
- `parseWeapons(xmlString: string): WeaponDefinition[]`
- `parseWeaponsFromBuffer(buffer: ArrayBuffer): WeaponDefinition[]`
- `exportWeapons(weapons: WeaponDefinition[]): string`
- `exportWeaponsToBuffer(weapons: WeaponDefinition[]): Uint8Array`
- `roundTripTest(weapons: WeaponDefinition[]): boolean`

**Skill Parser:**
- `parseSkills(xmlString: string): SkillDefinition[]`
- `parseSkillsFromBuffer(buffer: ArrayBuffer): SkillDefinition[]`
- `exportSkills(skills: SkillDefinition[]): string`
- `exportSkillsToBuffer(skills: SkillDefinition[]): Uint8Array`
- `roundTripTest(skills: SkillDefinition[]): boolean`

## Select Component Creation (Wed Mar 18 2026)

### Implementation Details

1. **Pattern Consistency**: Followed the shadcn/ui pattern exactly as seen in the Button component:
   - Used cva (class-variance-authority) for variant management
   - Implemented variants: default, outline, ghost
   - Implemented sizes: default, sm, lg
   - Used cn() utility for class name merging

2. **Component Structure**:
   - Applied forwardRef pattern for proper ref forwarding
   - Created selectVariants using cva with proper base classes
   - Extended Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> to avoid conflicts
   - Implemented proper displayName: 'Select'

3. **Conflict Resolution**:
   - Handled conflicting 'size' property from React's SelectHTMLAttributes and our variants by using Omit
   - This prevents TypeScript errors when both the HTML attribute and variant prop have the same name

4. **Tailwind Classes**:
   - Included proper styling: borders, backgrounds, transitions, focus states
   - Added accessibility support: focus-visible states, disabled states
   - Applied consistent sizing with padding and height properties

5. **Export Strategy**:
   - Exported both the Select component and selectVariants for flexibility
   - Updated index.ts to match current component availability status
   
### Key Learnings

- Created Select component following shadcn/ui patterns similar to Button component
- Used cva (class-variance-authority) for variant management with default, outline, and ghost variants
- Implemented size variants: default, sm, lg
- Used forwardRef pattern for proper ref forwarding
- Handled conflicting 'size' property by using Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>
- Used cn() utility for class name merging
- Component supports all standard select HTML attributes
- Successfully verified compilation with npm run build

# Learnings

## Checkbox Component Implementation
- Created `src/components/ui/checkbox.tsx` following the same pattern as `input.tsx`
- Used React.forwardRef for proper ref forwarding
- Used the `cn()` utility for class name merging 
- Applied Tailwind classes specific for checkbox styling
- Extended React.InputHTMLAttributes<HTMLInputElement> for standard checkbox properties
- No external dependency needed, uses native input with custom styling

## ForwardRef Pattern
- Followed the same forwardRef pattern as seen in `input.tsx`
- Destructured props to separate component-specific props (className) from rest of props
- Spread remaining props onto the input element with `{...props}`
- Set displayName for better debugging

## Component Architecture
- Each UI component lives in individual file under src/components/ui/
- Consistent type definitions extending InputHTMLAttributes
- Shared cn utility for Tailwind class composition

- Created Textarea component following the same pattern as Input component
- Used React.forwardRef pattern consistently with other UI components
- Applied the same styling classes as Input but adapted slightly for textarea-specific needs
- Used the cn() utility for class name merging following the established convention

- Created Label component following the same forwardRef pattern as the Input component
- Used React.forwardRef with proper typing for HTMLLabelElement
- Implemented the cn() utility for class name merging
- Applied appropriate Tailwind classes for label styling
- Used standard React.LabelHTMLAttributes for proper label HTML attribute support
- Component builds successfully without any dependency issues

- Created ScrollArea component without Radix UI as requested
- Used overflow-y: auto for proper scrolling behavior
- Followed existing component patterns with the cn() utility for Tailwind class merging
- Component compiled successfully with npm run build

- Created a card component with sub-components (Card, CardHeader, CardTitle, CardContent) following shadcn/ui patterns
- Used React.forwardRef for proper ref handling
- Applied Tailwind CSS classes via the cn() utility for consistent styling
- Each sub-component has proper displayName for debugging purposes
- The component follows the compound component pattern commonly used in UI libraries

## Learnings from Slider Component Creation

- Used the existing Input component pattern as reference for structure
- Implemented forwardRef to allow referencing the underlying input element
- Utilized the cn() utility from src/lib/utils for Tailwind CSS class merging
- Used native HTML input type="range" for the slider functionality
- Kept the component simple with standard HTML slider properties (min, max, step)
- Followed the same naming convention and display name pattern as other components
- Ensured the component accepts additional HTML input attributes via spread operator
- Verified successful compilation with npm run build