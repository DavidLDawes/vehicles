import { render, screen, fireEvent } from '@testing-library/react';
import { WeaponsPanel } from './WeaponsPanel';
import { Weapon, Drive } from '../types/ship';

function makePowerPlant(model: string): Drive {
  return { id: `pp-${model}`, type: 'powerPlant', model, rating: 1, mass: 1, cost: 1, quantity: 1 };
}

function makeShipWeapon(overrides: Partial<Weapon> = {}): Weapon {
  return {
    id: 'w1',
    type: 'pulse_laser_single',
    name: 'Single Pulse Laser Turret',
    category: 'ship',
    mass: 1,
    cost: 1700000,
    quantity: 1,
    slotsUsed: 1,
    ...overrides,
  };
}

test('adds the selected ship weapon when slots and energy capacity allow it', () => {
  const onUpdate = jest.fn();
  render(
    <WeaponsPanel weapons={[]} hullTonnage={40} drives={[makePowerPlant('sG')]} onUpdate={onUpdate} />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Add Ship Weapon' }));

  expect(onUpdate).toHaveBeenCalledWith([
    expect.objectContaining({
      type: 'pulse_laser_single',
      category: 'ship',
      mass: 1,
      cost: 1700000,
      slotsUsed: 1,
    }),
  ]);
});

test('disables adding a ship weapon once slot limit is reached', () => {
  render(
    <WeaponsPanel
      weapons={[makeShipWeapon()]}
      hullTonnage={10}
      drives={[makePowerPlant('sG')]}
      onUpdate={jest.fn()}
    />
  );

  expect(screen.getByRole('button', { name: 'Add Ship Weapon' })).toBeDisabled();
  expect(screen.getAllByText(/Maximum reached/).length).toBeGreaterThan(0);
});

test('disables adding an energy weapon without enough power plant capacity', () => {
  render(<WeaponsPanel weapons={[]} hullTonnage={40} drives={[]} onUpdate={jest.fn()} />);

  expect(screen.getByRole('button', { name: 'Add Ship Weapon' })).toBeDisabled();
  expect(screen.getAllByText(/No power plant installed/).length).toBeGreaterThan(0);
});

test('adds an anti-personnel weapon', () => {
  const onUpdate = jest.fn();
  render(<WeaponsPanel weapons={[]} hullTonnage={40} drives={[]} onUpdate={onUpdate} />);

  fireEvent.change(screen.getByLabelText('Weapon Category:'), {
    target: { value: 'anti-personnel' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add Anti-Personnel Weapon' }));

  expect(onUpdate).toHaveBeenCalledWith([
    expect.objectContaining({ type: 'rifle', category: 'anti-personnel', mass: 0.05, cost: 50000 }),
  ]);
});

test('disables adding an anti-personnel weapon once the limit is reached', () => {
  // 10-ton hull allows only 1 anti-personnel weapon
  const existing = { ...makeShipWeapon(), id: 'ap1', type: 'rifle', category: 'anti-personnel' as const };
  render(
    <WeaponsPanel weapons={[existing]} hullTonnage={10} drives={[]} onUpdate={jest.fn()} />
  );

  fireEvent.change(screen.getByLabelText('Weapon Category:'), {
    target: { value: 'anti-personnel' },
  });

  expect(screen.getByRole('button', { name: 'Add Anti-Personnel Weapon' })).toBeDisabled();
  expect(screen.getByText(/Anti-personnel weapon limit reached/)).toBeInTheDocument();
});

test('removes an installed weapon', () => {
  const onUpdate = jest.fn();
  render(
    <WeaponsPanel weapons={[makeShipWeapon()]} hullTonnage={40} drives={[]} onUpdate={onUpdate} />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

  expect(onUpdate).toHaveBeenCalledWith([]);
});
