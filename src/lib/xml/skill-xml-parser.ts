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
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '   ',
  suppressBooleanAttributes: false,
  alwaysCreateTextNode: false,
  suppressEmptyNode: true,
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
      min: parseNumber(range['@_Min'] ?? range.Min ?? range.min),
      max: parseNumber(range['@_Max'] ?? range.Max ?? range.max),
      cardinalDirectionOnly: parseBoolean(range['@_CardinalDirectionOnly'] ?? range.CardinalDirectionOnly ?? range.cardinalDirectionOnly),
      modifiable: parseBoolean(range['@_Modifiable'] ?? range.Modifiable ?? range.modifiable),
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
    // Handle native format: { Attack: { AttackType, DamageMultiplier, SkillEffects } }
    const inner = (value as Record<string, unknown>).Attack;
    if (inner && typeof inner === 'object') {
      value = inner;
    }
    const attack = value as Record<string, unknown>;
    const baseDamageObj = attack.BaseDamage as Record<string, unknown> | undefined;

    // Parse SkillEffects for native format
    const effectsObj = attack.SkillEffects as Record<string, unknown> | undefined;
    const hasEffect = (name: string): boolean => {
      if (effectsObj) {
        const nativeKey = Object.keys(effectsObj).find(
          k => k.toLowerCase() === name.toLowerCase()
        );
        if (nativeKey !== undefined) {
          const val = effectsObj[nativeKey];
          return val === '' || val === true || (typeof val === 'object' && val !== null);
        }
      }
      return parseBoolean(
        attack[name] ??
        attack[name.charAt(0).toLowerCase() + name.slice(1)] ??
        false
      );
    };

    return {
      attackType: (String(attack.AttackType ?? attack.attackType ?? 'Physical') as 'Physical' | 'Magical' | 'Ranged'),
      baseDamage: [
        parseNumber(attack.BaseDamageMin ?? attack.baseDamageMin ?? baseDamageObj?.Min ?? 0),
        parseNumber(attack.BaseDamageMax ?? attack.baseDamageMax ?? baseDamageObj?.Max ?? 0),
      ],
      damageMultiplier: parseNumber(attack.DamageMultiplier ?? attack.damageMultiplier ?? 1),
      criticalChance: parseNumber(attack.CriticalChance ?? attack.criticalChance),
      effects: {
        follow: hasEffect('Follow'),
        maneuver: hasEffect('Maneuver'),
        multiHit: hasEffect('MultiHit'),
        armorPiercing: hasEffect('ArmorPiercing'),
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
      // Presence = true (native format uses <TargetInRange/>), or explicit boolean value
      const val = conditions.TargetInRange;
      result.targetInRange = typeof val === 'string' ? val.length > 0 : parseBoolean(val);
    }
    if (conditions.InWatchtower !== undefined) {
      const val = conditions.InWatchtower;
      result.inWatchtower = typeof val === 'string' ? val.length > 0 : parseBoolean(val);
    }
    
    return result;
  };

  const skill = xmlSkill as Record<string, unknown>;

  // Detect native format (Id/TemplateId as attributes) vs old format (Id as element)
  const id = skill['@_Id'] ?? skill.Id ?? skill.id ?? '';
  const templateId = skill['@_TemplateId'] ?? skill.TemplateId ?? skill.templateId ?? '';

  // Native format: Range (with @_Min/@_Max) | Old format: SkillRange
  const rangeData = skill.Range ?? skill.SkillRange ?? skill.skillRange;

  // Native format: SkillAction with Attack/Generic wrapper | Old format: AttackAction/GenericAction
  const actionData = skill.SkillAction ?? skill.AttackAction ?? skill.attackAction;
  const skillActionObj = skill.SkillAction as Record<string, unknown> | undefined;
  const genericData = skillActionObj?.Generic ?? skill.GenericAction ?? skill.genericAction;

  // Native format: CastFXs | Old format: CastFX
  const castFxData = skill.CastFXs ?? skill.CastFX ?? skill.castFx;

  // Native format: Conditions (presence flags) | Old format: Conditions (boolean values)
  const conditionsData = skill.Conditions ?? skill.conditions;

  return {
    id: String(id),
    description: String(skill.Description ?? skill.description ?? ''),
    iconPath: String(skill.IconPath ?? skill.iconPath ?? ''),
    templateId: String(templateId),
    actionPointsCost: parseNumber(skill.ActionPointsCost ?? skill.actionPointsCost),
    manaCost: parseNumber(skill.ManaCost ?? skill.manaCost),
    healthCost: parseNumber(skill.HealthCost ?? skill.healthCost),
    usesPerTurnCount: parseNumber(skill.UsesPerTurnCount ?? skill.usesPerTurnCount),
    skillRange: parseSkillRange(rangeData),
    skillTarget: parseSkillTarget(skill.SkillTarget ?? skill.skillTarget),
    areaOfEffect: parseAreaOfEffect(skill.AreaOfEffect ?? skill.areaOfEffect),
    attackAction: actionData && (actionData as Record<string, unknown>).Attack ? parseAttackAction(actionData) : (skill.AttackAction ? parseAttackAction(skill.AttackAction) : undefined),
    genericAction: genericData ? parseGenericAction(genericData) : undefined,
    castFx: parseCastFX(castFxData),
    conditions: parseConditions(conditionsData),
    category: (skill.Category ?? skill.category ?? 'Other') as SkillCategory,
  };
}

/**
 * Convert SkillDefinition to XML data object (game-native format)
 */
function skillToXml(skill: SkillDefinition): Record<string, unknown> {
  const xml: Record<string, unknown> = {};

  // Id and TemplateId as attributes
  xml['@_Id'] = skill.id;
  if (skill.templateId) {
    xml['@_TemplateId'] = skill.templateId;
  }

  // Core costs as elements
  xml.ActionPointsCost = skill.actionPointsCost ?? 1;

  if (skill.manaCost && skill.manaCost > 0) {
    xml.ManaCost = skill.manaCost;
  }
  if (skill.healthCost && skill.healthCost > 0) {
    xml.HealthCost = skill.healthCost;
  }

  xml.UsesPerTurnCount = skill.usesPerTurnCount ?? 0;

  // Range with attribute format: <Range Min="1" Max="2" CardinalDirectionOnly="true"/>
  xml.Range = {
    '@_Min': skill.skillRange?.min ?? 0,
    '@_Max': skill.skillRange?.max ?? 0,
    '@_CardinalDirectionOnly': skill.skillRange?.cardinalDirectionOnly ?? false,
  };
  if (skill.skillRange?.modifiable) {
    (xml.Range as Record<string, unknown>)['@_Modifiable'] = true;
  }

  // AreaOfEffect with attributes and text content
  if (skill.areaOfEffect?.pattern) {
    xml.AreaOfEffect = {
      '@_OriginX': skill.areaOfEffect.originX ?? 0,
      '@_OriginY': skill.areaOfEffect.originY ?? 0,
      '#text': skill.areaOfEffect.pattern,
    };
  }

  // SkillAction with Attack wrapper: <SkillAction><Attack>...</Attack></SkillAction>
  if (skill.attackAction) {
    const effects: Record<string, unknown> = {};
    if (skill.attackAction.effects) {
      if (skill.attackAction.effects.follow) {
        effects.Follow = '';
      }
      if (skill.attackAction.effects.maneuver) {
        effects.Maneuver = '';
      }
      if (skill.attackAction.effects.multiHit) {
        effects.MultiHit = '';
      }
      if (skill.attackAction.effects.armorPiercing) {
        effects.ArmorPiercing = '';
      }
    }

    xml.SkillAction = {
      Attack: {
        AttackType: skill.attackAction.attackType,
        DamageMultiplier: skill.attackAction.damageMultiplier ?? 1,
        SkillEffects: Object.keys(effects).length > 0 ? effects : undefined,
      },
    };
  }

  if (skill.genericAction) {
    const params = skill.genericAction.parameters instanceof Map
      ? skill.genericAction.parameters
      : new Map(Object.entries(skill.genericAction.parameters || {}));

    xml.SkillAction = {
      Generic: {
        SkillEffects: Array.from(params.entries()).map(([key, value]) => ({
          '@_Key': key,
          '#text': String(value),
        })),
      },
    };
  }

  // CastFX
  if (skill.castFx && (skill.castFx.vfx || skill.castFx.sound || skill.castFx.camShake || skill.castFx.casterAnim)) {
    const castFx: Record<string, unknown> = {};
    if (skill.castFx.vfx) {
      castFx.VisualEffect = { Paths: { Path: skill.castFx.vfx } };
    }
    if (skill.castFx.sound) {
      castFx.SoundEffect = skill.castFx.sound;
    }
    if (skill.castFx.camShake && skill.castFx.camShake > 0) {
      castFx.CamShake = skill.castFx.camShake;
    }
    if (skill.castFx.casterAnim) {
      castFx.CasterAnim = skill.castFx.casterAnim;
    }
    xml.CastFXs = castFx;
  }

  // Conditions - only include when present
  const conditions: Record<string, unknown> = {};
  if (skill.conditions) {
    if (skill.conditions.phase !== undefined) {
      conditions.Phase = skill.conditions.phase;
    }
    if (skill.conditions.targetInRange !== undefined) {
      conditions.TargetInRange = '';
    }
    if (skill.conditions.inWatchtower !== undefined && skill.conditions.inWatchtower) {
      conditions.InWatchtower = '';
    }
  }
  if (Object.keys(conditions).length > 0) {
    xml.Conditions = conditions;
  }

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
  
  // Support both native game format and old WebDev2 format
  const skillsData = parsed.SkillDefinitions ?? parsed.Skilldefinitions ?? parsed.Skills ?? parsed.skills;
  
  if (!skillsData) {
    return [];
  }
  
  // Native format: SkillDefinition | Old format: Skill
  const skillsArray = Array.isArray(skillsData.SkillDefinition ?? skillsData.Skill ?? skillsData.skill)
    ? (skillsData.SkillDefinition ?? skillsData.Skill ?? skillsData.skill)
    : [skillsData.SkillDefinition ?? skillsData.Skill ?? skillsData.skill].filter(Boolean);
  
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
 * Export skills to XML string (native game format)
 * Note: When using exportSkillsToBuffer(), the encoding is UTF-16 LE with BOM.
 * The string version uses UTF-8 declaration for direct file saving.
 */
export function exportSkills(skills: SkillDefinition[], encoding: 'utf-8' | 'utf-16' = 'utf-8'): string {
  const builder = new XMLBuilder({
    ...builderOptions,
    suppressEmptyNode: false, // Keep empty strings as <tag></tag>
  });
  
  const skillsData = {
    '?xml': {
      '@_version': '1.0',
      '@_encoding': encoding,
      '#text': '',
    },
    SkillDefinitions: {
      '@_xmlns:xs': 'http://www.w3.org/2001/XMLSchema-instance',
      '@_xs:noNamespaceSchemaLocation': 'SkillDefinitions.xsd',
      SkillDefinition: skills.map(skillToXml),
    },
  };
  
  let xmlString = builder.build(skillsData);
  
  // Fix XML declaration to be on a single line
  xmlString = xmlString.replace(/\?xml[^>]*\?[^>]*>/, `<?xml version="1.0" encoding="${encoding}"?>`);
  
  return xmlString;
}

/**
 * Export skills to Uint8Array with UTF-16 LE BOM
 */
export function exportSkillsToBuffer(skills: SkillDefinition[]): Uint8Array {
  const xmlString = exportSkills(skills, 'utf-16');
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
