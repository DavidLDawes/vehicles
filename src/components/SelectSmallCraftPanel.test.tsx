import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SelectSmallCraftPanel } from './SelectSmallCraftPanel';
import { SmallCraftDesign } from '../types/ship';
import * as database from '../services/database';
import * as initialDataService from '../services/initialDataService';
import * as csvImportService from '../services/csvImportService';

jest.mock('../services/database');
jest.mock('../services/initialDataService');
jest.mock('../services/csvImportService');

const mockLoadAll = database.loadAllSmallCraft as jest.MockedFunction<typeof database.loadAllSmallCraft>;
const mockDelete = database.deleteSmallCraft as jest.MockedFunction<typeof database.deleteSmallCraft>;
const mockInitialize = initialDataService.initializeDatabase as jest.MockedFunction<
  typeof initialDataService.initializeDatabase
>;
const mockImportFromCSV = csvImportService.importFromCSV as jest.MockedFunction<
  typeof csvImportService.importFromCSV
>;

function makeDesign(overrides: Partial<SmallCraftDesign> = {}): SmallCraftDesign {
  return {
    id: 1,
    name: 'Test Craft',
    hull: { name: 'Test Craft', techLevel: 'A', tonnageCode: 's1', tonnage: 10, cost: 1000000 },
    drives: [],
    fuel: { amount: 0, duration: 0, mass: 0 },
    fittings: [],
    weapons: [],
    cargo: { cargoBay: 0, shipsLocker: 0 },
    staff: { pilot: 1, gunner: 0, engineer: false, comms: false, sensors: false, ecm: false, other: 0 },
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  jest.resetAllMocks();
  mockInitialize.mockResolvedValue(undefined);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('shows a message when there is no saved craft', async () => {
  mockLoadAll.mockResolvedValue([]);
  render(<SelectSmallCraftPanel onSelectCraft={jest.fn()} onCreateNew={jest.fn()} />);

  expect(await screen.findByText('No saved craft found. Create a new one to get started!')).toBeInTheDocument();
});

test('lists saved craft sorted by most recently updated first', async () => {
  mockLoadAll.mockResolvedValue([
    makeDesign({ id: 1, name: 'Older Craft', updatedAt: '2026-01-01T00:00:00.000Z' }),
    makeDesign({ id: 2, name: 'Newer Craft', updatedAt: '2026-06-01T00:00:00.000Z' }),
  ]);
  render(<SelectSmallCraftPanel onSelectCraft={jest.fn()} onCreateNew={jest.fn()} />);

  await screen.findByText('Newer Craft');
  const names = screen.getAllByText(/Craft$/).map((el) => el.textContent);
  expect(names.indexOf('Newer Craft')).toBeLessThan(names.indexOf('Older Craft'));
});

test('shows an error message when loading fails', async () => {
  mockLoadAll.mockRejectedValue(new Error('db down'));
  render(<SelectSmallCraftPanel onSelectCraft={jest.fn()} onCreateNew={jest.fn()} />);

  expect(await screen.findByText('Failed to load saved craft')).toBeInTheDocument();
});

test('selecting a craft calls onSelectCraft with that design', async () => {
  const design = makeDesign({ name: 'Pick Me' });
  mockLoadAll.mockResolvedValue([design]);
  const onSelectCraft = jest.fn();
  render(<SelectSmallCraftPanel onSelectCraft={onSelectCraft} onCreateNew={jest.fn()} />);

  fireEvent.click(await screen.findByText('Pick Me'));

  expect(onSelectCraft).toHaveBeenCalledWith(design);
});

test('deleting a craft after confirming reloads the list', async () => {
  const design = makeDesign({ id: 7, name: 'Doomed Craft' });
  mockLoadAll.mockResolvedValue([design]);
  mockDelete.mockResolvedValue(undefined);
  jest.spyOn(window, 'confirm').mockReturnValue(true);

  render(<SelectSmallCraftPanel onSelectCraft={jest.fn()} onCreateNew={jest.fn()} />);

  fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));

  await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(7));
  expect(mockLoadAll).toHaveBeenCalledTimes(2); // initial load + reload after delete
});

test('does not delete a craft when the confirmation is declined', async () => {
  const design = makeDesign({ id: 7, name: 'Safe Craft' });
  mockLoadAll.mockResolvedValue([design]);
  jest.spyOn(window, 'confirm').mockReturnValue(false);

  render(<SelectSmallCraftPanel onSelectCraft={jest.fn()} onCreateNew={jest.fn()} />);

  fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));

  expect(mockDelete).not.toHaveBeenCalled();
});

test('clicking "Create New Small Craft" calls onCreateNew', async () => {
  mockLoadAll.mockResolvedValue([]);
  const onCreateNew = jest.fn();
  render(<SelectSmallCraftPanel onSelectCraft={jest.fn()} onCreateNew={onCreateNew} />);

  await screen.findByText('No saved craft found. Create a new one to get started!');
  fireEvent.click(screen.getByRole('button', { name: 'Create New Small Craft' }));

  expect(onCreateNew).toHaveBeenCalled();
});

test('importing a CSV file loads the parsed design', async () => {
  mockLoadAll.mockResolvedValue([]);
  const imported = makeDesign({ name: 'Imported Craft' });
  mockImportFromCSV.mockReturnValue(imported);
  const onSelectCraft = jest.fn();

  render(<SelectSmallCraftPanel onSelectCraft={onSelectCraft} onCreateNew={jest.fn()} />);
  await screen.findByText('No saved craft found. Create a new one to get started!');

  // jsdom's File doesn't implement text(), so use a minimal stand-in with the same shape.
  const file = { name: 'ship.csv', text: async () => 'name,Imported Craft' };
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  await fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => expect(onSelectCraft).toHaveBeenCalledWith(imported));
  expect(mockImportFromCSV).toHaveBeenCalledWith('name,Imported Craft', 'ship.csv');
});
