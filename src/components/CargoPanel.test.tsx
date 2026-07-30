import { render, screen, fireEvent } from '@testing-library/react';
import { CargoPanel } from './CargoPanel';
import { Cargo, Weapon } from '../types/ship';

function makeCargo(overrides: Partial<Cargo> = {}): Cargo {
  return { cargoBay: 0, shipsLocker: 0, ...overrides };
}

function makeMissileLauncher(): Weapon {
  return {
    id: 'w1',
    type: 'missile_launcher_single',
    name: 'Single Missile Launcher Turret',
    category: 'ship',
    mass: 2,
    cost: 1750000,
    quantity: 1,
  };
}

test('editing the cargo bay tonnage calls onUpdate', () => {
  const onUpdate = jest.fn();
  render(
    <CargoPanel cargo={makeCargo()} weapons={[]} hullTonnage={40} currentMass={10} onUpdate={onUpdate} />
  );

  fireEvent.change(screen.getByLabelText('Cargo Bay (tons):'), { target: { value: '5' } });

  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ cargoBay: 5 }));
});

test('editing the ship\'s locker tonnage calls onUpdate and shows its cost', () => {
  const onUpdate = jest.fn();
  render(
    <CargoPanel cargo={makeCargo({ shipsLocker: 2 })} weapons={[]} hullTonnage={40} currentMass={10} onUpdate={onUpdate} />
  );

  fireEvent.change(screen.getByLabelText('Ship\'s Locker (tons):'), { target: { value: '3' } });

  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ shipsLocker: 3 }));
  // 2 tons at 0.2 MCr/ton = 0.40 MCr, shown before the edit takes effect
  expect(screen.getAllByText(/0\.40 MCr/).length).toBeGreaterThan(0);
});

test('hides the missile reloads section without any missile launcher turrets', () => {
  render(
    <CargoPanel cargo={makeCargo()} weapons={[]} hullTonnage={40} currentMass={10} onUpdate={jest.fn()} />
  );

  expect(screen.queryByText('Missile Reloads')).not.toBeInTheDocument();
});

test('shows the missile reloads section when a missile launcher turret is installed', () => {
  render(
    <CargoPanel
      cargo={makeCargo()}
      weapons={[makeMissileLauncher()]}
      hullTonnage={40}
      currentMass={10}
      onUpdate={jest.fn()}
    />
  );

  expect(screen.getByText('Missile Reloads')).toBeInTheDocument();
  expect(screen.getByLabelText('Missile Reloads (tons):')).toBeInTheDocument();
});

test('shows the modular cutter bay option when at least 30 tons are available', () => {
  render(
    <CargoPanel cargo={makeCargo()} weapons={[]} hullTonnage={100} currentMass={10} onUpdate={jest.fn()} />
  );

  expect(screen.getByText('Modular Cutter Bay')).toBeInTheDocument();
});

test('hides the modular cutter bay option when fewer than 30 tons are available', () => {
  render(
    <CargoPanel cargo={makeCargo()} weapons={[]} hullTonnage={40} currentMass={20} onUpdate={jest.fn()} />
  );

  expect(screen.queryByText('Modular Cutter Bay')).not.toBeInTheDocument();
});

test('auto-clears the modular cutter bay if available tonnage drops below 30', () => {
  const onUpdate = jest.fn();
  render(
    <CargoPanel
      cargo={makeCargo({ modularCutterBay: true })}
      weapons={[]}
      hullTonnage={40}
      currentMass={20}
      onUpdate={onUpdate}
    />
  );

  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ modularCutterBay: false }));
});
