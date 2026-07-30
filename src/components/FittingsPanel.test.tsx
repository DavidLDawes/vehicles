import { render, screen, fireEvent } from '@testing-library/react';
import { FittingsPanel } from './FittingsPanel';
import { Fitting } from '../types/ship';

function makeFitting(overrides: Partial<Fitting> = {}): Fitting {
  return { id: 'f1', type: 'fresher', name: 'Fresher', mass: 1, cost: 100000, quantity: 1, ...overrides };
}

test('adds a cockpit with the default crew count', () => {
  const onUpdate = jest.fn();
  render(<FittingsPanel fittings={[]} hullTonnage={40} hullTechLevel="A" onUpdate={onUpdate} />);

  fireEvent.click(screen.getByRole('button', { name: 'Add Cockpit' }));

  expect(onUpdate).toHaveBeenCalledWith([
    expect.objectContaining({
      type: 'cockpit',
      name: 'Cockpit',
      mass: 1.5,
      cost: 200000,
      quantity: 1,
      crew: 1,
      passengers: 0,
    }),
  ]);
});

test('adds a passenger cabin', () => {
  const onUpdate = jest.fn();
  render(<FittingsPanel fittings={[]} hullTonnage={40} hullTechLevel="A" onUpdate={onUpdate} />);

  fireEvent.click(screen.getByRole('button', { name: 'Add Passenger Cabin' }));

  expect(onUpdate).toHaveBeenCalledWith([
    expect.objectContaining({ type: 'cabin', name: 'Passenger Cabin', mass: 1.5, cost: 75000, passengers: 1 }),
  ]);
});

test('adds an airlock', () => {
  const onUpdate = jest.fn();
  render(<FittingsPanel fittings={[]} hullTonnage={40} hullTechLevel="A" onUpdate={onUpdate} />);

  fireEvent.click(screen.getByRole('button', { name: 'Add Airlock' }));

  expect(onUpdate).toHaveBeenCalledWith([
    expect.objectContaining({ type: 'airlock', name: 'Airlock', mass: 1, cost: 200000, quantity: 1 }),
  ]);
});

test('adds a fresher', () => {
  const onUpdate = jest.fn();
  render(<FittingsPanel fittings={[]} hullTonnage={40} hullTechLevel="A" onUpdate={onUpdate} />);

  fireEvent.click(screen.getByRole('button', { name: 'Add Fresher' }));

  expect(onUpdate).toHaveBeenCalledWith([
    expect.objectContaining({ type: 'fresher', name: 'Fresher', mass: 1, cost: 100000 }),
  ]);
});

test('adds a galley', () => {
  const onUpdate = jest.fn();
  render(<FittingsPanel fittings={[]} hullTonnage={40} hullTechLevel="A" onUpdate={onUpdate} />);

  fireEvent.click(screen.getByRole('button', { name: 'Add Galley' }));

  expect(onUpdate).toHaveBeenCalledWith([
    expect.objectContaining({ type: 'galley', name: 'Galley', mass: 0.5, cost: 100000 }),
  ]);
});

test('adds the default (Standard) electronics system', () => {
  const onUpdate = jest.fn();
  render(<FittingsPanel fittings={[]} hullTonnage={40} hullTechLevel="A" onUpdate={onUpdate} />);

  fireEvent.click(screen.getByRole('button', { name: 'Add Electronics' }));

  expect(onUpdate).toHaveBeenCalledWith([
    expect.objectContaining({
      type: 'electronics',
      name: 'Standard Electronics',
      electronicsType: 'standard',
      dieModifier: -4,
      includes: 'Radar, Lidar',
    }),
  ]);
});

test('removes an installed fitting', () => {
  const onUpdate = jest.fn();
  render(
    <FittingsPanel fittings={[makeFitting()]} hullTonnage={40} hullTechLevel="A" onUpdate={onUpdate} />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

  expect(onUpdate).toHaveBeenCalledWith([]);
});

test('shows a message when no fittings are installed', () => {
  render(<FittingsPanel fittings={[]} hullTonnage={40} hullTechLevel="A" onUpdate={jest.fn()} />);

  expect(
    screen.getByText('No fittings configured. Add at least a cockpit or control cabin.')
  ).toBeInTheDocument();
});
