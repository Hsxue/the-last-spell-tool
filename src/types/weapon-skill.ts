/**
 * Weapon and Skill Types
 * Based on tilemap-editor-feature-doc.md weapon/skill system
 */

// ============================================================================
// Weapon Types
// ============================================================================

export type WeaponCategory =
  | 'MeleeWeapon'
  | 'RangeWeapon'
  | 'MagicWeapon';

export type WeaponHands = 'OneHand' | 'TwoHands' | 'OffHand';

export interface WeaponLevel {
  /** Base damage range (Min, Max) */
  baseDamage: [number, number];
  /** Base price */
  basePrice: number;
  /** Base stat bonuses: statName -> value */
  baseStatBonuses: Map<string, number>;
  /** Skill IDs associated with this level */
  skills: string[];
}

export interface WeaponDefinition {
  /** Weapon ID */
  id: string;
  /** Weapon category */
  category: WeaponCategory;
  /** Hand requirements */
  hands: WeaponHands;
  /** Tags (e.g., Sword, Axe) */
  tags: string[];
  /** Level variations: level -> WeaponLevel (use Record for better Zustand compatibility) */
  levelVariations: Record<number, WeaponLevel>;
}

// ============================================================================
// Skill Types
// ============================================================================

export type SkillCategory =
  | 'MeleeWeapons'
  | 'RangedWeapons'
  | 'MagicWeapons'
  | 'Usables'
  | 'Buildings'
  | 'Other';

export interface SkillRange {
  /** Minimum range */
  min: number;
  /** Maximum range */
  max: number;
  /** Only cardinal directions */
  cardinalDirectionOnly: boolean;
  /** Range is modifiable */
  modifiable: boolean;
}

export interface SkillTarget {
  /** Valid target types */
  validTargets: string[];
  /** Affected unit types */
  affectedUnits: string[];
}

export interface AreaOfEffect {
  /** Origin X offset */
  originX: number;
  /** Origin Y offset */
  originY: number;
  /** Effect pattern */
  pattern: string;
}

export interface AttackAction {
  /** Attack type */
  attackType: 'Physical' | 'Magical' | 'Ranged';
  /** Base damage range */
  baseDamage: [number, number];
  /** Damage multiplier */
  damageMultiplier: number;
  /** Critical chance */
  criticalChance: number;
  /** Effect flags */
  effects: {
    follow: boolean;
    maneuver: boolean;
    multiHit: boolean;
    armorPiercing: boolean;
  };
}

export interface GenericAction {
  /** Action type */
  actionType: string;
  /** Effect parameters */
  parameters: Map<string, unknown>;
}

export interface CastFX {
  /** Visual effect ID */
  vfx: string;
  /** Sound effect ID */
  sound: string;
  /** Camera shake intensity */
  camShake: number;
  /** Caster animation */
  casterAnim: string;
}

export interface SkillConditions {
  /** Required game phase */
  phase?: string;
  /** Target must be in range */
  targetInRange?: boolean;
  /** Must be in watchtower */
  inWatchtower?: boolean;
}

export interface SkillDefinition {
  /** Skill ID */
  id: string;
  /** Description text */
  description: string;
  /** Icon path */
  iconPath: string;
  /** Template ID */
  templateId: string;
  
  // Costs
  actionPointsCost: number;
  manaCost: number;
  healthCost: number;
  usesPerTurnCount: number;
  
  // Range and targeting
  skillRange: SkillRange;
  skillTarget: SkillTarget;
  areaOfEffect: AreaOfEffect;
  
  // Action (one of these)
  attackAction?: AttackAction;
  genericAction?: GenericAction;
  
  // Visual and audio
  castFx: CastFX;
  
  // Conditions
  conditions: SkillConditions;
  
  /** Skill category */
  category: SkillCategory;
}

// ============================================================================
// Effect Types
// ============================================================================

export type EffectType =
  | 'MomentumEffect'
  | 'MultiHitEffect'
  | 'PropagationEffect'
  | 'ArmorShreddingEffect'
  | 'RegenStatEffect'
  | 'BuffEffect'
  | 'DebuffEffect'
  | 'PoisonEffect'
  | 'StunEffect'
  | 'RemoveStatusEffect';

export interface EffectDefinition {
  type: EffectType;
  parameters: Record<string, unknown>;
}

// ============================================================================
// Weapon/Skill UI State
// ============================================================================

export type WeaponSkillView = 'weapons' | 'skills';

export type SupportedLanguage =
  | 'English'
  | 'Français'
  | '简体中文'
  | '日本語'
  | 'Deutsch'
  | 'Español';

export interface WeaponSkillUIState {
  /** Current view (weapons or skills) */
  currentView: WeaponSkillView;
  /** Selected language for localization */
  selectedLanguage: SupportedLanguage;
  /** Selected weapon ID */
  selectedWeaponId: string | null;
  /** Selected skill ID */
  selectedSkillId: string | null;
  /** Selected weapon level being edited */
  editingWeaponLevel: number | null;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
}

// ============================================================================
// Localization
// ============================================================================

export interface LocalizationData {
  /** Translations: key -> {language -> text} */
  translations: Map<string, Map<SupportedLanguage, string>>;
}

/** TextAsset/Loc_TLS format interface */
export interface TranslationFileFormat {
  key: string;
  en?: string;  // English (fallback)
  fr?: string;  // Français
  zh?: string;  // 简体中文
  ja?: string;  // 日本語
  de?: string;  // Deutsch
  es?: string;  // Español
}

/** TextAsset/Loc_TLS format interface */
export interface TranslationFileFormat {
  key: string;
  en?: string;  // English (fallback)
  fr?: string;  // Français
  zh?: string;  // 简体中文
  ja?: string;  // 日本語
  de?: string;  // Deutsch
  es?: string;  // Español
}
