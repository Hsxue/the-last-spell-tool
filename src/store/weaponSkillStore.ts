/**
 * Weapon & Skill Store - Zustand store for weapon and skill state management
 * Handles weapon definitions, skill definitions, and editing state
 *
 * Persistence: State is automatically saved to localStorage via zustand persist middleware.
 * Map objects (baseStatBonuses, genericAction.parameters) are serialized to Records.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  WeaponDefinition,
  WeaponCategory,
  WeaponHands,
  WeaponLevel,
  SkillDefinition,
  WeaponSkillView,
} from '../types/weapon-skill';
import { mapToRecord, recordToMap } from '../lib/map-serialization';

// ============================================================================
// State Interface
// ============================================================================

interface WeaponSkillState {
  // View State
  currentView: WeaponSkillView;
  selectedWeaponId: string | null;
  selectedSkillId: string | null;
  editingWeaponLevel: number | null;

  // Data
  weapons: WeaponDefinition[];
  skills: SkillDefinition[];

  // UI State
  hasUnsavedChanges: boolean;
  errors: string[];

  // Actions - View State
  setCurrentView: (view: WeaponSkillView) => void;
  setSelectedWeapon: (weaponId: string | null) => void;
  setSelectedSkill: (skillId: string | null) => void;
  setEditingLevel: (level: number | null) => void;

  // Actions - Data Mutations
  addWeapon: (weapon: WeaponDefinition) => void;
  updateWeapon: (weapon: WeaponDefinition) => void;
  removeWeapon: (weaponId: string) => void;
  addSkill: (skill: SkillDefinition) => void;
  updateSkill: (skill: SkillDefinition) => void;
  removeSkill: (skillId: string) => void;

  // Actions - UI State
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  addError: (error: string) => void;
  clearErrors: () => void;
}

// ============================================================================
// Default State
// ============================================================================

const defaultState: Omit<
  WeaponSkillState,
  | 'setCurrentView'
  | 'setSelectedWeapon'
  | 'setSelectedSkill'
  | 'setEditingLevel'
  | 'addWeapon'
  | 'updateWeapon'
  | 'removeWeapon'
  | 'addSkill'
  | 'updateSkill'
  | 'removeSkill'
  | 'setHasUnsavedChanges'
  | 'addError'
  | 'clearErrors'
> = {
  currentView: 'weapons',
  selectedWeaponId: null,
  selectedSkillId: null,
  editingWeaponLevel: null,
  weapons: [],
  skills: [],
  hasUnsavedChanges: false,
  errors: [],
};

// ============================================================================
// Persist Middleware Configuration
// ============================================================================

/**
 * Serialize weapons/skills for localStorage - converts all Maps to Records.
 */
function serializeForPersist(state: Omit<WeaponSkillState, keyof WeaponSkillActions>): unknown {
  return {
    currentView: state.currentView,
    selectedWeaponId: state.selectedWeaponId,
    selectedSkillId: state.selectedSkillId,
    editingWeaponLevel: state.editingWeaponLevel,
    weapons: state.weapons.map((w) => ({
      ...w,
      levelVariations: Object.fromEntries(
        Object.entries(w.levelVariations).map(([level, lv]) => [
          level,
          {
            ...lv,
            baseStatBonuses: mapToRecord(lv.baseStatBonuses),
          },
        ])
      ),
    })),
    skills: state.skills.map((s) => ({
      ...s,
      genericAction: s.genericAction
        ? {
            ...s.genericAction,
            parameters: mapToRecord(s.genericAction.parameters as Map<string, unknown>),
          }
        : undefined,
    })),
    hasUnsavedChanges: state.hasUnsavedChanges,
    errors: state.errors,
  };
}

/**
 * Deserialize from localStorage - converts Records back to Maps.
 */
function deserializeFromPersist(raw: unknown): Partial<WeaponSkillState> {
  const data = raw as Record<string, unknown>;
  const weapons = (data.weapons as Array<Record<string, unknown>> | undefined)?.map((w) => {
    const levelVariationsRaw = w.levelVariations as Record<string, Record<string, unknown>> | undefined;
    const levelVariations: Record<number, WeaponLevel> = {};
    if (levelVariationsRaw) {
      Object.entries(levelVariationsRaw).forEach(([level, lv]) => {
        levelVariations[Number(level)] = {
          ...lv,
          baseStatBonuses: recordToMap(lv.baseStatBonuses as Record<string, number> | undefined),
        } as WeaponLevel;
      });
    }
    return {
      id: w.id as string,
      category: w.category as WeaponCategory,
      hands: w.hands as WeaponHands,
      tags: w.tags as string[],
      levelVariations,
    } as WeaponDefinition;
  }) ?? [];

  const skills = (data.skills as Array<Record<string, unknown>> | undefined)?.map((s) => {
    const genericActionRaw = s.genericAction as Record<string, unknown> | undefined;
    const genericAction = genericActionRaw
      ? {
          ...genericActionRaw,
          parameters: recordToMap(genericActionRaw.parameters as Record<string, unknown> | undefined),
        }
      : undefined;
    return {
      ...s,
      genericAction,
    } as SkillDefinition;
  }) ?? [];

  return {
    currentView: (data.currentView as WeaponSkillView) ?? 'weapons',
    selectedWeaponId: (data.selectedWeaponId as string | null) ?? null,
    selectedSkillId: (data.selectedSkillId as string | null) ?? null,
    editingWeaponLevel: (data.editingWeaponLevel as number | null) ?? null,
    weapons,
    skills,
    hasUnsavedChanges: (data.hasUnsavedChanges as boolean) ?? false,
    errors: (data.errors as string[]) ?? [],
  };
}

interface WeaponSkillActions {
  setCurrentView: (view: WeaponSkillView) => void;
  setSelectedWeapon: (weaponId: string | null) => void;
  setSelectedSkill: (skillId: string | null) => void;
  setEditingLevel: (level: number | null) => void;
  addWeapon: (weapon: WeaponDefinition) => void;
  updateWeapon: (weapon: WeaponDefinition) => void;
  removeWeapon: (weaponId: string) => void;
  addSkill: (skill: SkillDefinition) => void;
  updateSkill: (skill: SkillDefinition) => void;
  removeSkill: (skillId: string) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  addError: (error: string) => void;
  clearErrors: () => void;
}

// ============================================================================
// Store Creation
// ============================================================================

export const useWeaponSkillStore = create<WeaponSkillState>()(
  persist(
    immer((set) => ({
    // Initial State
    ...defaultState,

    // Actions - View State
    setCurrentView: (view) => {
      set((state) => {
        state.currentView = view;
      });
    },

    setSelectedWeapon: (weaponId) => {
      set((state) => {
        state.selectedWeaponId = weaponId;
      });
    },

    setSelectedSkill: (skillId) => {
      set((state) => {
        state.selectedSkillId = skillId;
      });
    },

    setEditingLevel: (level) => {
      set((state) => {
        state.editingWeaponLevel = level;
      });
    },

    // Actions - Data Mutations
    addWeapon: (weapon) => {
      set((state) => {
        console.log('[store.addWeapon] Adding weapon:', weapon);
        console.log('[store.addWeapon] levelVariations:', weapon.levelVariations);
        state.weapons.push(weapon);
        state.hasUnsavedChanges = true;
      });
    },

    updateWeapon: (weapon) => {
      set((state) => {
        console.log('[store.updateWeapon] Updating weapon:', weapon);
        console.log('[store.updateWeapon] levelVariations type:', weapon.levelVariations?.constructor?.name);
        if (weapon.levelVariations instanceof Map) {
          console.log('[store.updateWeapon] levelVariations size:', weapon.levelVariations.size);
          const entries = Array.from(weapon.levelVariations.entries());
          console.log('[store.updateWeapon] levelVariations entries:', entries);
          entries.forEach(([level, data]) => {
            console.log(`[store.updateWeapon]   Level ${level}:`, data);
            console.log(`[store.updateWeapon]   baseDamage:`, (data as any).baseDamage);
          });
        }
        const index = state.weapons.findIndex((w) => w.id === weapon.id);
        if (index !== -1) {
          console.log('[store.updateWeapon] Found weapon at index:', index);
          state.weapons[index] = weapon;
          console.log('[store.updateWeapon] After update, store levelVariations:', state.weapons[index].levelVariations);
          if (state.weapons[index].levelVariations instanceof Map) {
            console.log('[store.updateWeapon] After update, Map size:', state.weapons[index].levelVariations.size);
            const entries = Array.from(state.weapons[index].levelVariations.entries());
            console.log('[store.updateWeapon] After update, Map entries:', entries);
            entries.forEach(([level, data]) => {
              console.log(`[store.updateWeapon]   Level ${level}:`, data);
              console.log(`[store.updateWeapon]   baseDamage:`, (data as any).baseDamage);
            });
          }
          state.hasUnsavedChanges = true;
        }
      });
    },

    removeWeapon: (weaponId) => {
      set((state) => {
        state.weapons = state.weapons.filter((w) => w.id !== weaponId);
        state.hasUnsavedChanges = true;
        if (state.selectedWeaponId === weaponId) {
          state.selectedWeaponId = null;
        }
      });
    },

    addSkill: (skill) => {
      set((state) => {
        state.skills.push(skill);
        state.hasUnsavedChanges = true;
      });
    },

    updateSkill: (skill) => {
      set((state) => {
        const index = state.skills.findIndex((s) => s.id === skill.id);
        if (index !== -1) {
          state.skills[index] = skill;
          state.hasUnsavedChanges = true;
        }
      });
    },

    removeSkill: (skillId) => {
      set((state) => {
        state.skills = state.skills.filter((s) => s.id !== skillId);
        state.hasUnsavedChanges = true;
        if (state.selectedSkillId === skillId) {
          state.selectedSkillId = null;
        }
      });
    },

    // Actions - UI State
    setHasUnsavedChanges: (hasChanges) => {
      set((state) => {
        state.hasUnsavedChanges = hasChanges;
      });
    },

    addError: (error) => {
      set((state) => {
        state.errors.push(error);
      });
    },

    clearErrors: () => {
      set((state) => {
        state.errors = [];
      });
    },
  })),
  {
    name: 'weapon-skill-store',
    storage: {
      getItem: async (name: string) => {
        const str = localStorage.getItem(name);
        if (!str) return null;
        try {
          const parsed = JSON.parse(str);
          return { state: deserializeFromPersist(parsed.state) };
        } catch {
          return null;
        }
      },
      setItem: async (name: string, value: unknown) => {
        const stateObj = (value as { state: Omit<WeaponSkillState, keyof WeaponSkillActions> }).state;
        const serialized = serializeForPersist(stateObj);
        localStorage.setItem(name, JSON.stringify({ state: serialized }));
      },
      removeItem: async (name: string) => {
        localStorage.removeItem(name);
      },
    },
    // Merge persisted state with defaults for new fields
    merge: (persistedState, currentState) => {
      if (!persistedState) return currentState;
      return { ...currentState, ...persistedState };
    },
    version: 1,
  }
)
);

// ============================================================================
// Selectors
// ============================================================================

export const selectWeaponById = (weaponId: string) => {
  return (state: WeaponSkillState) => {
    return state.weapons.find((w) => w.id === weaponId) || null;
  };
};

export const selectSkillById = (skillId: string) => {
  return (state: WeaponSkillState) => {
    return state.skills.find((s) => s.id === skillId) || null;
  };
};

export const selectWeaponsByCategory = (category: string) => {
  return (state: WeaponSkillState) => {
    return state.weapons.filter((w) => w.category === category);
  };
};

export const selectSkillsByCategory = (category: string) => {
  return (state: WeaponSkillState) => {
    return state.skills.filter((s) => s.category === category);
  };
};

export const selectSelectedWeapon = (state: WeaponSkillState) => {
  if (!state.selectedWeaponId) return null;
  return selectWeaponById(state.selectedWeaponId)(state);
};

export const selectSelectedSkill = (state: WeaponSkillState) => {
  if (!state.selectedSkillId) return null;
  return selectSkillById(state.selectedSkillId)(state);
};
