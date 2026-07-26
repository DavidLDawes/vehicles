import {
  isTechLevelAtLeast,
  getTechLevelIndex,
  getDriveSpec,
  getDriveTypeName,
  getDrivePerformance,
  getAvailableDriveModels,
  isReactionDriveValid,
  getAvailableDriveModelsForType,
  formatPerformanceRating,
  calculatePowerPlantFuel,
  calculateManeuverDriveFuel,
  calculateTotalFuelRequirement,
  getAvailableShipWeapons,
  calculateRequiredGunners,
  getWeaponLimits,
  getEnergyWeaponCapacity,
  calculateTotalEnergyWeaponCapacity,
  isEnergyWeapon,
  calculateEnergyWeaponCount,
  calculateCockpitMass,
  calculateCockpitCost,
  calculatePassengers,
  calculateCabinMass,
  calculateCabinCost,
  calculateAirlockMass,
  calculateAirlockCost,
  calculateShipsLockerCost,
  calculateMissileReloadCost,
  getHullCode,
  getHullCost,
  mcrToCredits,
  calculateArmorMass,
  calculateArmorCost,
  getAvailableArmorTypes,
  calculateElectronicsMass,
  getAvailableElectronics,
  ARMOR_TYPES,
} from './constants';

describe('tech level helpers', () => {
  test('isTechLevelAtLeast compares numeric TL behind the letter codes', () => {
    expect(isTechLevelAtLeast('C', 'A')).toBe(true);
    expect(isTechLevelAtLeast('A', 'C')).toBe(false);
    expect(isTechLevelAtLeast('A', 'A')).toBe(true);
  });

  test('getTechLevelIndex maps letter codes to their TL number', () => {
    expect(getTechLevelIndex('A')).toBe(10);
    expect(getTechLevelIndex('H')).toBe(17);
  });
});

describe('drive specs', () => {
  test('getDriveSpec returns tonnage/cost for a given type and model', () => {
    expect(getDriveSpec('gravitic_m', 'sA')).toEqual({ tonnage: 0.5, cost: 1 });
    expect(getDriveSpec('chemical_p', 'sZ')).toEqual({ tonnage: 18, cost: 9 });
  });

  test('getDriveTypeName returns a human readable label', () => {
    expect(getDriveTypeName('gravitic_m')).toBe('Gravitic M-Drive');
    expect(getDriveTypeName('fusion_p')).toBe('Fusion P-Plant');
  });
});

describe('drive performance / availability', () => {
  test('getDrivePerformance rounds tonnage up to the nearest 10 for lookup', () => {
    expect(getDrivePerformance('sA', 10)).toBe(2);
    expect(getDrivePerformance('sA', 1)).toBe(2); // rounds up to 10
    expect(getDrivePerformance('sA', 11)).toBe(1); // rounds up to 20
  });

  test('getDrivePerformance returns null outside the supported tonnage range', () => {
    expect(getDrivePerformance('sA', 0)).toBeNull();
    expect(getDrivePerformance('sA', 101)).toBeNull();
  });

  test('getDrivePerformance returns null when a model is unavailable at that tonnage', () => {
    expect(getDrivePerformance('sA', 30)).toBeNull();
  });

  test('getAvailableDriveModels only returns models with non-null performance', () => {
    const models = getAvailableDriveModels(10);
    expect(models).toContain('sA');
    expect(models).not.toContain('sG'); // sG has no rating at 10 tons
  });

  test('formatPerformanceRating prefixes maneuver and power plant ratings differently', () => {
    expect(formatPerformanceRating(4, 'maneuver')).toBe('M-4');
    expect(formatPerformanceRating(4, 'powerPlant')).toBe('P-4');
    expect(formatPerformanceRating(null, 'maneuver')).toBe('N/A');
  });
});

describe('fuel calculations', () => {
  test('calculatePowerPlantFuel scales fusion/chemical fuel by weeks / 2', () => {
    expect(calculatePowerPlantFuel('fusion_p', 'sA', 2)).toBe(1);
    expect(calculatePowerPlantFuel('fusion_p', 'sA', 4)).toBe(2);
    expect(calculatePowerPlantFuel('chemical_p', 'sA', 2)).toBe(5);
  });

  test('calculatePowerPlantFuel returns 0 for drive types with no fuel table', () => {
    expect(calculatePowerPlantFuel('gravitic_m', 'sA', 2)).toBe(0);
  });

  test('calculateManeuverDriveFuel charges 2.5% of hull tonnage per performance point per hour for reaction drives', () => {
    expect(calculateManeuverDriveFuel('reaction_m', 4, 100, 1)).toBeCloseTo(10);
    expect(calculateManeuverDriveFuel('reaction_m', 4, 100, 2)).toBeCloseTo(20);
  });

  test('calculateManeuverDriveFuel is free for gravitic drives', () => {
    expect(calculateManeuverDriveFuel('gravitic_m', 10, 100, 5)).toBe(0);
  });

  test('isReactionDriveValid accepts drives within the 90% hourly fuel cutoff', () => {
    // sZ at 30 tons has performance 16 -> 30 * 0.025 * 16 = 12, vs 90% of 30 = 27: valid
    expect(isReactionDriveValid('sZ', 30)).toBe(true);
    // sF at 10 tons has performance 12 -> 10 * 0.025 * 12 = 3, vs 90% of 10 = 9: valid
    expect(isReactionDriveValid('sF', 10)).toBe(true);
  });

  test('isReactionDriveValid is false when the model has no rating at that tonnage', () => {
    expect(isReactionDriveValid('sA', 30)).toBe(false);
  });

  test('getAvailableDriveModelsForType filters reaction drives down to fuel-valid options only', () => {
    const allModels = getAvailableDriveModelsForType(10, 'gravitic_m');
    const reactionModels = getAvailableDriveModelsForType(10, 'reaction_m');
    expect(reactionModels.length).toBeLessThanOrEqual(allModels.length);
  });

  test('calculateTotalFuelRequirement sums power plant and maneuver fuel separately', () => {
    const result = calculateTotalFuelRequirement(
      [
        { type: 'powerPlant', driveType: 'fusion_p', model: 'sA' },
        { type: 'maneuver', driveType: 'reaction_m', model: 'sA', performance: 4 },
        { type: 'jump', model: 'sA' },
      ],
      100,
      2,
      1
    );
    expect(result.breakdown.powerPlant).toBe(1);
    expect(result.breakdown.maneuver).toBeCloseTo(10);
    expect(result.total).toBeCloseTo(11);
  });
});

describe('weapons', () => {
  test('getAvailableShipWeapons excludes weapons above the hull tonnage minimum', () => {
    expect(getAvailableShipWeapons(30)).not.toHaveProperty('particle_beam_barbette');
    expect(getAvailableShipWeapons(40)).toHaveProperty('particle_beam_barbette');
  });

  test('calculateRequiredGunners returns 0 with no ship weapons', () => {
    expect(calculateRequiredGunners([])).toBe(0);
    expect(calculateRequiredGunners([{ type: 'pulse_laser_single', category: 'anti-personnel' }])).toBe(0);
  });

  test('calculateRequiredGunners counts 1 gunner per unique turret type, plus torpedoes/missiles as a group', () => {
    const weapons = [
      { type: 'pulse_laser_single', category: 'ship' },
      { type: 'pulse_laser_double', category: 'ship' }, // same turret type, shouldn't add a 2nd gunner
      { type: 'beam_laser_single', category: 'ship' },
      { type: 'torpedo', category: 'ship' },
      { type: 'missile_launcher_single', category: 'ship' },
    ];
    // pulse_laser (1) + beam_laser (1) + torpedoes (1) + missiles (1) = 4
    expect(calculateRequiredGunners(weapons)).toBe(4);
  });

  test('calculateRequiredGunners adds 1 gunner per particle beam barbette', () => {
    const weapons = [
      { type: 'particle_beam_barbette', category: 'ship' },
      { type: 'particle_beam_barbette', category: 'ship' },
    ];
    expect(calculateRequiredGunners(weapons)).toBe(2);
  });

  test('getWeaponLimits rounds tonnage up to the nearest bracket and clamps to 10-100', () => {
    expect(getWeaponLimits(15)).toEqual({ shipWeapons: 1, antiPersonnelWeapons: 2 });
    expect(getWeaponLimits(1)).toEqual({ shipWeapons: 1, antiPersonnelWeapons: 1 });
    expect(getWeaponLimits(1000)).toEqual({ shipWeapons: 5, antiPersonnelWeapons: 10 });
  });

  test('getEnergyWeaponCapacity scales with power plant model tier', () => {
    expect(getEnergyWeaponCapacity('sA')).toBe(0);
    expect(getEnergyWeaponCapacity('sG')).toBe(1);
    expect(getEnergyWeaponCapacity('sL')).toBe(2);
    expect(getEnergyWeaponCapacity('sS')).toBe(3);
    expect(getEnergyWeaponCapacity(null)).toBe(0);
  });

  test('calculateTotalEnergyWeaponCapacity sums capacity across all power plants only', () => {
    const drives = [
      { type: 'powerPlant', model: 'sG' },
      { type: 'powerPlant', model: 'sL' },
      { type: 'maneuver', model: 'sZ' },
    ];
    expect(calculateTotalEnergyWeaponCapacity(drives)).toBe(3);
  });

  test('isEnergyWeapon identifies laser turrets and particle beams, not missiles/torpedoes', () => {
    expect(isEnergyWeapon('pulse_laser_double')).toBe(true);
    expect(isEnergyWeapon('beam_laser_triple')).toBe(true);
    expect(isEnergyWeapon('particle_beam_barbette')).toBe(true);
    expect(isEnergyWeapon('torpedo')).toBe(false);
    expect(isEnergyWeapon('missile_launcher_single')).toBe(false);
  });

  test('calculateEnergyWeaponCount only counts ship-category weapons with energy weapons', () => {
    const weapons = [
      { type: 'pulse_laser_triple', category: 'ship' },
      { type: 'torpedo', category: 'ship' },
      { type: 'pulse_laser_single', category: 'anti-personnel' },
    ];
    expect(calculateEnergyWeaponCount(weapons)).toBe(3);
  });
});

describe('fittings', () => {
  test('calculateCockpitMass multiplies tons-per-crew by crew count', () => {
    expect(calculateCockpitMass('cockpit', 2)).toBe(3);
    expect(calculateCockpitMass('control_cabin', 2)).toBe(6);
  });

  test('calculateCockpitCost is 0.1 MCr per 20 tons of ship, rounded up', () => {
    expect(calculateCockpitCost(20)).toBe(100000);
    expect(calculateCockpitCost(21)).toBe(200000);
    expect(calculateCockpitCost(40)).toBe(200000);
  });

  test('calculatePassengers floors crew * 0.5', () => {
    expect(calculatePassengers(5)).toBe(2);
    expect(calculatePassengers(4)).toBe(2);
  });

  test('calculateCabinMass/Cost scale with passenger count', () => {
    expect(calculateCabinMass(2)).toBe(3);
    expect(calculateCabinCost(2)).toBe(150000);
  });

  test('calculateAirlockMass/Cost scale linearly with quantity', () => {
    expect(calculateAirlockMass(3)).toBe(3);
    expect(calculateAirlockCost(3)).toBe(600000);
  });
});

describe('cargo costs', () => {
  test('calculateShipsLockerCost is 0.2 MCr per ton', () => {
    expect(calculateShipsLockerCost(5)).toBe(1000000);
  });

  test('calculateMissileReloadCost is 0.25 MCr per ton', () => {
    expect(calculateMissileReloadCost(4)).toBe(1000000);
  });
});

describe('hull cost/code brackets', () => {
  test('getHullCode buckets tonnage into s1-s10', () => {
    expect(getHullCode(10)).toBe('s1');
    expect(getHullCode(11)).toBe('s2');
    expect(getHullCode(100)).toBe('s10');
    expect(getHullCode(150)).toBe('s10');
  });

  test('getHullCost increases with tonnage bracket', () => {
    expect(getHullCost(10)).toBe(1.0);
    expect(getHullCost(100)).toBe(2.0);
    expect(getHullCost(150)).toBe(2.0);
  });

  test('mcrToCredits converts megacredits to credits', () => {
    expect(mcrToCredits(1.5)).toBe(1500000);
  });
});

describe('armor', () => {
  const titaniumSteel = ARMOR_TYPES.titanium_steel;

  test('calculateArmorMass converts rating to tons based on protection-per-5%', () => {
    // titanium_steel: 2 protection per 5% -> rating 2 = 5% of hull tonnage
    expect(calculateArmorMass(2, titaniumSteel, 100)).toBe(5);
  });

  test('calculateArmorMass enforces a 1 ton minimum', () => {
    expect(calculateArmorMass(1, titaniumSteel, 10)).toBe(1);
  });

  test('calculateArmorCost scales with rating and base hull cost', () => {
    // costPercentOfHull 5%, protectionPer5Percent 2 -> 2.5% of hull cost per point
    expect(calculateArmorCost(2, titaniumSteel, 1000000)).toBe(50000);
  });

  test('getAvailableArmorTypes filters by tech level and returns none for an unknown code', () => {
    // TL A = 10: titanium_steel (needs 7) and crystaliron (needs 10) qualify, bonded_superdense (needs 14) does not
    const atA = getAvailableArmorTypes('A');
    expect(atA.map((a) => a.name).sort()).toEqual(['Crystaliron', 'Titanium Steel']);
    expect(getAvailableArmorTypes('G')).toContainEqual(expect.objectContaining({ name: 'Bonded Superdense' }));
    expect(getAvailableArmorTypes('unknown')).toEqual([]);
  });
});

describe('electronics', () => {
  test('getAvailableElectronics filters by minimum tech level', () => {
    // TL A = 10: standard (8), basic_civilian (9), basic_military (10) qualify; advanced (11) does not
    const atA = getAvailableElectronics('A');
    expect(atA).toHaveProperty('standard');
    expect(atA).toHaveProperty('basic_military');
    expect(atA).not.toHaveProperty('advanced');
    expect(getAvailableElectronics('unknown')).toEqual({});
  });

  test('calculateElectronicsMass treats Standard electronics as free in a control cabin', () => {
    expect(calculateElectronicsMass('standard', false, true)).toBe(0);
  });

  test('calculateElectronicsMass charges 0.2 tons for Standard electronics in a cockpit only', () => {
    expect(calculateElectronicsMass('standard', true, false)).toBe(0.2);
  });

  test('calculateElectronicsMass uses the spec mass for non-Standard electronics', () => {
    expect(calculateElectronicsMass('advanced', true, false)).toBe(3);
  });

  test('calculateElectronicsMass returns 0 for an unknown electronics type', () => {
    expect(calculateElectronicsMass('nonexistent', true, false)).toBe(0);
  });
});
