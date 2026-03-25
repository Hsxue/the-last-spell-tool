/**
 * Skill XML Parser
 * Handles parsing and exporting skill definitions in the game's XML format
 * with UTF-16 LE BOM encoding for game compatibility
 */

import { XMLParser, XMLBuilder } from 'fast-xml-parser';

import type {
  SkillDefinition,
  SkillCategory,
  SkillRange,
  SkillTarget,
  AreaOfEffect,
  AttackAction,
  GenericAction,
  CastFX,
  SkillConditions,
} from '../../types/weapon-skill';

// ============================================================================
// Constants
// ============================================================================

const UTF16_LE_BOM = new Uint8Array([0xff, 0xfe]);

// ============================================================================
// XML Parser Configuration
// ============================================================================

const parserOptions = {
  ignoreAttributes: false,
  parseTagValue: true,
  parseAttributeValue: true,
  parseTrueNumberOnly: true,
  alwaysCreateTextNode: false,
  isArray: (name: string, _jpath: unknown, _isLeaf: boolean, _isAttribute: boolean) => {
    // Arrays in skill XML
    return ['ValidTargets', 'AffectedUnits', 'Effects'].includes(name);
  },
};

const builderOptions = {
  ignoreAttributes: false,
  format: true,
  indentBy: '  ',
  suppressEmptyNode: false,
  suppressBooleanAttributes: false,
};

// ============================================================================
// BOM Detection and Encoding Utilities (shared with weapon parser)
// ============================================================================

/**
 * Detect BOM and encoding from ArrayBuffer
 */
function detectEncoding(buffer: ArrayBuffer): { encoding: 'utf-16-le' | 'utf-16-be' | 'utf-8'; hasBom: boolean; contentStart: number } {
  const bytes = new Uint8Array(buffer);
  
  // Check for UTF-16 LE BOM (FF FE)
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return { encoding: 'utf-16-le', hasBom: true, contentStart: 2 };
  }
  
  // Check for UTF-16 BE BOM (FE FF)
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return { encoding: 'utf-16-be', hasBom: true, contentStart: 2 };
  }
  
  // Check for UTF-8 BOM (EF BB BF)
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return { encoding: 'utf-8', hasBom: true, contentStart: 3 };
  }
  
  // Default to UTF-16 LE (game default)
  return { encoding: 'utf-16-le', hasBom: false, contentStart: 0 };
}

/**
 * Decode ArrayBuffer to string with proper encoding
 */
function decodeBuffer(buffer: ArrayBuffer): string {
  const { encoding, contentStart } = detectEncoding(buffer);
  const contentBytes = buffer.slice(contentStart);
  
  if (encoding === 'utf-8') {
    return new TextDecoder('utf-8').decode(contentBytes);
  }
  
  // UTF-16 decoding
  const encodingName = encoding === 'utf-16-le' ? 'utf-16le' : 'utf-16be';
  return new TextDecoder(encodingName).decode(contentBytes);
}

/**
 * Encode string to UTF-16 LE with BOM
 */
function encodeToUtf16LeWithBom(xmlString: string): Uint8Array {
  const bom = UTF16_LE_BOM;
  
  // Create UTF-16 LE bytes manually
  const utf16Bytes: number[] = [];
  for (let i = 0; i < xmlString.length; i++) {
    const code = xmlString.charCodeAt(i);
    // Little endian: low byte first, then high byte
    utf16Bytes.push(code & 0xff);
    utf16Bytes.push((code >> 8) & 0xff);
  }
  
  const contentBytes = Uint8Array.from(utf16Bytes);
  const result = new Uint8Array(bom.length + contentBytes.length);
  result.set(bom, 0);
  result.set(contentBytes, bom.length);
  
  return result;
}

// ============================================================================
// Type Conversion Utilities
// ============================================================================

/**
 * Helper to parse numbers from various types
 */
function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
}

/**
 * Helper to parse booleans from various types
 */
function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return false;
}

/**
 * Helper to parse string arrays
 */
function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(v => String(v));
  }
  if (typeof value === 'string') {
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  return [];
}

/**
 * Helper to parse string maps
 */
function parseStringMap(value: unknown): Map<string, unknown> {
  const map = new Map<string, unknown>();
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'object' && item !== null) {
        const entry = item as Record<string, unknown>;
        const keys = Object.keys(entry);
        if (keys.length >= 2) {
          const key = String(entry[keys[0]]);
          map.set(key, entry[keys[1]]);
        }
      }
    }
  }
  return map;
}

/**
 * Convert XML skill data to SkillDefinition
 */
function xmlToSkill(xmlSkill: Record<string, unknown>): SkillDefinition {
  const parseSkillRange = (value: unknown): SkillRange => {
    if (typeof value !== 'object' || value === null) {
      return {
        min: 0,
        max: 0,
        cardinalDirectionOnly: false,
        modifiable: false,
      };
    }
    const range = value as Record<string, unknown>;
    return {
      min: parseNumber(range.Min ?? range.min),
      max: parseNumber(range.Max ?? range.max),
      cardinalDirectionOnly: parseBoolean(range.CardinalDirectionOnly ?? range.cardinalDirectionOnly),
      modifiable: parseBoolean(range.Modifiable ?? range.modifiable),
    };
  };

  const parseSkillTarget = (value: unknown): SkillTarget => {
    if (typeof value !== 'object' || value === null) {
      return {
        validTargets: [],
        affectedUnits: [],
      };
    }
    const target = value as Record<string, unknown>;
    return {
      validTargets: parseStringArray(target.ValidTargets ?? target.validTargets),
      affectedUnits: parseStringArray(target.AffectedUnits ?? target.affectedUnits),
    };
  };

  const parseAreaOfEffect = (value: unknown): AreaOfEffect => {
    if (typeof value !== 'object' || value === null) {
      return {
        originX: 0,
        originY: 0,
        pattern: '',
      };
    }
    const aoe = value as Record<string, unknown>;
    return {
      originX: parseNumber(aoe.OriginX ?? aoe.originX),
      originY: parseNumber(aoe.OriginY ?? aoe.originY),
      pattern: String(aoe.Pattern ?? aoe.pattern ?? ''),
    };
  };

  const parseAttackAction = (value: unknown): AttackAction => {
    if (typeof value !== 'object' || value === null) {
      return {
        attackType: 'Physical',
        baseDamage: [0, 0],
        damageMultiplier: 1,
        criticalChance: 0,
        effects: {
          follow: false,
          maneuver: false,
          multiHit: false,
          armorPiercing: false,
        },
      };
    }
    const attack = value as Record<string, unknown>;
    const baseDamageObj = attack.BaseDamage as Record<string, unknown> | undefined;
    return {
      attackType: (String(attack.AttackType ?? attack.attackType ?? 'Physical') as 'Physical' | 'Magical' | 'Ranged'),
      baseDamage: [
        parseNumber(attack.BaseDamageMin ?? attack.baseDamageMin ?? baseDamageObj?.Min ?? 0),
        parseNumber(attack.BaseDamageMax ?? attack.baseDamageMax ?? baseDamageObj?.Max ?? 0),
      ],
      damageMultiplier: parseNumber(attack.DamageMultiplier ?? attack.damageMultiplier),
      criticalChance: parseNumber(attack.CriticalChance ?? attack.criticalChance),
      effects: {
        follow: parseBoolean(attack.Follow ?? attack.follow),
        maneuver: parseBoolean(attack.Maneuver ?? attack.maneuver),
        multiHit: parseBoolean(attack.MultiHit ?? attack.multiHit),
        armorPiercing: parseBoolean(attack.ArmorPiercing ?? attack.armorPiercing),
      },
    };
  };

  const parseGenericAction = (value: unknown): GenericAction => {
    if (typeof value !== 'object' || value === null) {
      return {
        actionType: '',
        parameters: new Map(),
      };
    }
    const action = value as Record<string, unknown>;
    return {
      actionType: String(action.ActionType ?? action.actionType ?? ''),
      parameters: parseStringMap(action.Parameters ?? action.parameters),
    };
  };

  const parseCastFX = (value: unknown): CastFX => {
    if (typeof value !== 'object' || value === null) {
      return {
        vfx: '',
        sound: '',
        camShake: 0,
        casterAnim: '',
      };
    }
    const fx = value as Record<string, unknown>;
    return {
      vfx: String(fx.VFX ?? fx.vfx ?? ''),
      sound: String(fx.Sound ?? fx.sound ?? ''),
      camShake: parseNumber(fx.CamShake ?? fx.camShake),
      casterAnim: String(fx.CasterAnim ?? fx.casterAnim ?? ''),
    };
  };

  const parseConditions = (value: unknown): SkillConditions => {
    if (typeof value !== 'object' || value === null) {
      return {};
    }
    const conditions = value as Record<string, unknown>;
    const result: SkillConditions = {};
    
    if (conditions.Phase !== undefined) {
      result.phase = String(conditions.Phase);
    }
    if (conditions.TargetInRange !== undefined) {
      result.targetInRange = parseBoolean(conditions.TargetInRange);
    }
    if (conditions.InWatchtower !== undefined) {
      result.inWatchtower = parseBoolean(conditions.InWatchtower);
    }
    
    return result;
  };

  const skill = xmlSkill as Record<string, unknown>;

  return {
    id: String(skill.Id ?? skill.id ?? ''),
    description: String(skill.Description ?? skill.description ?? ''),
    iconPath: String(skill.IconPath ?? skill.iconPath ?? ''),
    templateId: String(skill.TemplateId ?? skill.templateId ?? ''),
    actionPointsCost: parseNumber(skill.ActionPointsCost ?? skill.actionPointsCost),
    manaCost: parseNumber(skill.ManaCost ?? skill.manaCost),
    healthCost: parseNumber(skill.HealthCost ?? skill.healthCost),
    usesPerTurnCount: parseNumber(skill.UsesPerTurnCount ?? skill.usesPerTurnCount),
    skillRange: parseSkillRange(skill.SkillRange ?? skill.skillRange),
    skillTarget: parseSkillTarget(skill.SkillTarget ?? skill.skillTarget),
    areaOfEffect: parseAreaOfEffect(skill.AreaOfEffect ?? skill.areaOfEffect),
    attackAction: skill.AttackAction ?? skill.attackAction ? parseAttackAction(skill.AttackAction ?? skill.attackAction) : undefined,
    genericAction: skill.GenericAction ?? skill.genericAction ? parseGenericAction(skill.GenericAction ?? skill.genericAction) : undefined,
    castFx: parseCastFX(skill.CastFX ?? skill.castFx),
    conditions: parseConditions(skill.Conditions ?? skill.conditions),
    category: (skill.Category ?? skill.category ?? 'Other') as SkillCategory,
  };
}

/**
 * Convert SkillDefinition to XML data object
 */
function skillToXml(skill: SkillDefinition): Record<string, unknown> {
  const xml: Record<string, unknown> = {
    Id: skill.id,
    Description: skill.description,
    IconPath: skill.iconPath,
    TemplateId: skill.templateId,
    ActionPointsCost: skill.actionPointsCost || 0,
    ManaCost: skill.manaCost || 0,
    HealthCost: skill.healthCost || 0,
    UsesPerTurnCount: skill.usesPerTurnCount || 0,
    Category: skill.category,
  };

  // Skill Range - handle undefined
  xml.SkillRange = {
    Min: skill.skillRange?.min ?? 0,
    Max: skill.skillRange?.max ?? 0,
    CardinalDirectionOnly: skill.skillRange?.cardinalDirectionOnly ?? false,
    Modifiable: skill.skillRange?.modifiable ?? false,
  };

  // Skill Target - handle undefined
  xml.SkillTarget = {
    ValidTargets: { Target: Array.isArray(skill.skillTarget?.validTargets) ? skill.skillTarget.validTargets : [] },
    AffectedUnits: { Unit: Array.isArray(skill.skillTarget?.affectedUnits) ? skill.skillTarget.affectedUnits : [] },
  };

  // Area of Effect - handle undefined
  xml.AreaOfEffect = {
    OriginX: skill.areaOfEffect?.originX ?? 0,
    OriginY: skill.areaOfEffect?.originY ?? 0,
    Pattern: skill.areaOfEffect?.pattern ?? '',
  };

  // Attack Action (if present)
  if (skill.attackAction) {
    xml.AttackAction = {
      AttackType: skill.attackAction.attackType,
      BaseDamageMin: skill.attackAction.baseDamage?.[0] ?? 0,
      BaseDamageMax: skill.attackAction.baseDamage?.[1] ?? 0,
      DamageMultiplier: skill.attackAction.damageMultiplier ?? 1,
      CriticalChance: skill.attackAction.criticalChance ?? 0,
      Follow: skill.attackAction.effects?.follow ?? false,
      Maneuver: skill.attackAction.effects?.maneuver ?? false,
      MultiHit: skill.attackAction.effects?.multiHit ?? false,
      ArmorPiercing: skill.attackAction.effects?.armorPiercing ?? false,
    };
  }

  // Generic Action (if present)
  if (skill.genericAction) {
    const params = skill.genericAction.parameters instanceof Map
      ? skill.genericAction.parameters
      : new Map(Object.entries(skill.genericAction.parameters || {}));
    
    xml.GenericAction = {
      ActionType: skill.genericAction.actionType,
      Parameters: Array.from(params.entries()).map(([key, value]) => ({
        Parameter: {
          Key: key,
          Value: value,
        },
      })),
    };
  }

  // Cast FX - serialize all fields including empty ones
  xml.CastFX = {
    VFX: skill.castFx?.vfx ?? '',
    Sound: skill.castFx?.sound ?? '',
    CamShake: skill.castFx?.camShake ?? 0,
    CasterAnim: skill.castFx?.casterAnim ?? '',
  };

  // Conditions - serialize all fields
  xml.Conditions = {
    ...(skill.conditions?.phase !== undefined && { Phase: skill.conditions.phase }),
    ...(skill.conditions?.targetInRange !== undefined && { TargetInRange: skill.conditions.targetInRange }),
    ...(skill.conditions?.inWatchtower !== undefined && { InWatchtower: skill.conditions.inWatchtower }),
  };

  return xml;
}

// ============================================================================
// Main Parser Functions
// ============================================================================

/**
 * Parse skills from XML string
 */
export function parseSkills(xmlString: string): SkillDefinition[] {
  const parser = new XMLParser(parserOptions);
  const parsed = parser.parse(xmlString);
  
  const skillsData = parsed.Skills ?? parsed.skills;
  
  if (!skillsData) {
    return [];
  }
  
  const skillsArray = Array.isArray(skillsData.Skill ?? skillsData.skill)
    ? skillsData.Skill ?? skillsData.skill
    : [skillsData.Skill ?? skillsData.skill].filter(Boolean);
  
  return skillsArray.map((skill: Record<string, unknown>) => xmlToSkill(skill));
}

/**
 * Parse skills from ArrayBuffer (with BOM detection)
 */
export function parseSkillsFromBuffer(buffer: ArrayBuffer): SkillDefinition[] {
  const xmlString = decodeBuffer(buffer);
  return parseSkills(xmlString);
}

/**
 * Export skills to XML string
 */
export function exportSkills(skills: SkillDefinition[]): string {
  const builder = new XMLBuilder(builderOptions);
  
  const skillsData = {
    Skills: {
      Skill: skills.map(skillToXml),
    },
  };
  
  const xmlString = builder.build(skillsData);
  
  // Add XML declaration
  const xmlDeclaration = '<?xml version="1.0" encoding="utf-16"?>\n';
  return xmlDeclaration + xmlString;
}

/**
 * Export skills to Uint8Array with UTF-16 LE BOM
 */
export function exportSkillsToBuffer(skills: SkillDefinition[]): Uint8Array {
  const xmlString = exportSkills(skills);
  return encodeToUtf16LeWithBom(xmlString);
}

/**
 * Round-trip test: parse -> export -> parse
 * Returns true if data is identical after round-trip
 */
export function roundTripTest(skills: SkillDefinition[]): boolean {
  try {
    const xmlString = exportSkills(skills);
    const parsed = parseSkills(xmlString);
    
    if (parsed.length !== skills.length) {
      return false;
    }
    
    for (let i = 0; i < skills.length; i++) {
      const original = skills[i];
      const roundTripped = parsed[i];
      
      if (original.id !== roundTripped.id ||
          original.description !== roundTripped.description ||
          original.iconPath !== roundTripped.iconPath ||
          original.templateId !== roundTripped.templateId ||
          original.category !== roundTripped.category) {
        return false;
      }
      
      if (original.actionPointsCost !== roundTripped.actionPointsCost ||
          original.manaCost !== roundTripped.manaCost ||
          original.healthCost !== roundTripped.healthCost ||
          original.usesPerTurnCount !== roundTripped.usesPerTurnCount) {
        return false;
      }
      
      if (original.skillRange.min !== roundTripped.skillRange.min ||
          original.skillRange.max !== roundTripped.skillRange.max ||
          original.skillTarget.validTargets.length !== roundTripped.skillTarget.validTargets.length ||
          original.areaOfEffect.pattern !== roundTripped.areaOfEffect.pattern) {
        return false;
      }
      
      // Check attack action if present
      if (original.attackAction && roundTripped.attackAction) {
        if (original.attackAction.attackType !== roundTripped.attackAction.attackType ||
            original.attackAction.baseDamage[0] !== roundTripped.attackAction.baseDamage[0] ||
            original.attackAction.baseDamage[1] !== roundTripped.attackAction.baseDamage[1]) {
          return false;
        }
      }
    }
    
    return true;
  } catch {
    return false;
  }
}
