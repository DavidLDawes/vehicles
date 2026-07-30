import { render, screen, fireEvent } from '@testing-library/react';
import { DrivesPanel } from './DrivesPanel';
import { Drive, Fuel } from '../types/ship';

function makeFuel(overrides: Partial<Fuel> = {}): Fuel {
  return { amount: 0, duration: 0, mass: 0, ...overrides };
}

function makeDrive(overrides: Partial<Drive> = {}): Drive {
  return {
    id: 'd1',
    type: 'maneuver',
    driveType: 'gravitic_m',
    model: 'sA',
    rating: 2,
    mass: 0.5,
    cost: 1000000,
    quantity: 1,
    ...overrides,
  };
}

test('adds the default gravitic maneuver drive', () => {
  const onUpdateDrives = jest.fn();
  render(
    <DrivesPanel
      drives={[]}
      fuel={makeFuel()}
      hullTonnage={10}
      onUpdateDrives={onUpdateDrives}
      onUpdateFuel={jest.fn()}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Add Drive' }));

  expect(onUpdateDrives).toHaveBeenCalledWith([
    expect.objectContaining({
      type: 'maneuver',
      driveType: 'gravitic_m',
      model: 'sA',
      rating: 2,
      mass: 0.5,
      cost: 1000000,
      quantity: 1,
    }),
  ]);
});

test('adds a power plant after switching drive category', () => {
  const onUpdateDrives = jest.fn();
  render(
    <DrivesPanel
      drives={[]}
      fuel={makeFuel()}
      hullTonnage={10}
      onUpdateDrives={onUpdateDrives}
      onUpdateFuel={jest.fn()}
    />
  );

  fireEvent.change(screen.getByLabelText('Drive Category:'), { target: { value: 'powerPlant' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add Drive' }));

  expect(onUpdateDrives).toHaveBeenCalledWith([
    expect.objectContaining({
      type: 'powerPlant',
      driveType: 'fusion_p',
      model: 'sA',
      rating: 2,
      mass: 1.2,
      cost: 3000000,
    }),
  ]);
});

test('removes an installed drive', () => {
  const onUpdateDrives = jest.fn();
  render(
    <DrivesPanel
      drives={[makeDrive()]}
      fuel={makeFuel()}
      hullTonnage={10}
      onUpdateDrives={onUpdateDrives}
      onUpdateFuel={jest.fn()}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

  expect(onUpdateDrives).toHaveBeenCalledWith([]);
});

test('recalculates drive ratings when hull tonnage changes', () => {
  const onUpdateDrives = jest.fn();
  const { rerender } = render(
    <DrivesPanel
      drives={[makeDrive({ model: 'sA', rating: 2 })]}
      fuel={makeFuel()}
      hullTonnage={10}
      onUpdateDrives={onUpdateDrives}
      onUpdateFuel={jest.fn()}
    />
  );

  expect(onUpdateDrives).not.toHaveBeenCalled();

  // Performance for sA at 20 tons drops from 2 to 1
  rerender(
    <DrivesPanel
      drives={[makeDrive({ model: 'sA', rating: 2 })]}
      fuel={makeFuel()}
      hullTonnage={20}
      onUpdateDrives={onUpdateDrives}
      onUpdateFuel={jest.fn()}
    />
  );

  expect(onUpdateDrives).toHaveBeenCalledWith([expect.objectContaining({ rating: 1 })]);
});

test('sets fuel to the recommended amount based on the installed power plant', () => {
  const onUpdateFuel = jest.fn();
  render(
    <DrivesPanel
      drives={[makeDrive({ type: 'powerPlant', driveType: 'fusion_p', model: 'sA' })]}
      fuel={makeFuel({ duration: 5 })}
      hullTonnage={10}
      onUpdateDrives={jest.fn()}
      onUpdateFuel={onUpdateFuel}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Set Fuel to Recommended Amount' }));

  // FUSION_FUEL_REQUIREMENTS.sA = 1 ton for 2 weeks (the default power plant duration)
  expect(onUpdateFuel).toHaveBeenCalledWith({ amount: 1, duration: 5, mass: 1 });
});

test('editing the fuel amount directly calls onUpdateFuel', () => {
  const onUpdateFuel = jest.fn();
  render(
    <DrivesPanel
      drives={[]}
      fuel={makeFuel()}
      hullTonnage={10}
      onUpdateDrives={jest.fn()}
      onUpdateFuel={onUpdateFuel}
    />
  );

  fireEvent.change(screen.getByLabelText('Fuel Amount (tons):'), { target: { value: '3' } });

  expect(onUpdateFuel).toHaveBeenCalledWith(expect.objectContaining({ amount: 3 }));
});
