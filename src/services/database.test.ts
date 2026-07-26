import { IDBFactory } from 'fake-indexeddb';
import 'fake-indexeddb/auto';
import {
  saveSmallCraft,
  loadAllSmallCraft,
  loadSmallCraftById,
  deleteSmallCraft,
  checkNameExists,
} from './database';
import { SmallCraftDesign } from '../types/ship';

function makeDesign(overrides: Partial<SmallCraftDesign> = {}): SmallCraftDesign {
  return {
    name: 'Test Craft',
    hull: {
      name: 'Test Craft',
      techLevel: 'A',
      tonnageCode: 's1',
      tonnage: 10,
      cost: 1000000,
    },
    drives: [],
    fuel: { amount: 0, duration: 0, mass: 0 },
    fittings: [],
    weapons: [],
    cargo: { cargoBay: 0, shipsLocker: 0 },
    staff: {
      pilot: 1,
      gunner: 0,
      engineer: false,
      comms: false,
      sensors: false,
      ecm: false,
      other: 0,
    },
    ...overrides,
  };
}

beforeEach(() => {
  // Fresh in-memory database per test so writes don't leak across tests.
  globalThis.indexedDB = new IDBFactory() as unknown as IDBFactory;
});

describe('saveSmallCraft', () => {
  test('assigns an auto-incrementing id and timestamps on first save', async () => {
    const id = await saveSmallCraft(makeDesign());
    expect(id).toBe(1);

    const [saved] = await loadAllSmallCraft();
    expect(saved.name).toBe('Test Craft');
    expect(saved.createdAt).toBeDefined();
    expect(saved.updatedAt).toBeDefined();
  });

  test('updates an existing record in place when id is set', async () => {
    const id = await saveSmallCraft(makeDesign());
    const original = await loadSmallCraftById(id);

    await saveSmallCraft({ ...original!, name: 'Renamed Craft' });

    const all = await loadAllSmallCraft();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Renamed Craft');
  });

  test('preserves the original createdAt across updates', async () => {
    const id = await saveSmallCraft(makeDesign());
    const original = await loadSmallCraftById(id);
    const originalCreatedAt = original!.createdAt;

    await saveSmallCraft({ ...original!, name: 'Renamed Craft' });
    const updated = await loadSmallCraftById(id);

    expect(updated!.createdAt).toBe(originalCreatedAt);
  });

  test('rejects saving two designs with the same name (unique index)', async () => {
    await saveSmallCraft(makeDesign({ name: 'Duplicate' }));
    await expect(saveSmallCraft(makeDesign({ name: 'Duplicate' }))).rejects.toThrow();
  });
});

describe('loadAllSmallCraft / loadSmallCraftById', () => {
  test('loadAllSmallCraft returns an empty array when nothing is stored', async () => {
    expect(await loadAllSmallCraft()).toEqual([]);
  });

  test('loadSmallCraftById returns undefined for a missing id', async () => {
    expect(await loadSmallCraftById(999)).toBeUndefined();
  });

  test('loadAllSmallCraft returns every saved design', async () => {
    await saveSmallCraft(makeDesign({ name: 'Craft A' }));
    await saveSmallCraft(makeDesign({ name: 'Craft B' }));

    const all = await loadAllSmallCraft();
    expect(all.map((c) => c.name).sort()).toEqual(['Craft A', 'Craft B']);
  });
});

describe('deleteSmallCraft', () => {
  test('removes the design with the given id', async () => {
    const id = await saveSmallCraft(makeDesign());
    await deleteSmallCraft(id);
    expect(await loadAllSmallCraft()).toEqual([]);
  });

  test('resolves without error when deleting a non-existent id', async () => {
    await expect(deleteSmallCraft(12345)).resolves.toBeUndefined();
  });
});

describe('checkNameExists', () => {
  test('returns false when no design has that name', async () => {
    expect(await checkNameExists('Nobody')).toBe(false);
  });

  test('returns true when a design already has that name', async () => {
    await saveSmallCraft(makeDesign({ name: 'Existing' }));
    expect(await checkNameExists('Existing')).toBe(true);
  });

  test('returns false when the only match is the excluded id (editing self)', async () => {
    const id = await saveSmallCraft(makeDesign({ name: 'Self' }));
    expect(await checkNameExists('Self', id)).toBe(false);
  });

  test('returns true when the match belongs to a different id than excluded', async () => {
    const id = await saveSmallCraft(makeDesign({ name: 'Self' }));
    expect(await checkNameExists('Self', id + 1)).toBe(true);
  });
});
