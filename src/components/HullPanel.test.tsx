import { render, screen, fireEvent } from '@testing-library/react';
import { HullPanel } from './HullPanel';
import { Hull } from '../types/ship';

function makeHull(overrides: Partial<Hull> = {}): Hull {
  return {
    name: '',
    techLevel: '',
    tonnageCode: '',
    tonnage: 0,
    cost: 0,
    ...overrides,
  };
}

test('editing the name calls onUpdate with the new name', () => {
  const onUpdate = jest.fn();
  render(<HullPanel hull={makeHull()} onUpdate={onUpdate} />);

  fireEvent.change(screen.getByLabelText('Small Craft Name:'), { target: { value: 'Longshot' } });

  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Longshot' }));
});

test('selecting a tech level calls onUpdate with the new value', () => {
  const onUpdate = jest.fn();
  render(<HullPanel hull={makeHull()} onUpdate={onUpdate} />);

  fireEvent.change(screen.getByLabelText('Tech Level:'), { target: { value: 'C' } });

  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ techLevel: 'C' }));
});

test('selecting a tonnage computes hull code and cost together', () => {
  const onUpdate = jest.fn();
  render(<HullPanel hull={makeHull()} onUpdate={onUpdate} />);

  fireEvent.change(screen.getByLabelText('Hull Tonnage:'), { target: { value: '35' } });

  expect(onUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ tonnage: 35, tonnageCode: 's4', cost: 1400000 })
  );
});

test('shows the hull code and cost info line once tonnage is set', () => {
  const onUpdate = jest.fn();
  render(<HullPanel hull={makeHull({ tonnage: 50, tonnageCode: 's5', cost: 1500000 })} onUpdate={onUpdate} />);

  expect(screen.getByText(/Hull Code:/)).toBeInTheDocument();
  expect(screen.getByText(/S5/)).toBeInTheDocument();
  expect(screen.getByText(/1\.5 MCr/)).toBeInTheDocument();
});

test('does not show the hull code info line when tonnage is unset', () => {
  const onUpdate = jest.fn();
  render(<HullPanel hull={makeHull()} onUpdate={onUpdate} />);

  expect(screen.queryByText(/Hull Code:/)).not.toBeInTheDocument();
});

test('editing the description calls onUpdate with the new text', () => {
  const onUpdate = jest.fn();
  render(<HullPanel hull={makeHull()} onUpdate={onUpdate} />);

  fireEvent.change(screen.getByLabelText('Description (optional):'), {
    target: { value: 'A nimble little launch.' },
  });

  expect(onUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ description: 'A nimble little launch.' })
  );
});
