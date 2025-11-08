import React, { useState } from 'react';
import { Weapon, Drive } from '../types/ship';
import {
  getWeaponLimits,
  getAvailableShipWeapons,
  SHIP_WEAPONS,
  calculateTotalEnergyWeaponCapacity,
  calculateEnergyWeaponCount,
} from '../data/constants';

interface WeaponsPanelProps {
  weapons: Weapon[];
  hullTonnage: number;
  drives: Drive[];
  onUpdate: (weapons: Weapon[]) => void;
}

export const WeaponsPanel: React.FC<WeaponsPanelProps> = ({
  weapons,
  hullTonnage,
  drives,
  onUpdate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ship' | 'anti-personnel'>('ship');
  const [selectedShipWeapon, setSelectedShipWeapon] = useState<string>('pulse_laser_single');

  const weaponLimits = getWeaponLimits(hullTonnage);
  const availableShipWeapons = getAvailableShipWeapons(hullTonnage);

  // Calculate total energy weapon capacity from all power plants
  const powerPlants = drives.filter((d) => d.type === 'powerPlant');
  const energyWeaponCapacity = calculateTotalEnergyWeaponCapacity(drives);

  // Count current energy weapons
  const currentEnergyWeaponCount = calculateEnergyWeaponCount(weapons);

  // Count current weapon slots used (not just weapon count)
  const shipWeaponSlotsUsed = weapons
    .filter(w => w.category === 'ship')
    .reduce((sum, w) => sum + (w.slotsUsed || 1), 0);
  const antiPersonnelWeaponCount = weapons.filter(w => w.category === 'anti-personnel').length;

  // Check if we can add more weapons (considering slots used and energy weapon capacity)
  const selectedWeaponSpec = SHIP_WEAPONS[selectedShipWeapon];

  let canAddShipWeapon = false;
  if (selectedWeaponSpec) {
    // Check ship weapon slots
    const hasSlots = (shipWeaponSlotsUsed + selectedWeaponSpec.slotsUsed) <= weaponLimits.shipWeapons;

    // Check energy weapon capacity if this is an energy weapon
    let hasEnergyCapacity = true;
    if (selectedWeaponSpec.energyWeapons > 0) {
      hasEnergyCapacity = (currentEnergyWeaponCount + selectedWeaponSpec.energyWeapons) <= energyWeaponCapacity;
    }

    canAddShipWeapon = hasSlots && hasEnergyCapacity;
  }

  const canAddAntiPersonnelWeapon = antiPersonnelWeaponCount < weaponLimits.antiPersonnelWeapons;

  const handleAddWeapon = () => {
    // Don't add if we've reached the limit
    if (selectedCategory === 'ship' && !canAddShipWeapon) return;
    if (selectedCategory === 'anti-personnel' && !canAddAntiPersonnelWeapon) return;

    if (selectedCategory === 'ship') {
      const spec = SHIP_WEAPONS[selectedShipWeapon];
      const newWeapon: Weapon = {
        id: `weapon-${Date.now()}`,
        type: selectedShipWeapon,
        name: spec.name,
        category: 'ship',
        mass: spec.mass,
        cost: spec.cost,
        quantity: 1,
        slotsUsed: spec.slotsUsed,
        mountType: 'turret',
      };
      onUpdate([...weapons, newWeapon]);
    } else {
      const newWeapon: Weapon = {
        id: `weapon-${Date.now()}`,
        type: 'rifle',
        name: 'Anti-Personnel Rifle',
        category: 'anti-personnel',
        mass: 0.05,
        cost: 50000,
        quantity: 1,
      };
      onUpdate([...weapons, newWeapon]);
    }
  };

  const handleRemoveWeapon = (id: string) => {
    onUpdate(weapons.filter((w) => w.id !== id));
  };

  return (
    <div className="panel weapons-panel">
      <h2>Weapons Configuration</h2>
      <div className="panel-content">
        <h3>Weapon Limits for {hullTonnage}-ton Hull</h3>
        <div className="weapon-limits-display">
          <div className="limit-item">
            <strong>Ship Weapon Slots:</strong> {shipWeaponSlotsUsed} / {weaponLimits.shipWeapons}
            {shipWeaponSlotsUsed >= weaponLimits.shipWeapons && (
              <span className="warning"> (Maximum reached)</span>
            )}
          </div>
          <div className="limit-item">
            <strong>Energy Weapon Capacity:</strong> {currentEnergyWeaponCount} /{' '}
            {energyWeaponCapacity}
            {powerPlants.length === 0 && <span className="warning"> (No power plant installed)</span>}
            {powerPlants.length > 0 && energyWeaponCapacity === 0 && (
              <span className="warning"> (Power plant(s) too small for energy weapons)</span>
            )}
            {currentEnergyWeaponCount >= energyWeaponCapacity && energyWeaponCapacity > 0 && (
              <span className="warning"> (Maximum reached)</span>
            )}
          </div>
          <div className="limit-item">
            <strong>Anti-Personnel Weapons:</strong> {antiPersonnelWeaponCount} /{' '}
            {weaponLimits.antiPersonnelWeapons}
            {antiPersonnelWeaponCount >= weaponLimits.antiPersonnelWeapons && (
              <span className="warning"> (Maximum reached)</span>
            )}
          </div>
        </div>
        {powerPlants.length > 0 && (
          <p className="info-text">
            {powerPlants.length === 1 ? (
              <>
                Power Plant: {powerPlants[0].model} (supports {energyWeaponCapacity} energy weapon
                {energyWeaponCapacity !== 1 ? 's' : ''})
              </>
            ) : (
              <>
                Power Plants: {powerPlants.map(pp => pp.model).join(', ')} (combined capacity: {energyWeaponCapacity} energy weapon
                {energyWeaponCapacity !== 1 ? 's' : ''})
              </>
            )}
          </p>
        )}

        <h3>Add Weapon</h3>
        <div className="form-group">
          <label htmlFor="weaponCategory">Weapon Category:</label>
          <select
            id="weaponCategory"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as 'ship' | 'anti-personnel')}
          >
            <option value="ship">Ship Weapon</option>
            <option value="anti-personnel">Anti-Personnel Weapon</option>
          </select>
        </div>

        {selectedCategory === 'ship' && (
          <>
            <div className="form-group">
              <label htmlFor="shipWeaponType">Weapon Type:</label>
              <select
                id="shipWeaponType"
                value={selectedShipWeapon}
                onChange={(e) => setSelectedShipWeapon(e.target.value)}
              >
                {Object.entries(availableShipWeapons).map(([key, spec]) => (
                  <option key={key} value={key}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedWeaponSpec && (
              <div className="weapon-preview">
                <p>
                  <strong>Mass:</strong> {selectedWeaponSpec.mass} tons
                </p>
                <p>
                  <strong>Cost:</strong> {(selectedWeaponSpec.cost / 1000000).toFixed(1)} MCr
                </p>
                <p>
                  <strong>Slots Used:</strong> {selectedWeaponSpec.slotsUsed}
                  {selectedWeaponSpec.slotsUsed > 1 && (
                    <span className="info-text"> (counts as {selectedWeaponSpec.slotsUsed} ship weapons)</span>
                  )}
                </p>
                {selectedWeaponSpec.energyWeapons > 0 && (
                  <p>
                    <strong>Energy Weapons:</strong> {selectedWeaponSpec.energyWeapons}
                    {selectedWeaponSpec.energyWeapons > 1 && (
                      <span className="info-text">
                        {' '}
                        ({selectedWeaponSpec.energyWeapons} lasers/beams)
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {selectedCategory === 'anti-personnel' && (
          <div className="weapon-preview">
            <p className="info">
              Small arms for personnel defense (rifles, pistols, etc.)
            </p>
            <p>
              <strong>Mass:</strong> 0.05 tons
            </p>
            <p>
              <strong>Cost:</strong> 0.05 MCr
            </p>
          </div>
        )}

        <button
          onClick={handleAddWeapon}
          className="btn-primary"
          disabled={
            (selectedCategory === 'ship' && !canAddShipWeapon) ||
            (selectedCategory === 'anti-personnel' && !canAddAntiPersonnelWeapon)
          }
        >
          Add {selectedCategory === 'ship' ? 'Ship' : 'Anti-Personnel'} Weapon
        </button>

        {selectedCategory === 'ship' && !canAddShipWeapon && selectedWeaponSpec && (
          <>
            {shipWeaponSlotsUsed + selectedWeaponSpec.slotsUsed > weaponLimits.shipWeapons && (
              <p className="warning">
                Cannot add {selectedWeaponSpec.name} - requires {selectedWeaponSpec.slotsUsed}{' '}
                slot(s) but only {weaponLimits.shipWeapons - shipWeaponSlotsUsed} remaining (
                {weaponLimits.shipWeapons} maximum for {hullTonnage}-ton hull)
              </p>
            )}
            {selectedWeaponSpec.energyWeapons > 0 &&
              shipWeaponSlotsUsed + selectedWeaponSpec.slotsUsed <= weaponLimits.shipWeapons && (
                <p className="warning">
                  Cannot add {selectedWeaponSpec.name} - insufficient energy weapon capacity.
                  Requires {selectedWeaponSpec.energyWeapons} energy weapon
                  {selectedWeaponSpec.energyWeapons > 1 ? 's' : ''}. Current:{' '}
                  {currentEnergyWeaponCount} / {energyWeaponCapacity} used.
                  {powerPlants.length === 0 && ' No power plant installed.'}
                  {powerPlants.length > 0 && energyWeaponCapacity === 0 && (
                    <span>
                      {' '}
                      Power plant{powerPlants.length > 1 ? 's' : ''} too small (requires sG or larger for energy
                      weapons).
                    </span>
                  )}
                </p>
              )}
          </>
        )}
        {selectedCategory === 'anti-personnel' && !canAddAntiPersonnelWeapon && (
          <p className="warning">
            Anti-personnel weapon limit reached ({weaponLimits.antiPersonnelWeapons} maximum for{' '}
            {hullTonnage}-ton hull)
          </p>
        )}

        <h3>Installed Weapons</h3>
        <div className="weapons-list">
          {weapons.length === 0 ? (
            <p>No weapons configured. This craft is unarmed.</p>
          ) : (
            <>
              {shipWeaponSlotsUsed > 0 && (
                <>
                  <h4>Ship Weapons ({shipWeaponSlotsUsed} slots used)</h4>
                  {weapons
                    .filter((w) => w.category === 'ship')
                    .map((weapon) => (
                      <div key={weapon.id} className="weapon-item">
                        <div className="weapon-details">
                          <strong>{weapon.name}</strong>
                          <p>
                            <strong>Mount:</strong> {weapon.mountType || 'Turret'}
                          </p>
                          <p>
                            <strong>Slots Used:</strong> {weapon.slotsUsed || 1}
                            {weapon.slotsUsed && weapon.slotsUsed > 1 && (
                              <span className="info-text"> (counts as {weapon.slotsUsed} ship weapons)</span>
                            )}
                          </p>
                          {(() => {
                            const weaponSpec = SHIP_WEAPONS[weapon.type];
                            return weaponSpec && weaponSpec.energyWeapons > 0 ? (
                              <p>
                                <strong>Energy Weapons:</strong> {weaponSpec.energyWeapons}
                                {weaponSpec.energyWeapons > 1 && (
                                  <span className="info-text">
                                    {' '}
                                    ({weaponSpec.energyWeapons} lasers/beams)
                                  </span>
                                )}
                              </p>
                            ) : null;
                          })()}
                          <p>
                            <strong>Mass:</strong> {weapon.mass} tons
                          </p>
                          <p>
                            <strong>Cost:</strong> {(weapon.cost / 1000000).toFixed(1)} MCr
                          </p>
                        </div>
                        <button onClick={() => handleRemoveWeapon(weapon.id)}>Remove</button>
                      </div>
                    ))}
                </>
              )}
              {antiPersonnelWeaponCount > 0 && (
                <>
                  <h4>Anti-Personnel Weapons ({antiPersonnelWeaponCount})</h4>
                  {weapons
                    .filter((w) => w.category === 'anti-personnel')
                    .map((weapon) => (
                      <div key={weapon.id} className="weapon-item">
                        <div className="weapon-details">
                          <strong>{weapon.name}</strong>
                          <p>
                            <strong>Mass:</strong> {weapon.mass} tons
                          </p>
                          <p>
                            <strong>Cost:</strong> {(weapon.cost / 1000000).toFixed(2)} MCr
                          </p>
                        </div>
                        <button onClick={() => handleRemoveWeapon(weapon.id)}>Remove</button>
                      </div>
                    ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
