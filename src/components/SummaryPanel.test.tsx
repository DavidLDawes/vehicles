import { render, screen, fireEvent } from '@testing-library/react';
import { SummaryPanel } from './SummaryPanel';
import { SmallCraftDesign } from '../types/ship';

function makeDesign(overrides: Partial<SmallCraftDesign> = {}): SmallCraftDesign {
  return {
    name: 'Skiff',
    hull: { name: 'Skiff', techLevel: 'A', tonnageCode: 's4', tonnage: 40, cost: 1400000 },
    drives: [
      { id: 'd1', type: 'powerPlant', driveType: 'fusion_p', model: 'sA', rating: 2, mass: 1.2, cost: 3000000, quantity: 1 },
    ],
    fuel: { amount: 1, duration: 2, mass: 1 },
    fittings: [],
    weapons: [],
    cargo: { cargoBay: 0, shipsLocker: 0 },
    staff: { pilot: 1, gunner: 0, engineer: false, comms: false, sensors: false, ecm: false, other: 0 },
    ...overrides,
  };
}

test('renders the design name, hull details, and totals', () => {
  render(
    <SummaryPanel design={makeDesign()} totalMass={2.2} totalCost={4400000} onSave={jest.fn()} onPrint={jest.fn()} />
  );

  expect(screen.getByText('Skiff')).toBeInTheDocument();
  expect(screen.getByText(/s4 \(40 tons\)/)).toBeInTheDocument();
  expect(screen.getByText(/Total Mass:/)).toBeInTheDocument();
  expect(screen.getByText(/2\.20 \/ 40 tons/)).toBeInTheDocument();
  expect(screen.getByText(/4,400,000 credits/)).toBeInTheDocument();
});

test('shows "Unarmed" when there are no weapons', () => {
  render(
    <SummaryPanel design={makeDesign()} totalMass={2.2} totalCost={4400000} onSave={jest.fn()} onPrint={jest.fn()} />
  );

  expect(screen.getByText('Unarmed')).toBeInTheDocument();
});

test('calls onSave when the Save Design button is clicked', () => {
  const onSave = jest.fn();
  render(
    <SummaryPanel design={makeDesign()} totalMass={2.2} totalCost={4400000} onSave={onSave} onPrint={jest.fn()} />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Save Design' }));

  expect(onSave).toHaveBeenCalled();
});

test('calls onPrint when the Print button is clicked', () => {
  const onPrint = jest.fn();
  render(
    <SummaryPanel design={makeDesign()} totalMass={2.2} totalCost={4400000} onSave={jest.fn()} onPrint={onPrint} />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Print' }));

  expect(onPrint).toHaveBeenCalled();
});

test('exporting to CSV creates and clicks a download link', () => {
  const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

  render(
    <SummaryPanel design={makeDesign()} totalMass={2.2} totalCost={4400000} onSave={jest.fn()} onPrint={jest.fn()} />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));

  expect(clickSpy).toHaveBeenCalledTimes(1);
  clickSpy.mockRestore();
});
