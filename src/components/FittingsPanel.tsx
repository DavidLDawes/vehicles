import React, { useState } from 'react';
import { Fitting } from '../types/ship';
import {
  COCKPIT_SPECS,
  calculateCockpitMass,
  calculateCockpitCost,
  calculatePassengers,
  calculateCabinMass,
  calculateCabinCost,
  CABIN_TONS_PER_PASSENGER,
  CABIN_COST_PER_TON,
  calculateAirlockMass,
  calculateAirlockCost,
  AIRLOCK_MASS,
  AIRLOCK_COST,
  AIRLOCK_MAX_QUANTITY,
  FRESHER_MASS,
  FRESHER_COST,
  GALLEY_MASS,
  GALLEY_COST,
} from '../data/constants';

interface FittingsPanelProps {
  fittings: Fitting[];
  hullTonnage: number;
  onUpdate: (fittings: Fitting[]) => void;
}

export const FittingsPanel: React.FC<FittingsPanelProps> = ({ fittings, hullTonnage, onUpdate }) => {
  const [selectedCockpitType, setSelectedCockpitType] = useState<'cockpit' | 'control_cabin'>(
    'cockpit'
  );
  const [crewCount, setCrewCount] = useState<number>(1);
  const [cabinPassengers, setCabinPassengers] = useState<number>(1);
  const [airlockQuantity, setAirlockQuantity] = useState<number>(1);

  const handleAddCockpit = () => {
    const mass = calculateCockpitMass(selectedCockpitType, crewCount);
    const cost = calculateCockpitCost(hullTonnage);
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

  const handleAddCabin = () => {
    const mass = calculateCabinMass(cabinPassengers);
    const cost = calculateCabinCost(cabinPassengers);

    const newFitting: Fitting = {
      id: `fitting-${Date.now()}`,
      type: 'cabin',
      name: 'Passenger Cabin',
      mass: mass,
      cost: cost,
      quantity: 1,
      passengers: cabinPassengers,
    };
    onUpdate([...fittings, newFitting]);
  };

  const handleAddAirlock = () => {
    const newFitting: Fitting = {
      id: `fitting-${Date.now()}`,
      type: 'airlock',
      name: 'Airlock',
      mass: AIRLOCK_MASS, // Store per-unit mass
      cost: AIRLOCK_COST, // Store per-unit cost
      quantity: airlockQuantity, // Store actual quantity
    };
    onUpdate([...fittings, newFitting]);
  };

  const handleAddFresher = () => {
    const newFitting: Fitting = {
      id: `fitting-${Date.now()}`,
      type: 'fresher',
      name: 'Fresher',
      mass: FRESHER_MASS,
      cost: FRESHER_COST,
      quantity: 1,
    };
    onUpdate([...fittings, newFitting]);
  };

  const handleAddGalley = () => {
    const newFitting: Fitting = {
      id: `fitting-${Date.now()}`,
      type: 'galley',
      name: 'Galley',
      mass: GALLEY_MASS,
      cost: GALLEY_COST,
      quantity: 1,
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

          // If crew count changed and this is a cockpit/control cabin, recalculate mass/passengers
          // Cost stays the same (based on hull tonnage, not crew)
          if (
            updates.crew &&
            (updatedFitting.type === 'cockpit' || updatedFitting.type === 'control_cabin')
          ) {
            const type = updatedFitting.type as 'cockpit' | 'control_cabin';
            updatedFitting.mass = calculateCockpitMass(type, updates.crew);
            updatedFitting.passengers =
              type === 'control_cabin' ? calculatePassengers(updates.crew) : 0;
          }

          // If passenger count changed and this is a cabin, recalculate mass/cost
          if (updates.passengers && updatedFitting.type === 'cabin') {
            updatedFitting.mass = calculateCabinMass(updates.passengers);
            updatedFitting.cost = calculateCabinCost(updates.passengers);
          }

          // For airlocks, mass and cost are per-unit, so quantity change alone handles total

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
            <strong>Cost:</strong> {(calculateCockpitCost(hullTonnage) / 1000000).toFixed(2)} MCr
            (0.1 MCr per 20 tons of hull)
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

        <h3>Add Passenger Cabin</h3>
        <p className="info">
          Passenger cabins provide accommodation for passengers. Each cabin uses{' '}
          {CABIN_TONS_PER_PASSENGER} tons per passenger and costs{' '}
          {(CABIN_COST_PER_TON / 1000000).toFixed(2)} MCr per ton.
        </p>

        <div className="form-group">
          <label htmlFor="cabinPassengers">Number of Passengers:</label>
          <input
            type="number"
            id="cabinPassengers"
            value={cabinPassengers}
            onChange={(e) => setCabinPassengers(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            step={1}
          />
        </div>

        <div className="fitting-preview">
          <p>
            <strong>Mass:</strong> {calculateCabinMass(cabinPassengers)} tons
          </p>
          <p>
            <strong>Cost:</strong> {(calculateCabinCost(cabinPassengers) / 1000000).toFixed(2)} MCr
            ({(CABIN_COST_PER_TON / 1000000).toFixed(2)} MCr per ton)
          </p>
          <p>
            <strong>Passenger Capacity:</strong> {cabinPassengers}
          </p>
        </div>

        <button onClick={handleAddCabin} className="btn-primary">
          Add Passenger Cabin
        </button>

        <h3>Add Airlock</h3>
        <p className="info">
          Airlocks provide entry/exit points for the craft. Each airlock uses {AIRLOCK_MASS} ton
          and costs {(AIRLOCK_COST / 1000000).toFixed(1)} MCr. Maximum {AIRLOCK_MAX_QUANTITY}{' '}
          airlocks (optional).
        </p>

        <div className="form-group">
          <label htmlFor="airlockQuantity">Number of Airlocks:</label>
          <input
            type="number"
            id="airlockQuantity"
            value={airlockQuantity}
            onChange={(e) =>
              setAirlockQuantity(
                Math.max(1, Math.min(AIRLOCK_MAX_QUANTITY, parseInt(e.target.value) || 1))
              )
            }
            min={1}
            max={AIRLOCK_MAX_QUANTITY}
            step={1}
          />
        </div>

        <div className="fitting-preview">
          <p>
            <strong>Quantity:</strong> {airlockQuantity}
          </p>
          <p>
            <strong>Mass per Airlock:</strong> {AIRLOCK_MASS} ton
          </p>
          <p>
            <strong>Total Mass:</strong> {calculateAirlockMass(airlockQuantity)} tons
          </p>
          <p>
            <strong>Cost per Airlock:</strong> {(AIRLOCK_COST / 1000000).toFixed(1)} MCr
          </p>
          <p>
            <strong>Total Cost:</strong> {(calculateAirlockCost(airlockQuantity) / 1000000).toFixed(2)}{' '}
            MCr
          </p>
        </div>

        <button onClick={handleAddAirlock} className="btn-primary">
          Add Airlock{airlockQuantity > 1 ? 's' : ''}
        </button>

        <h3>Add Other Fittings</h3>
        <div className="other-fittings">
          <div className="fitting-option">
            <h4>Fresher</h4>
            <p className="info">Bathroom facilities for the crew and passengers.</p>
            <p>
              <strong>Mass:</strong> {FRESHER_MASS} ton
            </p>
            <p>
              <strong>Cost:</strong> {(FRESHER_COST / 1000000).toFixed(1)} MCr
            </p>
            <button onClick={handleAddFresher} className="btn-secondary">
              Add Fresher
            </button>
          </div>

          <div className="fitting-option">
            <h4>Galley</h4>
            <p className="info">Kitchen facilities (Fridge, Sink, Microwave).</p>
            <p>
              <strong>Mass:</strong> {GALLEY_MASS} tons
            </p>
            <p>
              <strong>Cost:</strong> {(GALLEY_COST / 1000000).toFixed(1)} MCr
            </p>
            <button onClick={handleAddGalley} className="btn-secondary">
              Add Galley
            </button>
          </div>
        </div>

        <h3>Installed Fittings</h3>
        <div className="fittings-list">
          {fittings.length === 0 ? (
            <p>No fittings configured. Add at least a cockpit or control cabin.</p>
          ) : (
            fittings.map((fitting) => (
              <div key={fitting.id} className="fitting-item">
                <div className="fitting-details">
                  <h4>
                    {fitting.name}
                    {fitting.type === 'airlock' && fitting.quantity > 1 && ` (×${fitting.quantity})`}
                  </h4>
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
                  {fitting.type === 'cabin' && (
                    <>
                      <div className="form-group">
                        <label>Passengers:</label>
                        <input
                          type="number"
                          value={fitting.passengers || 1}
                          onChange={(e) =>
                            handleUpdateFitting(fitting.id, {
                              passengers: Math.max(1, parseInt(e.target.value) || 1),
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
                        <strong>Cost:</strong> {(fitting.cost / 1000000).toFixed(2)} MCr (
                        {(CABIN_COST_PER_TON / 1000000).toFixed(2)} MCr per ton)
                      </p>
                    </>
                  )}
                  {fitting.type === 'airlock' && (
                    <>
                      <div className="form-group">
                        <label>Quantity:</label>
                        <input
                          type="number"
                          value={fitting.quantity}
                          onChange={(e) =>
                            handleUpdateFitting(fitting.id, {
                              quantity: Math.max(
                                1,
                                Math.min(AIRLOCK_MAX_QUANTITY, parseInt(e.target.value) || 1)
                              ),
                            })
                          }
                          min={1}
                          max={AIRLOCK_MAX_QUANTITY}
                          step={1}
                        />
                      </div>
                      <p>
                        <strong>Mass:</strong> {fitting.mass * fitting.quantity} tons ({AIRLOCK_MASS}{' '}
                        ton each)
                      </p>
                      <p>
                        <strong>Cost:</strong> {((fitting.cost * fitting.quantity) / 1000000).toFixed(2)}{' '}
                        MCr ({(AIRLOCK_COST / 1000000).toFixed(1)} MCr each)
                      </p>
                    </>
                  )}
                  {(fitting.type === 'fresher' || fitting.type === 'galley') && (
                    <>
                      <p>
                        <strong>Mass:</strong> {fitting.mass} tons
                      </p>
                      <p>
                        <strong>Cost:</strong> {(fitting.cost / 1000000).toFixed(1)} MCr
                      </p>
                    </>
                  )}
                  {fitting.type !== 'cockpit' &&
                    fitting.type !== 'control_cabin' &&
                    fitting.type !== 'cabin' &&
                    fitting.type !== 'airlock' &&
                    fitting.type !== 'fresher' &&
                    fitting.type !== 'galley' && (
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
