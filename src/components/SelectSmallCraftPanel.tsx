import React, { useState, useEffect } from 'react';
import { SmallCraftDesign } from '../types/ship';
import { loadAllSmallCraft, deleteSmallCraft } from '../services/database';
import { calculateShipsLockerCost, calculateMissileReloadCost } from '../data/constants';
import { initializeDatabase } from '../services/initialDataService';

interface SelectSmallCraftPanelProps {
  onSelectCraft: (craft: SmallCraftDesign | null) => void;
  onCreateNew: () => void;
}

export const SelectSmallCraftPanel: React.FC<SelectSmallCraftPanelProps> = ({
  onSelectCraft,
  onCreateNew,
}) => {
  const [savedCraft, setSavedCraft] = useState<SmallCraftDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate total cost for a craft
  const calculateCraftCost = (design: SmallCraftDesign): number => {
    const hullCost = design.hull.cost;
    const drivesCost = design.drives.reduce(
      (sum, drive) => sum + drive.cost * drive.quantity,
      0
    );
    const fittingsCost = design.fittings.reduce(
      (sum, fitting) => sum + fitting.cost * fitting.quantity,
      0
    );
    const weaponsCost = design.weapons.reduce(
      (sum, weapon) => sum + weapon.cost * weapon.quantity,
      0
    );
    const armorCost = design.armor ? design.armor.cost : 0;
    const cargoCost =
      calculateShipsLockerCost(design.cargo.shipsLocker) +
      calculateMissileReloadCost(design.cargo.missileReloads || 0);

    return hullCost + drivesCost + fittingsCost + weaponsCost + armorCost + cargoCost;
  };

  // Calculate total crew for a craft
  const calculateTotalCrew = (design: SmallCraftDesign): number => {
    const optionalCrew =
      (design.staff.engineer ? 1 : 0) +
      (design.staff.comms ? 1 : 0) +
      (design.staff.sensors ? 1 : 0) +
      (design.staff.ecm ? 1 : 0);
    return design.staff.pilot + design.staff.gunner + optionalCrew + design.staff.other;
  };

  // Load saved craft on mount
  useEffect(() => {
    loadCraft();
  }, []);

  const loadCraft = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize database with default data if empty
      await initializeDatabase();

      const craft = await loadAllSmallCraft();
      // Sort by most recently updated
      craft.sort((a, b) => {
        const aDate = a.updatedAt || a.createdAt || '';
        const bDate = b.updatedAt || b.createdAt || '';
        return bDate.localeCompare(aDate);
      });
      setSavedCraft(craft);
    } catch (err) {
      console.error('Failed to load craft:', err);
      setError('Failed to load saved craft');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCraft = (craft: SmallCraftDesign) => {
    onSelectCraft(craft);
  };

  const handleDeleteCraft = async (craft: SmallCraftDesign, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the craft

    if (!craft.id) return;

    if (window.confirm(`Are you sure you want to delete "${craft.name}"?`)) {
      try {
        await deleteSmallCraft(craft.id);
        await loadCraft(); // Reload the list
      } catch (err) {
        console.error('Failed to delete craft:', err);
        alert('Failed to delete craft');
      }
    }
  };

  return (
    <div className="panel select-craft-panel">
      <h2>Select Small Craft</h2>
      <div className="panel-content">
        <p>Load an existing small craft design or create a new one.</p>
        <button onClick={onCreateNew} className="btn-primary">
          Create New Small Craft
        </button>

        <div className="craft-list">
          {loading && <p>Loading saved craft...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && savedCraft.length === 0 && (
            <p>No saved craft found. Create a new one to get started!</p>
          )}

          {!loading && !error && savedCraft.length > 0 && (
            <>
              <h3>Saved Craft ({savedCraft.length})</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
              }}>
                {savedCraft.map((craft) => (
                  <div
                    key={craft.id}
                    className="craft-item"
                    onClick={() => handleSelectCraft(craft)}
                    style={{
                      cursor: 'pointer',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <strong>{craft.name}</strong>
                      <div style={{ fontSize: '0.9em', color: '#666' }}>
                        {craft.hull.tonnage} tons, {calculateTotalCrew(craft)} crew, TL {craft.hull.techLevel}
                        {craft.armor && <span>, AF-{craft.armor.rating}</span>}, {Math.ceil((calculateCraftCost(craft) / 1000000) * 10) / 10} MCr
                        {craft.updatedAt && (
                          <span> • Updated: {new Date(craft.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteCraft(craft, e)}
                      style={{
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
