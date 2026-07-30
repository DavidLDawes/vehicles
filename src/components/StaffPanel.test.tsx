import { render, screen } from '@testing-library/react';
import { StaffPanel } from './StaffPanel';
import { Staff, Weapon, Drive, Fitting } from '../types/ship';

function makeStaff(overrides: Partial<Staff> = {}): Staff {
  return {
    pilot: 1,
    gunner: 0,
    engineer: false,
    comms: false,
    sensors: false,
    ecm: false,
    other: 0,
    ...overrides,
  };
}

function makeShipWeapon(type: string): Weapon {
  return { id: `w-${type}`, type, name: type, category: 'ship', mass: 1, cost: 1, quantity: 1 };
}

function makeDrive(overrides: Partial<Drive> = {}): Drive {
  return { id: 'd1', type: 'powerPlant', model: 'sA', rating: 1, mass: 1, cost: 1, quantity: 1, ...overrides };
}

function makeElectronicsFitting(electronicsType: string): Fitting {
  return {
    id: 'f-electronics',
    type: 'electronics',
    name: 'Electronics',
    mass: 1,
    cost: 1,
    quantity: 1,
    electronicsType,
  };
}

test('auto-calculates gunners from installed weapons on mount', () => {
  const onUpdate = jest.fn();
  render(
    <StaffPanel
      staff={makeStaff({ gunner: 0 })}
      weapons={[makeShipWeapon('pulse_laser_single')]}
      drives={[]}
      fittings={[]}
      onUpdate={onUpdate}
    />
  );

  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ gunner: 1 }));
});

test('does not call onUpdate when the gunner count already matches requirements', () => {
  const onUpdate = jest.fn();
  render(
    <StaffPanel
      staff={makeStaff({ gunner: 0 })}
      weapons={[]}
      drives={[]}
      fittings={[]}
      onUpdate={onUpdate}
    />
  );

  expect(onUpdate).not.toHaveBeenCalled();
});

test('hides the engineer option with fewer than 2 power plants or maneuver drives', () => {
  render(
    <StaffPanel
      staff={makeStaff()}
      weapons={[]}
      drives={[makeDrive()]}
      fittings={[]}
      onUpdate={jest.fn()}
    />
  );

  expect(screen.queryByText(/Engineer/)).not.toBeInTheDocument();
});

test('shows the engineer option with 2+ power plants', () => {
  render(
    <StaffPanel
      staff={makeStaff()}
      weapons={[]}
      drives={[makeDrive({ id: 'd1' }), makeDrive({ id: 'd2' })]}
      fittings={[]}
      onUpdate={jest.fn()}
    />
  );

  expect(screen.getByText(/Engineer/)).toBeInTheDocument();
});

test('auto-clears the engineer flag when it is no longer eligible', () => {
  const onUpdate = jest.fn();
  render(
    <StaffPanel
      staff={makeStaff({ engineer: true })}
      weapons={[]}
      drives={[makeDrive()]}
      fittings={[]}
      onUpdate={onUpdate}
    />
  );

  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ engineer: false }));
});

test('hides the ECM option without sufficiently advanced electronics', () => {
  render(
    <StaffPanel
      staff={makeStaff()}
      weapons={[]}
      drives={[]}
      fittings={[makeElectronicsFitting('basic_civilian')]}
      onUpdate={jest.fn()}
    />
  );

  expect(screen.queryByText(/ECM/)).not.toBeInTheDocument();
});

test('shows the ECM option with Basic Military or better electronics', () => {
  render(
    <StaffPanel
      staff={makeStaff()}
      weapons={[]}
      drives={[]}
      fittings={[makeElectronicsFitting('basic_military')]}
      onUpdate={jest.fn()}
    />
  );

  expect(screen.getByText(/ECM \(Electronic Countermeasures\) Specialist/)).toBeInTheDocument();
});

test('auto-clears the ECM flag when electronics no longer support it', () => {
  const onUpdate = jest.fn();
  render(
    <StaffPanel
      staff={makeStaff({ ecm: true })}
      weapons={[]}
      drives={[]}
      fittings={[]}
      onUpdate={onUpdate}
    />
  );

  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ ecm: false }));
});

test('computes total crew including optional positions', () => {
  render(
    <StaffPanel
      staff={makeStaff({ pilot: 2, gunner: 1, engineer: true, comms: true, other: 1 })}
      weapons={[makeShipWeapon('pulse_laser_single')]}
      drives={[makeDrive({ id: 'd1' }), makeDrive({ id: 'd2' })]}
      fittings={[]}
      onUpdate={jest.fn()}
    />
  );

  // pilot(2) + gunner(1) + engineer(1) + comms(1) + other(1) = 6
  expect(screen.getByText('Total Crew: 6')).toBeInTheDocument();
});
