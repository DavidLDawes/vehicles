import React from 'react';
import { Fitting } from '../types/ship';

interface FittingsPanelProps {
  fittings: Fitting[];
  onUpdate: (fittings: Fitting[]) => void;
}

export const FittingsPanel: React.FC<FittingsPanelProps> = ({ fittings, onUpdate }) => {
  const handleAddFitting = () => {
    const newFitting: Fitting = {
      id: `fitting-${Date.now()}`,
      type: 'cockpit',
      name: 'Cockpit',
      mass: 1.5,
      cost: 100000,
      quantity: 1,
    };
    onUpdate([...fittings, newFitting]);
  };

  const handleRemoveFitting = (id: string) => {
    onUpdate(fittings.filter((f) => f.id !== id));
  };

  return (
    <div className="panel fittings-panel">
      <h2>Fittings Configuration</h2>
      <div className="panel-content">
        <p className="info">
          Essential ship components: cockpit or control cabin (required), airlocks, berths, etc.
        </p>

        <button onClick={handleAddFitting} className="btn-primary">
          Add Fitting
        </button>

        <div className="fittings-list">
          {fittings.length === 0 ? (
            <p>No fittings configured. Add at least a cockpit or control cabin.</p>
          ) : (
            fittings.map((fitting) => (
              <div key={fitting.id} className="fitting-item">
                <span>
                  {fitting.name} (x{fitting.quantity}) - {fitting.mass * fitting.quantity} tons
                </span>
                <button onClick={() => handleRemoveFitting(fitting.id)}>Remove</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
