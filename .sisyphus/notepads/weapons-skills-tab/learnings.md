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

## XML Parser Implementation (Task 5) - Wed Mar 18 2026

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

- WeaponTreeView was created with Card/ScrollArea/Button pattern
- SkillTreeView was created following the same pattern as WeaponTreeView, organizing skills by category (MeleeWeapons, RangeWeapons, MagicWeapons, General)
- Both tree views use expandable/collapsible sections with SVG icons for better UX
- Proper import path adjustments were needed to reference the weaponSkillStore correctly from components/weapon-skill directory

## WeaponSkillTab Component Creation - Wed Mar 18 2026

### Implementation Details

1. **Component Structure**:
   - Created WeaponSkillTab functional component with tabbed interface
   - Implemented useState hook to manage active tab between 'weapons' and 'skills'
   - Used conditional rendering to show appropriate tree view based on active tab

2. **Layout Design**:
   - Used flexbox for vertical layout (`flex flex-col h-full`)
   - Created tab header with border-bottom separator
   - Implemented grid layout with `grid-cols-2` for split panel design
   - Added vertical border (`border-r`) to separate tree view from editor

3. **Styling**:
   - Applied Tailwind CSS classes for consistent tab styling
   - Active tab has blue bottom border and blue text color
   - Inactive tabs have gray text with hover effect
   - Used padding (`px-4 py-2`) and text size (`text-sm`) for tab elements

4. **Conditional Rendering**:
   - Used ternary operator to conditionally render WeaponTreeView or SkillTreeView
   - Each tab shows corresponding tree view in left panel and placeholder text in right panel
   - Placeholder text indicates upcoming editor functionality

5. **Component Integration**:
   - Imported WeaponTreeView and SkillTreeView components
   - Removed unused store import (useWeaponSkillStore) after discovering it wasn't needed
   - Ensured proper path resolution for imports

6. **Type Safety**:
   - Defined TabType type as union of 'weapons' | 'skills'
   - Used proper TypeScript typing for useState hook

7. **Build Verification**:
   - Component successfully compiles with `npm run build`
   - No TypeScript or import errors after corrections

### Key Learnings

1. **Component Modularity**: Tab component effectively separates concerns by using dedicated tree view components for weapons and skills
2. **Responsive Layout**: Grid and flexbox combination creates effective split-panel interface
3. **Conditional UI Logic**: Properly implemented tab switching with state management
4. **Import Management**: Importance of verifying import paths and removing unused imports
5. **Placeholder Strategy**: Using temporary text content ("coming soon") for future components

### Files Created
- `src/components/weapon-skill/WeaponSkillTab.tsx`

### Component Structure
```tsx
<WeaponSkillTab>
  <TabHeader>
    <WeaponsTabButton />
    <SkillsTabButton />
  </TabHeader>
  <TabContent>
    <LeftPanel> {/* Tree View */ }
      <WeaponTreeView /> or <SkillTreeView />
    </LeftPanel>
    <RightPanel> {/* Editor (future) */ }
      <PlaceholderText />
    </RightPanel>
  </TabContent>
</WeaponSkillTab>
```

## WeaponEditor Component Creation - Wed Mar 18 2026

### Implementation Details

1. **Component Structure**:
   - Created WeaponEditor functional component to display weapon details
   - Used useWeaponSkillStore hook to access selected weapon data
   - Implemented conditional rendering based on whether a weapon is selected

2. **Store Integration**:
   - Connected to useWeaponSkillStore to access state.weapons and state.selectedWeaponId
   - Created a selector function to find the selected weapon by ID
   - Handled case where no weapon is selected with informative message

3. **UI Elements**:
   - Displayed weapon ID as heading with category information
   - Added placeholder content indicating upcoming features for Tasks 10-11
   - Listed planned features: Basic info form, Level configuration, Stat bonuses editor, Skills assignment

4. **Import Path Correction**:
   - Initially had incorrect import path ('../store/weaponSkillStore')
   - Corrected to proper path ('../../store/weaponSkillStore') after identifying the actual file location
   - Verified the correct path by checking the store directory contents

5. **Build Verification**:
   - Component successfully compiles with `npm run build`
   - Fixed import path resolved TypeScript error about missing module

### Key Learnings

- Proper import path resolution is crucial for component compilation
- Store hooks (useWeaponSkillStore) provide centralized state management
- Conditional rendering handles different UI states (weapon selected vs none selected)
- Placeholder content helps plan future development tasks
- Component follows the same pattern as other editors in the application

### Files Created
- `src/components/weapon-skill/WeaponEditor.tsx`

### Component Structure
```tsx
<WeaponEditor>
  <ConditionalDisplay>
    <NoWeaponSelectedMessage />
    <WeaponDetailsDisplay>
      <WeaponHeader />
      <PlannedFeaturesList />
    </WeaponDetailsDisplay>
  </ConditionalDisplay>
</WeaponEditor>
```

## Wave 2 Components Creation - Wed Mar 18 2026

### Implementation Details

Created three components for the next wave of features:

1. **WeaponLevelForm**:
   - Uses useWeaponSkillStore to access selected weapon
   - Displays placeholder content for level configuration (Task 11)
   - Shows informative message when no weapon is selected
   - Located at `src/components/weapon-skill/WeaponLevelForm.tsx`

2. **SkillEditor**:
   - Connects to useWeaponSkillStore to access selected skill
   - Renders skill ID as heading and placeholder for editor functionality (Task 12)
   - Displays "Select a skill first" when no skill is selected
   - Located at `src/components/weapon-skill/SkillEditor.tsx`

3. **SkillBasicInfoForm**:
   - Simple form component for skill basic information (Task 13)
   - Contains placeholder content indicating upcoming functionality
   - Located at `src/components/weapon-skill/SkillBasicInfoForm.tsx`

### Key Learnings

- Created all three Wave 2 components as specified
- Each component follows the same pattern of using useWeaponSkillStore hook
- Proper conditional rendering when no item is selected
- All components successfully compile with `npm run build`
- Consistent styling approach using Tailwind CSS classes
- Components are ready for future implementation of actual functionality

### Files Created
- `src/components/weapon-skill/WeaponLevelForm.tsx`
- `src/components/weapon-skill/SkillEditor.tsx`
- `src/components/weapon-skill/SkillBasicInfoForm.tsx`

### Component Structure
```tsx
<WeaponLevelForm>
  <ConditionalDisplay>
    <NoWeaponSelectedMessage />
    <LevelConfigurationContent>
      <Heading />
      <PlaceholderText />
    </LevelConfigurationContent>
  </ConditionalDisplay>
</WeaponLevelForm>

<SkillEditor>
  <ConditionalDisplay>
    <NoSkillSelectedMessage />
    <SkillEditorContent>
      <SkillHeading />
      <PlaceholderText />
    </SkillEditorContent>
  </ConditionalDisplay>
</SkillEditor>

<SkillBasicInfoForm>
  <BasicInfoContent>
    <Heading />
    <PlaceholderText />
  </BasicInfoContent>
</SkillBasicInfoForm>
```

## CostsAndRangeForm Component Creation - Wed Mar 18 2026

### Implementation Details

1. **Component Structure**:
   - Created CostsAndRangeForm functional component for skill cost and range configuration
   - Used useWeaponSkillStore hook to access selected skill data
   - Implemented conditional rendering based on whether a skill is selected

2. **Store Integration**:
   - Connected to useWeaponSkillStore to access state.skills and state.selectedSkillId
   - Created a selector function to find the selected skill by ID
   - Handled case where no skill is selected with informative message

3. **UI Elements**:
   - Created form sections for Costs (AP Cost, Mana Cost, Health Cost, Uses/Turn)
   - Created form section for Range (Min and Max values)
   - Used grid layout (grid-cols-2) for organized form fields
   - Utilized Input and Label components from UI library with text-xs sizing
   - Added default values from selected skill properties with fallbacks

4. **Import Path Correction**:
   - Initially had incorrect import path ('@/components/ui')
   - Corrected to relative path ('../ui') after verifying the actual file structure
   - Verified that Input and Label components are properly exported from the UI index file

5. **Build Verification**:
   - Component successfully compiles with `npm run build`
   - Fixed import path resolved TypeScript error about missing module
   - Component follows consistent styling approach with other forms in the application

### Key Learnings

- Proper import path resolution is essential for component compilation
- Form components should include appropriate default values from data models
- Grid layouts (grid-cols-2) provide good organization for form fields
- Conditional rendering handles different UI states when no item is selected
- Using text-xs sizing keeps forms compact and aligned with UI design
- Consistent use of UI components (Input, Label) maintains visual coherence

### Files Created
- `src/components/weapon-skill/CostsAndRangeForm.tsx`

### Component Structure
```tsx
<CostsAndRangeForm>
  <ConditionalDisplay>
    <NoSkillSelectedMessage />
    <FormContent>
      <CostsSection>
        <APCostInput />
        <ManaCostInput />
        <HealthCostInput />
        <UsesPerTurnInput />
      </CostsSection>
      <RangeSection>
        <MinRangeInput />
        <MaxRangeInput />
      </RangeSection>
    </FormContent>
  </ConditionalDisplay>
</CostsAndRangeForm>
```