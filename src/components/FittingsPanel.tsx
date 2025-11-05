import React, { useState } from 'react';
import { Fitting } from '../types/ship';
import {
  COCKPIT_SPECS,
  calculateCockpitMass,
  calculateCockpitCost,
  calculatePassengers,
} from '../data/constants';

interface FittingsPanelProps {
  fittings: Fitting[];
  onUpdate: (fittings: Fitting[]) => void;
}

export const FittingsPanel: React.FC<FittingsPanelProps> = ({ fittings, onUpdate }) => {
  const [selectedCockpitType, setSelectedCockpitType] = useState<'cockpit' | 'control_cabin'>(
    'cockpit'
  );
  const [crewCount, setCrewCount] = useState<number>(1);

  const handleAddCockpit = () => {
    const mass = calculateCockpitMass(selectedCockpitType, crewCount);
    const cost = calculateCockpitCost(selectedCockpitType, crewCount);
    const passengers =
      selectedCockpitType === 'control_cabin' ? calculatePassengers(crewCount) : 0;

    const newFitting: Fitting = {
      id: `fitting-${Date.now()}`,
      type: selectedCockpitType,
      name: COCKPIT_SPECS[selectedCockpitType].name,
      mass: mass,
      cost: cost,
      quantity: 1,
      crew: crewCount,
      passengers: passengers,
    };
    onUpdate([...fittings, newFitting]);
  };

  const handleRemoveFitting = (id: string) => {
    onUpdate(fittings.filter((f) => f.id !== id));
  };

  const handleUpdateFitting = (id: string, updates: Partial<Fitting>) => {
    onUpdate(
      fittings.map((fitting) => {
        if (fitting.id === id) {
          const updatedFitting = { ...fitting, ...updates };

          // If crew count changed and this is a cockpit/control cabin, recalculate mass/cost/passengers
          if (
            updates.crew &&
            (updatedFitting.type === 'cockpit' || updatedFitting.type === 'control_cabin')
          ) {
            const type = updatedFitting.type as 'cockpit' | 'control_cabin';
            updatedFitting.mass = calculateCockpitMass(type, updates.crew);
            updatedFitting.cost = calculateCockpitCost(type, updates.crew);
            updatedFitting.passengers =
              type === 'control_cabin' ? calculatePassengers(updates.crew) : 0;
          }

          return updatedFitting;
        }
        return fitting;
      })
    );
  };

  // Check if there's already a cockpit or control cabin
  const hasCockpitOrCabin = fittings.some(
    (f) => f.type === 'cockpit' || f.type === 'control_cabin'
  );

  return (
    <div className="panel fittings-panel">
      <h2>Fittings Configuration</h2>
      <div className="panel-content">
        <p className="info">
          Essential ship components: cockpit or control cabin (required), airlocks, berths, etc.
        </p>

        <h3>Add Cockpit / Control Cabin</h3>
        {hasCockpitOrCabin && (
          <p className="warning">
            Note: You already have a cockpit or control cabin. Adding another will replace crew
            capacity.
          </p>
        )}

        <div className="form-group">
          <label htmlFor="cockpitType">Type:</label>
          <select
            id="cockpitType"
            value={selectedCockpitType}
            onChange={(e) => setSelectedCockpitType(e.target.value as 'cockpit' | 'control_cabin')}
          >
            <option value="cockpit">Cockpit (1.5 tons/crew)</option>
            <option value="control_cabin">Control Cabin (3 tons/crew, allows passengers)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="crewCount">Number of Crew:</label>
          <input
            type="number"
            id="crewCount"
            value={crewCount}
            onChange={(e) => setCrewCount(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            step={1}
          />
        </div>

        <div className="fitting-preview">
          <p>
            <strong>Mass:</strong> {calculateCockpitMass(selectedCockpitType, crewCount)} tons
          </p>
          <p>
            <strong>Cost:</strong>{' '}
            {(calculateCockpitCost(selectedCockpitType, crewCount) / 1000000).toFixed(2)} MCr
          </p>
          <p>
            <strong>Crew Positions:</strong> {crewCount}
          </p>
          {selectedCockpitType === 'control_cabin' && (
            <p>
              <strong>Passenger Capacity:</strong> {calculatePassengers(crewCount)}
            </p>
          )}
        </div>

        <button onClick={handleAddCockpit} className="btn-primary">
          Add {COCKPIT_SPECS[selectedCockpitType].name}
        </button>

        <h3>Installed Fittings</h3>
        <div className="fittings-list">
          {fittings.length === 0 ? (
            <p>No fittings configured. Add at least a cockpit or control cabin.</p>
          ) : (
            fittings.map((fitting) => (
              <div key={fitting.id} className="fitting-item">
                <div className="fitting-details">
                  <h4>{fitting.name}</h4>
                  {(fitting.type === 'cockpit' || fitting.type === 'control_cabin') && (
                    <>
                      <div className="form-group">
                        <label>Crew Positions:</label>
                        <input
                          type="number"
                          value={fitting.crew || 1}
                          onChange={(e) =>
                            handleUpdateFitting(fitting.id, {
                              crew: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          min={1}
                          step={1}
                        />
                      </div>
                      <p>
                        <strong>Mass:</strong> {fitting.mass} tons
                      </p>
                      <p>
                        <strong>Cost:</strong> {(fitting.cost / 1000000).toFixed(2)} MCr
                      </p>
                      {fitting.type === 'control_cabin' && (
                        <p>
                          <strong>Passenger Capacity:</strong> {fitting.passengers || 0}
                        </p>
                      )}
                    </>
                  )}
                  {fitting.type !== 'cockpit' && fitting.type !== 'control_cabin' && (
                    <>
                      <p>
                        <strong>Quantity:</strong> {fitting.quantity}
                      </p>
                      <p>
                        <strong>Mass:</strong> {fitting.mass * fitting.quantity} tons
                      </p>
                    </>
                  )}
                </div>
                <button onClick={() => handleRemoveFitting(fitting.id)}>Remove</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
