// Game constants for Traveller Small Craft Designer
// Based on Traveller SRD: https://www.traveller-srd.com/high-guard/small-craft-design/

// Tech Levels (A-H mapping to TL 10-17+)
export const TECH_LEVELS = {
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
  G: 16,
  H: 17,
} as const;

export type TechLevel = keyof typeof TECH_LEVELS;

// Tonnage codes for small craft (S1-S10 for 10-100 tons)
export const TONNAGE_CODES = {
  S1: 10,
  S2: 20,
  S3: 30,
  S4: 40,
  S5: 50,
  S6: 60,
  S7: 70,
  S8: 80,
  S9: 90,
  S10: 100,
} as const;

export type TonnageCode = keyof typeof TONNAGE_CODES;

// Helper function to check if tech level meets minimum requirement
export function isTechLevelAtLeast(current: TechLevel, required: TechLevel): boolean {
  return TECH_LEVELS[current] >= TECH_LEVELS[required];
}

// Helper function to get tech level numeric index
export function getTechLevelIndex(techLevel: TechLevel): number {
  return TECH_LEVELS[techLevel];
}

// Drive models - complete sA to sZ
export const DRIVE_MODELS = [
  'sA', 'sB', 'sC', 'sD', 'sE', 'sF', 'sG', 'sH', 'sJ', 'sK',
  'sL', 'sM', 'sN', 'sP', 'sQ', 'sR', 'sS', 'sT', 'sU', 'sV',
  'sW', 'sX', 'sY', 'sZ'
] as const;

export type DriveModel = typeof DRIVE_MODELS[number];

// Drive type definitions
export type DriveType = 'gravitic_m' | 'reaction_m' | 'fusion_p' | 'chemical_p';

export interface DriveSpec {
  tonnage: number;
  cost: number; // in MCr
}

// Drive specifications table
export const DRIVE_SPECS: Record<DriveType, Record<DriveModel, DriveSpec>> = {
  gravitic_m: {
    sA: { tonnage: 0.5, cost: 1 },
    sB: { tonnage: 1, cost: 2 },
    sC: { tonnage: 1.5, cost: 3 },
    sD: { tonnage: 2, cost: 3.5 },
    sE: { tonnage: 2.5, cost: 4 },
    sF: { tonnage: 3, cost: 6 },
    sG: { tonnage: 3.5, cost: 8 },
    sH: { tonnage: 4, cost: 9 },
    sJ: { tonnage: 4.5, cost: 10 },
    sK: { tonnage: 5, cost: 11 },
    sL: { tonnage: 6, cost: 12 },
    sM: { tonnage: 7, cost: 14 },
    sN: { tonnage: 8, cost: 16 },
    sP: { tonnage: 9, cost: 18 },
    sQ: { tonnage: 10, cost: 20 },
    sR: { tonnage: 11, cost: 22 },
    sS: { tonnage: 12, cost: 24 },
    sT: { tonnage: 13, cost: 26 },
    sU: { tonnage: 14, cost: 28 },
    sV: { tonnage: 15, cost: 30 },
    sW: { tonnage: 16, cost: 32 },
    sX: { tonnage: 17, cost: 34 },
    sY: { tonnage: 18, cost: 36 },
    sZ: { tonnage: 19, cost: 38 },
  },
  reaction_m: {
    sA: { tonnage: 0.25, cost: 0.5 },
    sB: { tonnage: 0.5, cost: 1 },
    sC: { tonnage: 0.75, cost: 1.5 },
    sD: { tonnage: 1, cost: 2 },
    sE: { tonnage: 1.25, cost: 2.5 },
    sF: { tonnage: 1.5, cost: 3 },
    sG: { tonnage: 1.75, cost: 3.5 },
    sH: { tonnage: 2, cost: 4 },
    sJ: { tonnage: 2.25, cost: 4.5 },
    sK: { tonnage: 2.5, cost: 5 },
    sL: { tonnage: 2.75, cost: 5.5 },
    sM: { tonnage: 3, cost: 6 },
    sN: { tonnage: 3.25, cost: 6.5 },
    sP: { tonnage: 3.5, cost: 7 },
    sQ: { tonnage: 3.75, cost: 7.5 },
    sR: { tonnage: 4, cost: 8 },
    sS: { tonnage: 4.5, cost: 9 },
    sT: { tonnage: 5, cost: 10 },
    sU: { tonnage: 5.5, cost: 11 },
    sV: { tonnage: 6, cost: 12 },
    sW: { tonnage: 6.5, cost: 13 },
    sX: { tonnage: 7, cost: 14 },
    sY: { tonnage: 7.5, cost: 15 },
    sZ: { tonnage: 8, cost: 16 },
  },
  fusion_p: {
    sA: { tonnage: 1.2, cost: 3 },
    sB: { tonnage: 1.5, cost: 3.5 },
    sC: { tonnage: 1.8, cost: 4 },
    sD: { tonnage: 2.1, cost: 4.5 },
    sE: { tonnage: 2.4, cost: 5 },
    sF: { tonnage: 2.7, cost: 5.5 },
    sG: { tonnage: 3, cost: 6 },
    sH: { tonnage: 3.3, cost: 6.5 },
    sJ: { tonnage: 3.6, cost: 7 },
    sK: { tonnage: 3.9, cost: 7.5 },
    sL: { tonnage: 4.5, cost: 8 },
    sM: { tonnage: 5.1, cost: 9 },
    sN: { tonnage: 5.7, cost: 10 },
    sP: { tonnage: 6.3, cost: 12 },
    sQ: { tonnage: 6.9, cost: 14 },
    sR: { tonnage: 7.5, cost: 16 },
    sS: { tonnage: 8.1, cost: 18 },
    sT: { tonnage: 8.7, cost: 20 },
    sU: { tonnage: 9.3, cost: 22 },
    sV: { tonnage: 9.9, cost: 24 },
    sW: { tonnage: 10.5, cost: 26 },
    sX: { tonnage: 11.1, cost: 28 },
    sY: { tonnage: 11.7, cost: 30 },
    sZ: { tonnage: 12.3, cost: 32 },
  },
  chemical_p: {
    sA: { tonnage: 2, cost: 1 },
    sB: { tonnage: 2.5, cost: 1.25 },
    sC: { tonnage: 3, cost: 1.5 },
    sD: { tonnage: 3.5, cost: 1.75 },
    sE: { tonnage: 4, cost: 2 },
    sF: { tonnage: 4.5, cost: 2.25 },
    sG: { tonnage: 5, cost: 2.5 },
    sH: { tonnage: 5.5, cost: 2.75 },
    sJ: { tonnage: 6, cost: 3 },
    sK: { tonnage: 6.5, cost: 3.25 },
    sL: { tonnage: 7, cost: 3.5 },
    sM: { tonnage: 7.5, cost: 3.75 },
    sN: { tonnage: 8, cost: 4 },
    sP: { tonnage: 8.5, cost: 4.25 },
    sQ: { tonnage: 9, cost: 4.5 },
    sR: { tonnage: 10, cost: 5 },
    sS: { tonnage: 11, cost: 5.5 },
    sT: { tonnage: 12, cost: 6 },
    sU: { tonnage: 13, cost: 6.5 },
    sV: { tonnage: 14, cost: 7 },
    sW: { tonnage: 15, cost: 7.5 },
    sX: { tonnage: 16, cost: 8 },
    sY: { tonnage: 17, cost: 8.5 },
    sZ: { tonnage: 18, cost: 9 },
  },
};

// Get drive specification
export function getDriveSpec(driveType: DriveType, model: DriveModel): DriveSpec {
  return DRIVE_SPECS[driveType][model];
}

// Get drive display name
export function getDriveTypeName(driveType: DriveType): string {
  const names: Record<DriveType, string> = {
    gravitic_m: 'Gravitic M-Drive',
    reaction_m: 'Reaction M-Drive',
    fusion_p: 'Fusion P-Plant',
    chemical_p: 'Chemical P-Plant',
  };
  return names[driveType];
}

// Weapon types (simplified - to be expanded)
export const WEAPON_TYPES = [
  'pulse_laser',
  'beam_laser',
  'missile_rack',
  'sandcaster',
  'particle_beam',
] as const;

export type WeaponType = typeof WEAPON_TYPES[number];

// Fitting types (simplified - to be expanded)
export const FITTING_TYPES = [
  'cockpit',
  'control_cabin',
  'airlock',
  'cabin_space',
  'mini_berth',
  'full_berth',
] as const;

export type FittingType = typeof FITTING_TYPES[number];

// Mass calculation constants
export const FUEL_MASS_PER_TON = 1.0;
export const ARMOR_MASS_MULTIPLIER = 0.05; // 5% per armor point

// Hull cost calculation (in MCr - MegaCredits)
// Based on hull size ranges
export function getHullCode(tonnage: number): string {
  if (tonnage <= 10) return 's1';
  if (tonnage <= 20) return 's2';
  if (tonnage <= 30) return 's3';
  if (tonnage <= 40) return 's4';
  if (tonnage <= 50) return 's5';
  if (tonnage <= 60) return 's6';
  if (tonnage <= 70) return 's7';
  if (tonnage <= 80) return 's8';
  if (tonnage <= 90) return 's9';
  if (tonnage <= 100) return 's10';
  return 's10'; // Default to s10 for anything over 100
}

export function getHullCost(tonnage: number): number {
  // Returns cost in MegaCredits (MCr)
  if (tonnage <= 10) return 1.0;
  if (tonnage <= 20) return 1.2;
  if (tonnage <= 30) return 1.3;
  if (tonnage <= 40) return 1.4;
  if (tonnage <= 50) return 1.5;
  if (tonnage <= 60) return 1.6;
  if (tonnage <= 70) return 1.7;
  if (tonnage <= 80) return 1.8;
  if (tonnage <= 90) return 1.9;
  if (tonnage <= 100) return 2.0;
  return 2.0; // Default to 2.0 MCr for anything over 100
}

// Helper function to convert MCr to Credits
export function mcrToCredits(mcr: number): number {
  return mcr * 1000000;
}

// Armor type definitions
export interface ArmorTypeDefinition {
  name: string;
  minTechLevel: number; // Minimum TL required
  protectionPer5Percent: number; // Protection points per 5% of hull tonnage
  costPercentOfHull: number; // Cost as percentage of base hull cost (per 5% protection)
  getMaxArmor: (techLevel: number) => number; // Function to calculate max armor
}

export const ARMOR_TYPES: { [key: string]: ArmorTypeDefinition } = {
  titanium_steel: {
    name: 'Titanium Steel',
    minTechLevel: 7,
    protectionPer5Percent: 2,
    costPercentOfHull: 5,
    getMaxArmor: (techLevel: number) => Math.min(techLevel, 9),
  },
  crystaliron: {
    name: 'Crystaliron',
    minTechLevel: 10,
    protectionPer5Percent: 4,
    costPercentOfHull: 20,
    getMaxArmor: (techLevel: number) => Math.min(techLevel, 13),
  },
  bonded_superdense: {
    name: 'Bonded Superdense',
    minTechLevel: 14,
    protectionPer5Percent: 6,
    costPercentOfHull: 50,
    getMaxArmor: (techLevel: number) => techLevel,
  },
};

// Calculate armor mass in tons
export function calculateArmorMass(
  rating: number,
  armorType: ArmorTypeDefinition,
  hullTonnage: number
): number {
  // Each armor point requires (5% / protectionPer5Percent) of hull tonnage
  const percentPerPoint = 5 / armorType.protectionPer5Percent;
  const totalPercent = rating * percentPerPoint;
  const tons = (hullTonnage * totalPercent) / 100;

  // Minimum 1 ton
  return Math.max(tons, 1);
}

// Calculate armor cost in credits
export function calculateArmorCost(
  rating: number,
  armorType: ArmorTypeDefinition,
  baseHullCost: number
): number {
  // Cost per armor point = (costPercentOfHull * baseHullCost / 100) / protectionPer5Percent
  const costPerPoint = (armorType.costPercentOfHull * baseHullCost) / (100 * armorType.protectionPer5Percent);
  return costPerPoint * rating;
}

// Get available armor types for a given tech level
export function getAvailableArmorTypes(techLevel: string): ArmorTypeDefinition[] {
  const tlNumber = TECH_LEVELS[techLevel as TechLevel];
  if (!tlNumber) return [];

  return Object.values(ARMOR_TYPES).filter((armor) => tlNumber >= armor.minTechLevel);
}
