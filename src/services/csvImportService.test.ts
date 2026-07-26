import { extractHeaderInfo, importFromCSV } from './csvImportService';

describe('extractHeaderInfo', () => {
  test('falls back to the filename when there is no name line', () => {
    const result = extractHeaderInfo('Category,Item,Tons,Cost\n', 'my-ship.csv');
    expect(result.shipName).toBe('my-ship');
    expect(result.description).toBe('');
    expect(result.hullTonnage).toBe(0);
  });

  test('parses name, description, and hull lines in order', () => {
    const csv = [
      'name,Serenity',
      'Description,A rugged transport',
      'Hull,90 tons,98.1 MCr',
      'Category,Item,Tons,Cost',
    ].join('\n');

    const result = extractHeaderInfo(csv, 'ignored.csv');
    expect(result.shipName).toBe('Serenity');
    expect(result.description).toBe('A rugged transport');
    expect(result.hullTonnage).toBe(90);
    expect(result.hullCost).toBe(98100000);
    expect(result.remainingContent).toBe('Category,Item,Tons,Cost');
  });

  test('unescapes quoted values including embedded commas and escaped quotes', () => {
    const csv = 'name,"Serenity, ""The Wreck"""\nCategory,Item,Tons,Cost';
    const result = extractHeaderInfo(csv, 'ignored.csv');
    expect(result.shipName).toBe('Serenity, "The Wreck"');
  });

  test('handles a name line with no description or hull line present', () => {
    const csv = 'name,Solo Ship';
    const result = extractHeaderInfo(csv, 'ignored.csv');
    expect(result.shipName).toBe('Solo Ship');
    expect(result.hullTonnage).toBe(0);
    expect(result.remainingContent).toBe('');
  });
});

describe('importFromCSV', () => {
  const csv = [
    'name,Serenity',
    'Description,A rugged transport',
    'Hull,90 tons,98.1 MCr',
    'Category,Item,Tons,Cost',
    'Hull,S9 (90 tons),90,98.1',
    'Armor,Titanium Rating 4,9,4.9',
    'Drives,Maneuver Model sF (4G),3,6',
    'Drives,PowerPlant Model sD (2),2.1,4.5',
    'Fuel,20 tons for 4 weeks,20,0',
    'Fittings,Cockpit x2,3,0',
    'Weapons,Pulse Laser Turret x1 (Single),1,1.7',
    'Cargo,Cargo Bay 10 tons,10,0',
    'Cargo,Modular Cutter Bay,30,0',
    'Staff,Pilots: 1,0,0',
    'Staff,Gunners: 2,0,0',
    'Staff,Engineer: 1,0,0',
    'TOTALS,,155,115.2',
  ].join('\n');

  test('parses the header into name, description, and hull', () => {
    const design = importFromCSV(csv, 'ignored.csv');
    expect(design.name).toBe('Serenity');
    expect(design.description).toBe('A rugged transport');
    expect(design.hull.tonnage).toBe(90);
    expect(design.hull.cost).toBe(98100000);
    expect(design.hull.tonnageCode).toBe('s9');
  });

  test('parses armor rating and type', () => {
    const design = importFromCSV(csv, 'ignored.csv');
    expect(design.armor).toEqual({
      type: 'Titanium',
      rating: 4,
      mass: 9,
      cost: 4900000,
    });
  });

  test('parses drives with model and mass/cost', () => {
    const design = importFromCSV(csv, 'ignored.csv');
    expect(design.drives).toHaveLength(2);
    expect(design.drives[0]).toMatchObject({ type: 'maneuver', model: 'sF', rating: 4, mass: 3 });
    expect(design.drives[1]).toMatchObject({ type: 'powerplant', model: 'sD', rating: 2, mass: 2.1 });
  });

  test('parses fuel amount and duration', () => {
    const design = importFromCSV(csv, 'ignored.csv');
    expect(design.fuel.amount).toBe(20);
    expect(design.fuel.mass).toBe(20);
  });

  test('parses fittings with quantity extracted from the name', () => {
    const design = importFromCSV(csv, 'ignored.csv');
    expect(design.fittings).toHaveLength(1);
    expect(design.fittings[0]).toMatchObject({ name: 'Cockpit', quantity: 2, mass: 3 });
  });

  test('parses weapons, skipping "Unarmed" rows', () => {
    const design = importFromCSV(csv, 'ignored.csv');
    expect(design.weapons).toHaveLength(1);
    expect(design.weapons[0]).toMatchObject({ name: 'Pulse Laser Turret', mountType: 'Single', quantity: 1 });
  });

  test('parses cargo bay tons and modular cutter bay flag', () => {
    const design = importFromCSV(csv, 'ignored.csv');
    expect(design.cargo.cargoBay).toBe(10);
    expect(design.cargo.modularCutterBay).toBe(true);
  });

  test('parses staff counts and boolean roles', () => {
    const design = importFromCSV(csv, 'ignored.csv');
    expect(design.staff.pilot).toBe(1);
    expect(design.staff.gunner).toBe(2);
    expect(design.staff.engineer).toBe(true);
    expect(design.staff.comms).toBe(false);
  });

  test('produces a minimal skeleton design for an empty CSV', () => {
    const design = importFromCSV('Category,Item,Tons,Cost\n', 'empty.csv');
    expect(design.name).toBe('empty');
    expect(design.drives).toEqual([]);
    expect(design.weapons).toEqual([]);
    expect(design.armor).toBeUndefined();
  });
});
