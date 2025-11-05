import React from 'react';
import { Weapon } from '../types/ship';

interface WeaponsPanelProps {
  weapons: Weapon[];
  onUpdate: (weapons: Weapon[]) => void;
}

export const WeaponsPanel: React.FC<WeaponsPanelProps> = ({ weapons, onUpdate }) => {
  const handleAddWeapon = () => {
    const newWeapon: Weapon = {
      id: `weapon-${Date.now()}`,
      type: 'pulse_laser',
      name: 'Pulse Laser',
      mass: 0.5,
      cost: 500000,
      quantity: 1,
      mountType: 'fixed',
    };
    onUpdate([...weapons, newWeapon]);
  };

  const handleRemoveWeapon = (id: string) => {
    onUpdate(weapons.filter((w) => w.id !== id));
  };

  return (
    <div className="panel weapons-panel">
      <h2>Weapons Configuration</h2>
      <div className="panel-content">
        <p className="info">Configure offensive systems. Mount limits based on small craft tonnage.</p>

        <button onClick={handleAddWeapon} className="btn-primary">
          Add Weapon
        </button>

        <div className="weapons-list">
          {weapons.length === 0 ? (
            <p>No weapons configured. This craft is unarmed.</p>
          ) : (
            weapons.map((weapon) => (
              <div key={weapon.id} className="weapon-item">
                <span>
                  {weapon.name} (x{weapon.quantity}) - {weapon.mountType}
                </span>
                <button onClick={() => handleRemoveWeapon(weapon.id)}>Remove</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
