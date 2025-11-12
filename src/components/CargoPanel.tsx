import React, { useEffect } from 'react';
import { Cargo, Weapon } from '../types/ship';
import { SHIPS_LOCKER_COST_PER_TON, calculateShipsLockerCost, MISSILE_RELOAD_COST_PER_TON, calculateMissileReloadCost } from '../data/constants';

interface CargoPanelProps {
  cargo: Cargo;
  weapons: Weapon[];
  hullTonnage: number;
  currentMass: number; // Total mass currently used (excluding cargo)
  onUpdate: (cargo: Cargo) => void;
}

export const CargoPanel: React.FC<CargoPanelProps> = ({ cargo, weapons, hullTonnage, currentMass, onUpdate }) => {
  const handleChange = (field: keyof Cargo, value: number | boolean) => {
    onUpdate({ ...cargo, [field]: value });
  };

  // Check if any missile launcher turrets are installed
  const hasMissileLaunchers = weapons.some(
    (w) => w.type.startsWith('missile_launcher_') && w.category === 'ship'
  );

  const missileReloads = cargo.missileReloads || 0;
  const modularCutterBayMass = cargo.modularCutterBay ? 30 : 0;
  const totalCargoMass = cargo.cargoBay + cargo.shipsLocker + missileReloads + modularCutterBayMass;
  const shipsLockerCost = calculateShipsLockerCost(cargo.shipsLocker);
  const missileReloadCost = calculateMissileReloadCost(missileReloads);
  const totalCargoCost = shipsLockerCost + missileReloadCost;

  // Calculate available tonnage (excluding current cargo being configured)
  const availableTonnage = hullTonnage - currentMass;

  // Auto-clear modular cutter bay if no longer enough space
  useEffect(() => {
    if (cargo.modularCutterBay && availableTonnage < 30) {
      onUpdate({ ...cargo, modularCutterBay: false });
    }
  }, [availableTonnage]);

  return (
    <div className="panel cargo-panel">
      <h2>Cargo Configuration</h2>
      <div className="panel-content">
        <p className="info">
          Configure cargo bay and ship's locker space. Cargo bay is free, ship's locker costs{' '}
          {(SHIPS_LOCKER_COST_PER_TON / 1000000).toFixed(1)} MCr per ton.
        </p>

        <h3>Cargo Bay</h3>
        <p className="info">
          General cargo storage space. Uses tonnage but has no cost.
        </p>
        <div className="form-group">
          <label htmlFor="cargoBay">Cargo Bay (tons):</label>
          <input
            type="number"
            id="cargoBay"
            value={cargo.cargoBay}
            onChange={(e) => handleChange('cargoBay', parseFloat(e.target.value) || 0)}
            min={0}
            step={0.1}
          />
        </div>
        <div className="cargo-info">
          <p>
            <strong>Mass:</strong> {cargo.cargoBay.toFixed(1)} tons
          </p>
          <p>
            <strong>Cost:</strong> 0 MCr (free)
          </p>
        </div>

        <h3>Ship's Locker</h3>
        <p className="info">
          Secure storage for equipment, supplies, and valuable items.
        </p>
        <div className="form-group">
          <label htmlFor="shipsLocker">Ship's Locker (tons):</label>
          <input
            type="number"
            id="shipsLocker"
            value={cargo.shipsLocker}
            onChange={(e) => handleChange('shipsLocker', parseFloat(e.target.value) || 0)}
            min={0}
            step={0.1}
          />
        </div>
        <div className="cargo-info">
          <p>
            <strong>Mass:</strong> {cargo.shipsLocker.toFixed(1)} tons
          </p>
          <p>
            <strong>Cost:</strong> {(shipsLockerCost / 1000000).toFixed(2)} MCr (
            {(SHIPS_LOCKER_COST_PER_TON / 1000000).toFixed(1)} MCr per ton)
          </p>
        </div>

        {hasMissileLaunchers && (
          <>
            <h3>Missile Reloads</h3>
            <p className="info">
              Additional missiles for reloading missile launcher turrets. Costs{' '}
              {(MISSILE_RELOAD_COST_PER_TON / 1000000).toFixed(2)} MCr per ton.
            </p>
            <div className="form-group">
              <label htmlFor="missileReloads">Missile Reloads (tons):</label>
              <input
                type="number"
                id="missileReloads"
                value={missileReloads}
                onChange={(e) => handleChange('missileReloads', parseFloat(e.target.value) || 0)}
                min={0}
                step={0.1}
              />
            </div>
            <div className="cargo-info">
              <p>
                <strong>Mass:</strong> {missileReloads.toFixed(1)} tons
              </p>
              <p>
                <strong>Cost:</strong> {(missileReloadCost / 1000000).toFixed(2)} MCr (
                {(MISSILE_RELOAD_COST_PER_TON / 1000000).toFixed(2)} MCr per ton)
              </p>
            </div>
          </>
        )}

        {availableTonnage >= 30 && (
          <>
            <h3>Modular Cutter Bay</h3>
            <p className="info">
              A docking bay for a modular cutter. Takes 30 tons, no cost.
            </p>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  id="modularCutterBay"
                  checked={cargo.modularCutterBay || false}
                  onChange={(e) => handleChange('modularCutterBay', e.target.checked)}
                />
                <span>Add Modular Cutter Bay</span>
              </label>
            </div>
            {cargo.modularCutterBay && (
              <div className="cargo-info">
                <p>
                  <strong>Mass:</strong> 30.0 tons
                </p>
                <p>
                  <strong>Cost:</strong> 0.00 MCr (free)
                </p>
              </div>
            )}
          </>
        )}

        <h3>Total Cargo Summary</h3>
        <div className="cargo-summary">
          <p>
            <strong>Total Cargo Mass:</strong> {totalCargoMass.toFixed(1)} tons
          </p>
          <p>
            <strong>Total Cargo Cost:</strong> {(totalCargoCost / 1000000).toFixed(2)} MCr
          </p>
        </div>
      </div>
    </div>
  );
};
