import { render, screen, fireEvent, within } from '@testing-library/react';
import { ArmorPanel } from './ArmorPanel';
import { Hull } from '../types/ship';

function makeHull(overrides: Partial<Hull> = {}): Hull {
  return {
    name: 'Test Craft',
    techLevel: 'A',
    tonnageCode: 's4',
    tonnage: 40,
    cost: 1400000,
    ...overrides,
  };
}

test('shows "no armor" message and only tech-level-eligible options when armor is unset', () => {
  const onUpdate = jest.fn();
  render(<ArmorPanel armor={undefined} hull={makeHull()} onUpdate={onUpdate} />);

  expect(screen.getByText('This craft has no armor plating.')).toBeInTheDocument();

  const select = screen.getByLabelText('Armor Type:');
  const options = within(select).getAllByRole('option').map((o) => o.textContent);
  expect(options.some((t) => t?.includes('Titanium Steel'))).toBe(true);
  expect(options.some((t) => t?.includes('Crystaliron'))).toBe(true);
  expect(options.some((t) => t?.includes('Bonded Superdense'))).toBe(false);
});

test('selecting "none" clears the armor', () => {
  const onUpdate = jest.fn();
  render(
    <ArmorPanel
      armor={{ type: 'titanium_steel', rating: 1, mass: 1, cost: 35000 }}
      hull={makeHull()}
      onUpdate={onUpdate}
    />
  );

  fireEvent.change(screen.getByLabelText('Armor Type:'), { target: { value: 'none' } });

  expect(onUpdate).toHaveBeenCalledWith(undefined);
});

test('selecting an armor type computes mass and cost for rating 1', () => {
  const onUpdate = jest.fn();
  render(<ArmorPanel armor={undefined} hull={makeHull()} onUpdate={onUpdate} />);

  fireEvent.change(screen.getByLabelText('Armor Type:'), { target: { value: 'titanium_steel' } });

  expect(onUpdate).toHaveBeenCalledWith({
    type: 'titanium_steel',
    rating: 1,
    mass: 1,
    cost: 35000,
  });
});

test('changing the armor rating recalculates mass and cost', () => {
  const onUpdate = jest.fn();
  render(
    <ArmorPanel
      armor={{ type: 'titanium_steel', rating: 1, mass: 1, cost: 35000 }}
      hull={makeHull()}
      onUpdate={onUpdate}
    />
  );

  fireEvent.change(screen.getByLabelText('Armor Rating:'), { target: { value: '5' } });

  expect(onUpdate).toHaveBeenCalledWith({
    type: 'titanium_steel',
    rating: 5,
    mass: 5,
    cost: 175000,
  });
});

test('clamps the armor rating to the type’s maximum for the tech level', () => {
  const onUpdate = jest.fn();
  render(
    <ArmorPanel
      armor={{ type: 'titanium_steel', rating: 1, mass: 1, cost: 35000 }}
      hull={makeHull()}
      onUpdate={onUpdate}
    />
  );

  // Titanium Steel max armor at TL10 is min(10, 9) = 9
  fireEvent.change(screen.getByLabelText('Armor Rating:'), { target: { value: '20' } });

  expect(onUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ rating: 9 })
  );
});
