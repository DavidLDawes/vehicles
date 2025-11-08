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

// Drive performance table - performance rating by hull tonnage
// null means drive is not available for that tonnage
export const DRIVE_PERFORMANCE: Record<DriveModel, Record<number, number | null>> = {
  sA: { 10: 2, 20: 1, 30: null, 40: null, 50: null, 60: null, 70: null, 80: null, 90: null, 100: null },
  sB: { 10: 4, 20: 2, 30: 1, 40: 1, 50: null, 60: null, 70: null, 80: null, 90: null, 100: null },
  sC: { 10: 6, 20: 3, 30: 2, 40: 1, 50: 1, 60: 1, 70: null, 80: null, 90: null, 100: null },
  sD: { 10: 8, 20: 4, 30: 2, 40: 2, 50: 1, 60: 1, 70: 1, 80: 1, 90: null, 100: null },
  sE: { 10: 10, 20: 5, 30: 3, 40: 2, 50: 2, 60: 1, 70: 1, 80: 1, 90: 1, 100: 1 },
  sF: { 10: 12, 20: 6, 30: 4, 40: 3, 50: 2, 60: 2, 70: 1, 80: 1, 90: 1, 100: 1 },
  sG: { 10: null, 20: 7, 30: 4, 40: 3, 50: 2, 60: 2, 70: 2, 80: 2, 90: 1, 100: 1 },
  sH: { 10: null, 20: 8, 30: 5, 40: 4, 50: 3, 60: 2, 70: 2, 80: 2, 90: 2, 100: 2 },
  sJ: { 10: null, 20: 9, 30: 6, 40: 4, 50: 3, 60: 3, 70: 2, 80: 2, 90: 2, 100: 2 },
  sK: { 10: null, 20: 10, 30: 6, 40: 5, 50: 4, 60: 3, 70: 3, 80: 3, 90: 2, 100: 2 },
  sL: { 10: null, 20: 11, 30: 7, 40: 5, 50: 4, 60: 3, 70: 3, 80: 3, 90: 3, 100: 3 },
  sM: { 10: null, 20: 12, 30: 8, 40: 6, 50: 4, 60: 4, 70: 3, 80: 3, 90: 3, 100: 3 },
  sN: { 10: null, 20: 13, 30: 8, 40: 6, 50: 5, 60: 4, 70: 4, 80: 4, 90: 3, 100: 3 },
  sP: { 10: null, 20: 14, 30: 9, 40: 7, 50: 5, 60: 4, 70: 4, 80: 4, 90: 4, 100: 4 },
  sQ: { 10: null, 20: null, 30: 10, 40: 7, 50: 6, 60: 5, 70: 4, 80: 4, 90: 4, 100: 4 },
  sR: { 10: null, 20: null, 30: 10, 40: 8, 50: 6, 60: 5, 70: 5, 80: 5, 90: 4, 100: 4 },
  sS: { 10: null, 20: null, 30: 11, 40: 8, 50: 6, 60: 5, 70: 5, 80: 5, 90: 5, 100: 5 },
  sT: { 10: null, 20: null, 30: 12, 40: 9, 50: 7, 60: 6, 70: 5, 80: 5, 90: 5, 100: 5 },
  sU: { 10: null, 20: null, 30: 12, 40: 9, 50: 7, 60: 6, 70: 6, 80: 5, 90: 5, 100: 5 },
  sV: { 10: null, 20: null, 30: 13, 40: 10, 50: 8, 60: 6, 70: 6, 80: 6, 90: 5, 100: 5 },
  sW: { 10: null, 20: null, 30: 14, 40: 10, 50: 8, 60: 7, 70: 6, 80: 6, 90: 6, 100: 5 },
  sX: { 10: null, 20: null, 30: 14, 40: 11, 50: 8, 60: 7, 70: 6, 80: 6, 90: 6, 100: 6 },
  sY: { 10: null, 20: null, 30: 15, 40: 11, 50: 9, 60: 7, 70: 6, 80: 6, 90: 6, 100: 6 },
  sZ: { 10: null, 20: null, 30: 16, 40: 12, 50: 9, 60: 8, 70: 6, 80: 6, 90: 6, 100: 6 },
};

// Get drive performance for a given model and hull tonnage
export function getDrivePerformance(model: DriveModel, tonnage: number): number | null {
  // Round tonnage to nearest 10 for lookup
  const roundedTonnage = Math.ceil(tonnage / 10) * 10;
  if (roundedTonnage < 10 || roundedTonnage > 100) return null;

  return DRIVE_PERFORMANCE[model][roundedTonnage];
}

// Get available drive models for a given hull tonnage
export function getAvailableDriveModels(tonnage: number): DriveModel[] {
  return DRIVE_MODELS.filter((model) => getDrivePerformance(model, tonnage) !== null);
}

// Check if a reaction drive would consume too much fuel (>90% hull tonnage per hour)
export function isReactionDriveValid(model: DriveModel, tonnage: number): boolean {
  const performance = getDrivePerformance(model, tonnage);
  if (performance === null) return false;

  // Calculate fuel consumption for 1 hour
  const fuelPerHour = calculateManeuverDriveFuel('reaction_m', performance, tonnage, 1);

  // Check if it's less than 90% of hull tonnage
  return fuelPerHour < (tonnage * 0.9);
}

// Get available drive models filtered by drive type and fuel constraints
export function getAvailableDriveModelsForType(
  tonnage: number,
  driveType: DriveType
): DriveModel[] {
  const baseDrives = getAvailableDriveModels(tonnage);

  // For reaction drives, filter out those that would consume >90% fuel per hour
  if (driveType === 'reaction_m') {
    return baseDrives.filter((model) => isReactionDriveValid(model, tonnage));
  }

  return baseDrives;
}

// Format performance rating with prefix (M- for maneuver, P- for power plant)
export function formatPerformanceRating(
  performance: number | null,
  driveCategory: 'maneuver' | 'powerPlant'
): string {
  if (performance === null) return 'N/A';
  const prefix = driveCategory === 'maneuver' ? 'M' : 'P';
  return `${prefix}-${performance}`;
}

// Fuel requirements for fusion power plants (tons for 2 weeks operation)
export const FUSION_FUEL_REQUIREMENTS: Record<DriveModel, number> = {
  sA: 1,
  sB: 1,
  sC: 1,
  sD: 1,
  sE: 1.5,
  sF: 1.5,
  sG: 1.5,
  sH: 1.5,
  sJ: 2,
  sK: 2,
  sL: 2,
  sM: 2,
  sN: 2.5,
  sP: 2.5,
  sQ: 2.5,
  sR: 2.5,
  sS: 3,
  sT: 3,
  sU: 3,
  sV: 3,
  sW: 3.5,
  sX: 3.5,
  sY: 3.5,
  sZ: 3.5,
};

// Fuel requirements for chemical power plants (tons for 2 weeks operation)
export const CHEMICAL_FUEL_REQUIREMENTS: Record<DriveModel, number> = {
  sA: 5,
  sB: 10,
  sC: 15,
  sD: 20,
  sE: 25,
  sF: 30,
  sG: 35,
  sH: 40,
  sJ: 45,
  sK: 50,
  sL: 55,
  sM: 60,
  sN: 65,
  sP: 70,
  sQ: 75,
  sR: 80,
  sS: 85,
  sT: 90,
  sU: 95,
  sV: 100,
  sW: 105,
  sX: 110,
  sY: 115,
  sZ: 120,
};

// Calculate fuel requirement for a power plant
export function calculatePowerPlantFuel(
  driveType: DriveType,
  model: DriveModel,
  weeks: number
): number {
  if (driveType === 'fusion_p') {
    return FUSION_FUEL_REQUIREMENTS[model] * (weeks / 2);
  } else if (driveType === 'chemical_p') {
    return CHEMICAL_FUEL_REQUIREMENTS[model] * (weeks / 2);
  }
  return 0;
}

// Calculate fuel requirement for a maneuver drive (reaction only, gravitic uses no fuel)
export function calculateManeuverDriveFuel(
  driveType: DriveType,
  performance: number,
  hullTonnage: number,
  hours: number
): number {
  if (driveType === 'reaction_m') {
    // 2.5% of hull tonnage per point of maneuver per hour
    return (hullTonnage * 0.025 * performance * hours);
  }
  // Gravitic drives use no fuel
  return 0;
}

// Calculate total fuel requirement for all drives
export function calculateTotalFuelRequirement(
  drives: Array<{
    type: 'powerPlant' | 'maneuver' | 'jump';
    driveType?: string;
    model: string;
    performance?: number;
  }>,
  hullTonnage: number,
  powerPlantWeeks: number,
  maneuverHours: number
): { total: number; breakdown: { powerPlant: number; maneuver: number } } {
  let powerPlantFuel = 0;
  let maneuverFuel = 0;

  drives.forEach((drive) => {
    if (drive.type === 'powerPlant' && drive.driveType) {
      const fuel = calculatePowerPlantFuel(
        drive.driveType as DriveType,
        drive.model as DriveModel,
        powerPlantWeeks
      );
      powerPlantFuel += fuel;
    } else if (drive.type === 'maneuver' && drive.driveType && drive.performance) {
      const fuel = calculateManeuverDriveFuel(
        drive.driveType as DriveType,
        drive.performance,
        hullTonnage,
        maneuverHours
      );
      maneuverFuel += fuel;
    }
  });

  return {
    total: powerPlantFuel + maneuverFuel,
    breakdown: { powerPlant: powerPlantFuel, maneuver: maneuverFuel },
  };
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

// Ship weapon specifications
export interface ShipWeaponSpec {
  name: string;
  mass: number; // tons
  cost: number; // credits
  slotsUsed: number; // number of ship weapon slots consumed
  energyWeapons: number; // number of energy weapons (individual lasers or beams)
  minTonnage?: number; // minimum hull tonnage required
}

export const SHIP_WEAPONS: Record<string, ShipWeaponSpec> = {
  pulse_laser_single: {
    name: 'Single Pulse Laser Turret',
    mass: 1,
    cost: 1700000, // 1.7 MCr
    slotsUsed: 1,
    energyWeapons: 1, // 1 laser = 1 energy weapon
  },
  pulse_laser_double: {
    name: 'Double Pulse Laser Turret',
    mass: 1,
    cost: 2500000, // 2.5 MCr
    slotsUsed: 1,
    energyWeapons: 2, // 2 lasers = 2 energy weapons
  },
  pulse_laser_triple: {
    name: 'Triple Pulse Laser Turret',
    mass: 1,
    cost: 3500000, // 3.5 MCr
    slotsUsed: 1,
    energyWeapons: 3, // 3 lasers = 3 energy weapons
  },
  beam_laser_single: {
    name: 'Single Beam Laser Turret',
    mass: 1,
    cost: 2200000, // 2.2 MCr
    slotsUsed: 1,
    energyWeapons: 1, // 1 laser = 1 energy weapon
  },
  beam_laser_double: {
    name: 'Double Beam Laser Turret',
    mass: 1,
    cost: 3500000, // 3.5 MCr
    slotsUsed: 1,
    energyWeapons: 2, // 2 lasers = 2 energy weapons
  },
  beam_laser_triple: {
    name: 'Triple Beam Laser Turret',
    mass: 1,
    cost: 5000000, // 5 MCr
    slotsUsed: 1,
    energyWeapons: 3, // 3 lasers = 3 energy weapons
  },
  particle_beam_barbette: {
    name: 'Particle Beam Barbette',
    mass: 10,
    cost: 5500000, // 5.5 MCr
    slotsUsed: 2,
    energyWeapons: 2, // Barbette = 2 energy weapons
    minTonnage: 40, // Requires 40+ ton hull
  },
  torpedo: {
    name: 'Torpedo',
    mass: 2.5,
    cost: 2000000, // 2 MCr
    slotsUsed: 1,
    energyWeapons: 0, // No energy required
  },
};

// Get available ship weapons for a given hull tonnage
export function getAvailableShipWeapons(tonnage: number): Record<string, ShipWeaponSpec> {
  const available: Record<string, ShipWeaponSpec> = {};

  for (const [key, spec] of Object.entries(SHIP_WEAPONS)) {
    if (!spec.minTonnage || tonnage >= spec.minTonnage) {
      available[key] = spec;
    }
  }

  return available;
}

// Calculate required gunners based on weapons
// - 1 gunner per Particle Beam Barbette
// - 1 gunner total if any Torpedoes are present
// - 1 gunner per turret TYPE (pulse_laser, beam_laser, etc.)
export function calculateRequiredGunners(
  weapons: Array<{ type: string; category?: string }>
): number {
  let gunners = 0;

  const shipWeapons = weapons.filter((w) => w.category === 'ship');

  if (shipWeapons.length === 0) return 0;

  // Count particle beam barbettes (1 gunner each)
  const barbetteCount = shipWeapons.filter((w) => w.type === 'particle_beam_barbette').length;
  gunners += barbetteCount;

  // Add 1 gunner if any torpedoes are present
  const hasTorpedoes = shipWeapons.some((w) => w.type === 'torpedo');
  if (hasTorpedoes) gunners += 1;

  // Track unique turret types
  const turretTypes = new Set<string>();

  shipWeapons.forEach((weapon) => {
    // Extract base turret type (pulse_laser, beam_laser)
    if (weapon.type.startsWith('pulse_laser_')) {
      turretTypes.add('pulse_laser');
    } else if (weapon.type.startsWith('beam_laser_')) {
      turretTypes.add('beam_laser');
    }
  });

  // Add 1 gunner per unique turret type
  gunners += turretTypes.size;

  return gunners;
}

// Weapon limits by small craft tonnage
export interface WeaponLimits {
  shipWeapons: number;
  antiPersonnelWeapons: number;
}

export const WEAPON_LIMITS: Record<number, WeaponLimits> = {
  10: { shipWeapons: 1, antiPersonnelWeapons: 1 },
  20: { shipWeapons: 1, antiPersonnelWeapons: 2 },
  30: { shipWeapons: 1, antiPersonnelWeapons: 3 },
  40: { shipWeapons: 2, antiPersonnelWeapons: 4 },
  50: { shipWeapons: 2, antiPersonnelWeapons: 5 },
  60: { shipWeapons: 2, antiPersonnelWeapons: 6 },
  70: { shipWeapons: 3, antiPersonnelWeapons: 7 },
  80: { shipWeapons: 3, antiPersonnelWeapons: 8 },
  90: { shipWeapons: 4, antiPersonnelWeapons: 9 },
  100: { shipWeapons: 5, antiPersonnelWeapons: 10 },
};

// Get weapon limits for a given hull tonnage
export function getWeaponLimits(tonnage: number): WeaponLimits {
  // Round up to nearest 10
  const roundedTonnage = Math.ceil(tonnage / 10) * 10;
  const clampedTonnage = Math.max(10, Math.min(100, roundedTonnage));
  return WEAPON_LIMITS[clampedTonnage];
}

// Energy weapon capacity by power plant size
export function getEnergyWeaponCapacity(powerPlantModel: DriveModel | null): number {
  if (!powerPlantModel) return 0;

  const modelIndex = DRIVE_MODELS.indexOf(powerPlantModel);
  if (modelIndex === -1) return 0;

  // sA-sF (indices 0-5): 0 energy weapons
  if (modelIndex <= 5) return 0;
  // sG-sK (indices 6-10): 1 energy weapon
  if (modelIndex <= 10) return 1;
  // sL-sR (indices 11-17): 2 energy weapons
  if (modelIndex <= 17) return 2;
  // sS-sZ (indices 18-23): 3 energy weapons
  return 3;
}

// Calculate total energy weapon capacity from all power plants
// Multiple power plants add their capacities together
export function calculateTotalEnergyWeaponCapacity(
  drives: Array<{ type: string; model: string }>
): number {
  let totalCapacity = 0;

  const powerPlants = drives.filter((d) => d.type === 'powerPlant');

  powerPlants.forEach((powerPlant) => {
    const capacity = getEnergyWeaponCapacity(powerPlant.model as DriveModel);
    totalCapacity += capacity;
  });

  return totalCapacity;
}

// Check if a weapon is an energy weapon
export function isEnergyWeapon(weaponType: string): boolean {
  return (
    weaponType.startsWith('pulse_laser_') ||
    weaponType.startsWith('beam_laser_') ||
    weaponType === 'particle_beam_barbette'
  );
}

// Calculate energy weapon count (individual lasers and beams)
// - Single turrets: 1 energy weapon
// - Double turrets: 2 energy weapons
// - Triple turrets: 3 energy weapons
// - Particle beam barbettes: 2 energy weapons
export function calculateEnergyWeaponCount(weapons: Array<{ type: string; category?: string }>): number {
  let count = 0;

  const shipWeapons = weapons.filter((w) => w.category === 'ship');

  shipWeapons.forEach((weapon) => {
    const weaponSpec = SHIP_WEAPONS[weapon.type];
    if (weaponSpec && weaponSpec.energyWeapons > 0) {
      count += weaponSpec.energyWeapons;
    }
  });

  return count;
}

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

// Cockpit and Control Cabin specifications
export interface CockpitSpec {
  name: string;
  tonsPerCrew: number;
  allowsPassengers: boolean;
  passengerRatio?: number; // passengers = floor(crew * ratio)
}

export const COCKPIT_SPECS: Record<'cockpit' | 'control_cabin', CockpitSpec> = {
  cockpit: {
    name: 'Cockpit',
    tonsPerCrew: 1.5,
    allowsPassengers: false,
  },
  control_cabin: {
    name: 'Control Cabin',
    tonsPerCrew: 3,
    allowsPassengers: true,
    passengerRatio: 0.5, // floor(crew * 0.5) passengers
  },
};

// Calculate mass for cockpit/control cabin
export function calculateCockpitMass(type: 'cockpit' | 'control_cabin', crew: number): number {
  return COCKPIT_SPECS[type].tonsPerCrew * crew;
}

// Calculate cost for cockpit/control cabin
// Cost is 0.1 MCr per 20 tons of ship, rounded up
export function calculateCockpitCost(hullTonnage: number): number {
  const units = Math.ceil(hullTonnage / 20);
  return units * 100000; // 0.1 MCr = 100,000 credits
}

// Calculate passengers for control cabin
export function calculatePassengers(crew: number): number {
  return Math.floor(crew * 0.5);
}

// Cabin specifications
export const CABIN_TONS_PER_PASSENGER = 1.5;
export const CABIN_COST_PER_TON = 50000; // 0.05 MCr per ton

// Calculate mass for cabins
export function calculateCabinMass(passengers: number): number {
  return passengers * CABIN_TONS_PER_PASSENGER;
}

// Calculate cost for cabins (0.05 MCr per ton)
export function calculateCabinCost(passengers: number): number {
  const tons = calculateCabinMass(passengers);
  return tons * CABIN_COST_PER_TON;
}

// Airlock specifications
export const AIRLOCK_MASS = 1; // 1 ton each
export const AIRLOCK_COST = 200000; // 0.2 MCr each
export const AIRLOCK_MAX_QUANTITY = 6; // Maximum 6 airlocks

// Calculate mass for airlocks
export function calculateAirlockMass(quantity: number): number {
  return quantity * AIRLOCK_MASS;
}

// Calculate cost for airlocks
export function calculateAirlockCost(quantity: number): number {
  return quantity * AIRLOCK_COST;
}

// Fresher specifications
export const FRESHER_MASS = 1; // 1 ton
export const FRESHER_COST = 100000; // 0.1 MCr

// Galley specifications
export const GALLEY_MASS = 0.5; // 0.5 tons
export const GALLEY_COST = 100000; // 0.1 MCr

// Cargo specifications
export const SHIPS_LOCKER_COST_PER_TON = 200000; // 0.2 MCr per ton
export const CARGO_BAY_COST_PER_TON = 0; // Free

// Calculate cost for ship's locker
export function calculateShipsLockerCost(tons: number): number {
  return tons * SHIPS_LOCKER_COST_PER_TON;
}

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
