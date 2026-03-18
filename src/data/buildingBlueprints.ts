/**
 * Generated building blueprints from BuildingDefinitions.txt
 * Contains all building shapes and placement configurations for The Last Spell
 */

import type { BuildingCategory } from '../types/map';

// Define a custom interface that combines building blueprint and category information
interface BuildingBlueprintWithCategory {
  id: string;
  category: BuildingCategory;
  tiles: string[][];
  originX: number;
  originY: number;
}

export const BUILDING_BLUEPRINTS: BuildingBlueprintWithCategory[] = [
  {
    id: 'MagicCircle',
    category: 'Special',
    tiles: [
    ['B', 'B', 'B'],
    ['B', 'B', 'B'],
    ['B', 'B', 'B']
    ],
    originX: 1,
    originY: 1
  },
  {
    id: 'RuinsB',
    category: 'Building',
    tiles: [
    ['B'],
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'RuinsC',
    category: 'Building',
    tiles: [
    ['B', 'B'],
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'RuinsD',
    category: 'Building',
    tiles: [
    ['B', 'B'],
    ['B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'BonePile1',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'BonePile2',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'BonePile3',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'BonePileElite',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Barricade',
    category: 'Wall',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'WoodenWall',
    category: 'Wall',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'WoodenWallReinforced',
    category: 'Wall',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'WoodenGate',
    category: 'Wall',
    tiles: [
    ['H']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'StoneWall',
    category: 'Wall',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'StoneWallReinforced',
    category: 'Wall',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'VestigeWall',
    category: 'Wall',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Gate',
    category: 'Wall',
    tiles: [
    ['H']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'GateHorizontal',
    category: 'Wall',
    tiles: [
    ['B', 'H', 'B']
    ],
    originX: 1,
    originY: 0
  },
  {
    id: 'GateVertical',
    category: 'Wall',
    tiles: [
    ['B'],
    ['H'],
    ['B']
    ],
    originX: 0,
    originY: 1
  },
  {
    id: 'SlowTrap',
    category: 'Trap',
    tiles: [
    ['E']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'StunTrap',
    category: 'Trap',
    tiles: [
    ['E']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'DamageTrap',
    category: 'Trap',
    tiles: [
    ['E']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Ballista',
    category: 'Tower',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'BallistaTower',
    category: 'Tower',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'BallistaHeavy',
    category: 'Tower',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'BallistaSplit',
    category: 'Tower',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Catapult',
    category: 'Building',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CatapultAuto',
    category: 'Tower',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Watchtower',
    category: 'Tower',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Teleporter',
    category: 'Building',
    tiles: [
    ['E']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PoisonSeed',
    category: 'Building',
    tiles: [
    ['E']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'IsolationSeed',
    category: 'Building',
    tiles: [
    ['E']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PurgingSeed',
    category: 'Building',
    tiles: [
    ['E']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'House',
    category: 'Building',
    tiles: [
    ['B'],
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'ScavengerCamp',
    category: 'Building',
    tiles: [
    ['B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'GoldMine',
    category: 'Building',
    tiles: [
    ['B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Temple',
    category: 'Building',
    tiles: [
    ['_', 'B'],
    ['B', 'B'],
    ['_', 'B']
    ],
    originX: 0,
    originY: 1
  },
  {
    id: 'ManaWell',
    category: 'Building',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Shop',
    category: 'Building',
    tiles: [
    ['B', 'B'],
    ['_', 'B'],
    ['_', 'B']
    ],
    originX: 1,
    originY: 1
  },
  {
    id: 'ArmorMaker',
    category: 'Building',
    tiles: [
    ['B', '_'],
    ['B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Blacksmith',
    category: 'Building',
    tiles: [
    ['B', 'B'],
    ['_', 'B']
    ],
    originX: 0,
    originY: 1
  },
  {
    id: 'Bowyer',
    category: 'Building',
    tiles: [
    ['B', 'B'],
    ['_', 'B']
    ],
    originX: 0,
    originY: 1
  },
  {
    id: 'MagicShop',
    category: 'Building',
    tiles: [
    ['B', 'B'],
    ['B', '_']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'TrinketMaker',
    category: 'Building',
    tiles: [
    ['B'],
    ['B'],
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PotionMaker',
    category: 'Building',
    tiles: [
    ['B', 'B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Inn',
    category: 'Building',
    tiles: [
    ['B', 'B'],
    ['B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Seer',
    category: 'Building',
    tiles: [
    ['B', 'B'],
    ['_', 'B']
    ],
    originX: 0,
    originY: 1
  },
  {
    id: 'Rock',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Rock_Mine',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Mine',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Tree',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'TreeOakOnly',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'TreePineOnly',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'TreeBreakable',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'TreeStump',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'WoodPile',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'MinecartA',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'MinecartB',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'MinecartC',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Barrels',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Crates',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'RoadBlock_NSEW',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'RoadBlock_N',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'RoadBlock_S',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'RoadBlock_E',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'RoadBlock_W',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Crate_Iron',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'SmallBoat_A',
    category: 'Decor',
    tiles: [
    ['B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'SmallBoat_B',
    category: 'Decor',
    tiles: [
    ['B'],
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'TempleStatue',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'DwarfStatue',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'TempleWall',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Lamppost',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Grave',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Mountain',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'ThroneBase',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Pillar_Large',
    category: 'Decor',
    tiles: [
    ['B', 'B'],
    ['B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Pillar_Large_Broken',
    category: 'Decor',
    tiles: [
    ['B', 'B'],
    ['B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Pillar_Small',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Pillar_Small_Broken',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PillarRubble',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Throne',
    category: 'Decor',
    tiles: [
    ['B', 'B'],
    ['B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CorruptedPillar',
    category: 'Building',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CorruptedMageStatue',
    category: 'Building',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CorruptedCrate_Iron',
    category: 'Building',
    tiles: [
    ['B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CorruptedTreeBreakable',
    category: 'Building',
    tiles: [
    ['B'],
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CorruptedRails',
    category: 'Building',
    tiles: [
    ['_', 'B'],
    ['B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CorruptedThrone',
    category: 'Building',
    tiles: [
    ['B', 'B'],
    ['B', 'B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'WoodenFence',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'LightFogSpawner_Alive',
    category: 'Special',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'LightFogSpawner_Alive2',
    category: 'Special',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'LightFogSpawner_Alive3',
    category: 'Special',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'LightFogSpawner_Alive4',
    category: 'Special',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'LightFogSpawner_Dead',
    category: 'Special',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Brazier_Unlit',
    category: 'Brazier',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'BrazierBoss_Unlit',
    category: 'Brazier',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Brazier_Prelit1',
    category: 'Building',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Brazier_Prelit2',
    category: 'Building',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Brazier_Prelit3',
    category: 'Building',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Brazier_Prelit4',
    category: 'Building',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Brazier_Prelit5',
    category: 'Building',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Brazier_Lit1',
    category: 'Brazier',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Brazier_Lit2',
    category: 'Brazier',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Brazier_Lit3',
    category: 'Brazier',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Brazier_Lit4',
    category: 'Brazier',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Brazier_Lit5',
    category: 'Brazier',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'BrazierBoss_Lit1',
    category: 'Brazier',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'BrazierBoss_Lit2',
    category: 'Brazier',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'BrazierBoss_Lit3',
    category: 'Brazier',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CrystalExplosiveOn',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CrystalFrostOn',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CrystalPoisonOn',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CrystalNormalOff',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CrystalCorruptedOn',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'CrystalCorruptedOff',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'DwarfStatueAura1Off',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'DwarfStatueAura2Off',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'SpawnerBossFortressWall',
    category: 'Building',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'LivingForestWallSprout',
    category: 'Decor',
    tiles: [
    ['E']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'LivingForestWall',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'LivingForestBallistaSprout',
    category: 'Decor',
    tiles: [
    ['E']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'LivingForestBallista',
    category: 'Tower',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'SacredBallistaSprout',
    category: 'Tower',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'SacredBallista',
    category: 'Tower',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'GiantTreeBlock',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'GiantTreeRootsE',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'GiantTreeRootsS_A',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'GiantTreeRootsS_B',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'GiantTreeRootsS_C',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'GiantTreeRootsW_A',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'GiantTreeRootsW_B',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PlayerForteressWall',
    category: 'Building',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PortableBallista',
    category: 'Tower',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PortableWatchtower',
    category: 'Tower',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PlayerCrystalExplosiveOn',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PlayerCrystalFrostOn',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PlayerCrystalPoisonOn',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PlayerCrystalNormalOff',
    category: 'Decor',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PlayerLivingForestBallistaSprout',
    category: 'Decor',
    tiles: [
    ['E']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PlayerLivingForestBallista',
    category: 'Tower',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'PlayerBarricade',
    category: 'Wall',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
  {
    id: 'Altar',
    category: 'Building',
    tiles: [
    ['B']
    ],
    originX: 0,
    originY: 0
  },
];

// Total count: 141 buildings
