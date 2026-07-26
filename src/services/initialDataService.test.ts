import { initializeDatabase } from './initialDataService';
import * as database from './database';
import { SmallCraftDesign } from '../types/ship';

jest.mock('./database');

const mockLoadAll = database.loadAllSmallCraft as jest.MockedFunction<typeof database.loadAllSmallCraft>;
const mockSave = database.saveSmallCraft as jest.MockedFunction<typeof database.saveSmallCraft>;

function makeDesign(name: string): SmallCraftDesign {
  return {
    name,
    hull: { name, techLevel: 'A', tonnageCode: 's1', tonnage: 10, cost: 1000000 },
    drives: [],
    fuel: { amount: 0, duration: 0, mass: 0 },
    fittings: [],
    weapons: [],
    cargo: { cargoBay: 0, shipsLocker: 0 },
    staff: { pilot: 1, gunner: 0, engineer: false, comms: false, sensors: false, ecm: false, other: 0 },
  };
}

beforeEach(() => {
  jest.resetAllMocks();
  globalThis.fetch = jest.fn() as unknown as typeof fetch;
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('skips initialization when the database already has data', async () => {
  mockLoadAll.mockResolvedValue([makeDesign('Existing')]);

  await initializeDatabase();

  expect(globalThis.fetch).not.toHaveBeenCalled();
  expect(mockSave).not.toHaveBeenCalled();
});

test('does nothing if the initial data fetch fails (non-ok response)', async () => {
  mockLoadAll.mockResolvedValue([]);
  (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: false });

  await initializeDatabase();

  expect(mockSave).not.toHaveBeenCalled();
});

test('does nothing if the initial data file is not a non-empty array', async () => {
  mockLoadAll.mockResolvedValue([]);
  (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) });

  await initializeDatabase();
  expect(mockSave).not.toHaveBeenCalled();

  (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => [] });
  await initializeDatabase();
  expect(mockSave).not.toHaveBeenCalled();
});

test('loads every craft from the initial data file, stripping any existing id', async () => {
  mockLoadAll.mockResolvedValue([]);
  const craft = [{ ...makeDesign('Craft A'), id: 42 }, makeDesign('Craft B')];
  (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => craft });
  mockSave.mockResolvedValue(1);

  await initializeDatabase();

  expect(mockSave).toHaveBeenCalledTimes(2);
  const [firstArg] = mockSave.mock.calls[0];
  expect(firstArg).not.toHaveProperty('id');
  expect(firstArg.name).toBe('Craft A');
});

test('continues loading remaining craft if one save fails', async () => {
  mockLoadAll.mockResolvedValue([]);
  const craft = [makeDesign('Bad'), makeDesign('Good')];
  (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => craft });
  mockSave.mockRejectedValueOnce(new Error('duplicate name')).mockResolvedValueOnce(2);

  await expect(initializeDatabase()).resolves.toBeUndefined();
  expect(mockSave).toHaveBeenCalledTimes(2);
});

test('swallows errors from loadAllSmallCraft instead of throwing', async () => {
  mockLoadAll.mockRejectedValue(new Error('db unavailable'));

  await expect(initializeDatabase()).resolves.toBeUndefined();
  expect(mockSave).not.toHaveBeenCalled();
});
