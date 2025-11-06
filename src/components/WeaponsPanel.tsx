import React, { useState } from 'react';
import { Weapon } from '../types/ship';
import { getWeaponLimits, getAvailableShipWeapons, SHIP_WEAPONS } from '../data/constants';

interface WeaponsPanelProps {
  weapons: Weapon[];
  hullTonnage: number;
  onUpdate: (weapons: Weapon[]) => void;
}

export const WeaponsPanel: React.FC<WeaponsPanelProps> = ({ weapons, hullTonnage, onUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState<'ship' | 'anti-personnel'>('ship');
  const [selectedShipWeapon, setSelectedShipWeapon] = useState<string>('pulse_laser_single');

  const weaponLimits = getWeaponLimits(hullTonnage);
  const availableShipWeapons = getAvailableShipWeapons(hullTonnage);

  // Count current weapon slots used (not just weapon count)
  const shipWeaponSlotsUsed = weapons
    .filter(w => w.category === 'ship')
    .reduce((sum, w) => sum + (w.slotsUsed || 1), 0);
  const antiPersonnelWeaponCount = weapons.filter(w => w.category === 'anti-personnel').length;

  // Check if we can add more weapons (considering slots used)
  const selectedWeaponSpec = SHIP_WEAPONS[selectedShipWeapon];
  const canAddShipWeapon = selectedWeaponSpec &&
    (shipWeaponSlotsUsed + selectedWeaponSpec.slotsUsed) <= weaponLimits.shipWeapons;
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
            <strong>Anti-Personnel Weapons:</strong> {antiPersonnelWeaponCount} /{' '}
            {weaponLimits.antiPersonnelWeapons}
            {antiPersonnelWeaponCount >= weaponLimits.antiPersonnelWeapons && (
              <span className="warning"> (Maximum reached)</span>
            )}
          </div>
        </div>

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
          <p className="warning">
            Cannot add {selectedWeaponSpec.name} - requires {selectedWeaponSpec.slotsUsed} slot(s) but only{' '}
            {weaponLimits.shipWeapons - shipWeaponSlotsUsed} remaining ({weaponLimits.shipWeapons}{' '}
            maximum for {hullTonnage}-ton hull)
          </p>
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
