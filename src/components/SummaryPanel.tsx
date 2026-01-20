import React from 'react';
import { SmallCraftDesign } from '../types/ship';
import { formatPerformanceRating } from '../data/constants';

interface SummaryPanelProps {
  design: SmallCraftDesign;
  totalMass: number;
  totalCost: number;
  onSave: () => void;
  onPrint: () => void;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  design,
  totalMass,
  totalCost,
  onSave,
  onPrint,
}) => {
  const handleExportCSV = () => {
    const rows: string[] = [];

    // Helper function to escape CSV values
    const escapeCSV = (value: string | number): string => {
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    };

    // Helper function to convert credits to MCr
    const toMCr = (credits: number): string => {
      return (credits / 1000000).toFixed(1);
    };

    // Line 1: Name
    rows.push(`Name,${escapeCSV(design.name)}`);

    // Line 2: Description (if exists)
    if (design.description && design.description.trim() !== '') {
      rows.push(`Description,${escapeCSV(design.description)}`);
    }

    // Line 3: Hull summary
    rows.push(`Hull,${design.hull.tonnage} tons,${toMCr(totalCost)} MCr`);

    // Blank line
    rows.push('');

    // Header row
    rows.push('Category,Item,Tons,Cost (MCr)');

    // Helper function to add a row
    const addRow = (category: string, item: string, tons: number | string, cost: number | string) => {
      rows.push(`${escapeCSV(category)},${escapeCSV(item)},${escapeCSV(tons)},${escapeCSV(cost)}`);
    };

    // Hull
    addRow('Hull', design.hull.description || `${design.hull.tonnageCode} (${design.hull.tonnage} tons)`, design.hull.tonnage, toMCr(design.hull.cost));

    // Armor (if exists) - shown in Hull category
    if (design.armor) {
      addRow('', `${design.armor.type} Rating ${design.armor.rating}`, design.armor.mass, toMCr(design.armor.cost));
    }

    // Drives
    let firstDrive = true;
    design.drives.forEach((drive) => {
      const driveCategory = drive.type === 'maneuver' ? 'maneuver' : 'powerPlant';
      const formattedRating = formatPerformanceRating(drive.rating, driveCategory);
      const driveDescription = `${drive.type} - Model ${drive.model} (${formattedRating})`;
      addRow(firstDrive ? 'Drives' : '', driveDescription, drive.mass, toMCr(drive.cost));
      firstDrive = false;
    });

    // Fuel
    addRow('Fuel', `${design.fuel.amount} tons (${design.fuel.duration} hours)`, design.fuel.mass, '0.0');

    // Fittings
    let firstFitting = true;
    design.fittings.forEach((fitting) => {
      let displayText = fitting.name;

      if (fitting.type === 'cockpit' || fitting.type === 'control_cabin') {
        displayText += ` (${fitting.crew || 1} crew)`;
      } else if (fitting.type === 'cabin') {
        displayText += ` (${fitting.passengers || 1} passenger${(fitting.passengers || 1) > 1 ? 's' : ''})`;
      } else if (fitting.type === 'electronics') {
        displayText += ` (DM ${fitting.dieModifier !== undefined && fitting.dieModifier >= 0 ? '+' : ''}${fitting.dieModifier})`;
      } else if (fitting.quantity > 1) {
        displayText += ` x${fitting.quantity}`;
      }

      addRow(firstFitting ? 'Fittings' : '', displayText, fitting.mass, toMCr(fitting.cost));
      firstFitting = false;
    });

    // Weapons
    if (design.weapons.length > 0) {
      let firstWeapon = true;
      design.weapons.forEach((weapon) => {
        const weaponDescription = `${weapon.name} x${weapon.quantity} (${weapon.mountType})`;
        addRow(firstWeapon ? 'Weapons' : '', weaponDescription, weapon.mass, toMCr(weapon.cost));
        firstWeapon = false;
      });
    } else {
      addRow('Weapons', 'Unarmed', 0, '0.0');
    }

    // Cargo
    const cargoItems: Array<{item: string, tons: number, cost: number}> = [];
    if (design.cargo.cargoBay > 0) {
      cargoItems.push({ item: `Cargo Bay (${design.cargo.cargoBay} tons)`, tons: design.cargo.cargoBay, cost: 0 });
    }
    if (design.cargo.shipsLocker > 0) {
      // Ship's locker cost is 0.2 MCr per ton, stored as MCr value
      const lockerCostMCr = design.cargo.shipsLocker * 0.2;
      cargoItems.push({ item: `Ship's Locker (${design.cargo.shipsLocker} tons)`, tons: design.cargo.shipsLocker, cost: lockerCostMCr });
    }
    if (design.cargo.missileReloads && design.cargo.missileReloads > 0) {
      cargoItems.push({ item: `Missile Reloads (${design.cargo.missileReloads} tons)`, tons: design.cargo.missileReloads, cost: 0 });
    }
    if (design.cargo.modularCutterBay) {
      cargoItems.push({ item: 'Modular Cutter Bay (30 tons)', tons: 30, cost: 0 });
    }

    if (cargoItems.length > 0) {
      let firstCargo = true;
      cargoItems.forEach((cargo) => {
        // Cargo costs are already in MCr for ship's locker, format to 1 decimal
        const costStr = cargo.cost === 0 ? '0.0' : cargo.cost.toFixed(1);
        addRow(firstCargo ? 'Cargo' : '', cargo.item, cargo.tons, costStr);
        firstCargo = false;
      });
    }

    // Staff (no tons or cost)
    const staffItems: string[] = [];
    staffItems.push(`Pilots: ${design.staff.pilot}`);
    if (design.staff.gunner > 0) staffItems.push(`Gunners: ${design.staff.gunner}`);
    if (design.staff.engineer) staffItems.push('Engineer: 1');
    if (design.staff.comms) staffItems.push('Communications: 1');
    if (design.staff.sensors) staffItems.push('Sensors: 1');
    if (design.staff.ecm) staffItems.push('ECM: 1');
    if (design.staff.other > 0) staffItems.push(`Other: ${design.staff.other}`);

    const totalCrew = design.staff.pilot +
      design.staff.gunner +
      (design.staff.engineer ? 1 : 0) +
      (design.staff.comms ? 1 : 0) +
      (design.staff.sensors ? 1 : 0) +
      (design.staff.ecm ? 1 : 0) +
      design.staff.other;

    let firstStaff = true;
    staffItems.forEach((item) => {
      addRow(firstStaff ? 'Staff' : '', item, 0, '0.0');
      firstStaff = false;
    });
    addRow('', `Total Crew: ${totalCrew}`, 0, '0.0');

    // Totals
    addRow('', '', '', '');
    addRow('TOTALS', 'Total Mass', totalMass.toFixed(2), '');
    addRow('', 'Hull Capacity', design.hull.tonnage, '');
    addRow('', 'Total Cost', '', toMCr(totalCost));

    // Create CSV content
    const csvContent = rows.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Use ship name as filename
    const filename = `${design.name.replace(/[^a-z0-9]/gi, '_')}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="panel summary-panel">
      <h2>Small Craft Design Summary</h2>
      <div className="panel-content">
        <div className="summary-header">
          <h3>{design.name}</h3>
          <p>{design.hull.description}</p>
        </div>

        <div className="summary-section">
          <h4>Hull</h4>
          <ul>
            <li>Tech Level: {design.hull.techLevel}</li>
            <li>
              Tonnage: {design.hull.tonnageCode} ({design.hull.tonnage} tons)
            </li>
          </ul>
        </div>

        {design.armor && (
          <div className="summary-section">
            <h4>Armor</h4>
            <ul>
              <li>Type: {design.armor.type}</li>
              <li>Rating: {design.armor.rating}</li>
            </ul>
          </div>
        )}

        <div className="summary-section">
          <h4>Drives</h4>
          <ul>
            {design.drives.map((drive) => {
              // Format rating based on drive type
              const driveCategory = drive.type === 'maneuver' ? 'maneuver' : 'powerPlant';
              const formattedRating = formatPerformanceRating(drive.rating, driveCategory);

              return (
                <li key={drive.id}>
                  {drive.type} - Model {drive.model} ({formattedRating})
                </li>
              );
            })}
          </ul>
        </div>

        <div className="summary-section">
          <h4>Fuel</h4>
          <ul>
            <li>Amount: {design.fuel.amount} tons</li>
            <li>Duration: {design.fuel.duration} hours</li>
          </ul>
        </div>

        <div className="summary-section">
          <h4>Fittings</h4>
          <ul>
            {design.fittings.map((fitting) => {
              // Special display logic based on fitting type
              let displayText = fitting.name;

              if (fitting.type === 'cockpit' || fitting.type === 'control_cabin') {
                // Show crew count for cockpit/control cabin
                displayText += ` (${fitting.crew || 1} crew)`;
              } else if (fitting.type === 'cabin') {
                // Show passenger count for cabins
                displayText += ` (${fitting.passengers || 1} passenger${(fitting.passengers || 1) > 1 ? 's' : ''})`;
              } else if (fitting.type === 'electronics') {
                // Show DM for electronics
                displayText += ` (DM ${fitting.dieModifier !== undefined && fitting.dieModifier >= 0 ? '+' : ''}${fitting.dieModifier})`;
              } else if (fitting.quantity > 1) {
                // Show quantity for other fittings only if > 1
                displayText += ` x${fitting.quantity}`;
              }

              return (
                <li key={fitting.id}>
                  {displayText}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="summary-section">
          <h4>Weapons</h4>
          {design.weapons.length === 0 ? (
            <p>Unarmed</p>
          ) : (
            <ul>
              {design.weapons.map((weapon) => (
                <li key={weapon.id}>
                  {weapon.name} x{weapon.quantity} ({weapon.mountType})
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="summary-section">
          <h4>Staff</h4>
          <ul>
            <li>Pilots: {design.staff.pilot}</li>
            {design.staff.gunner > 0 && <li>Gunners: {design.staff.gunner}</li>}
            {design.staff.engineer && <li>Engineer: 1</li>}
            {design.staff.comms && <li>Communications: 1</li>}
            {design.staff.sensors && <li>Sensors: 1</li>}
            {design.staff.ecm && <li>ECM: 1</li>}
            {design.staff.other > 0 && <li>Other: {design.staff.other}</li>}
            <li>
              <strong>
                Total Crew:{' '}
                {design.staff.pilot +
                  design.staff.gunner +
                  (design.staff.engineer ? 1 : 0) +
                  (design.staff.comms ? 1 : 0) +
                  (design.staff.sensors ? 1 : 0) +
                  (design.staff.ecm ? 1 : 0) +
                  design.staff.other}
              </strong>
            </li>
          </ul>
        </div>

        <div className="summary-totals">
          <div className="total-item">
            <strong>Total Mass:</strong> {totalMass.toFixed(2)} / {design.hull.tonnage} tons
          </div>
          <div className="total-item">
            <strong>Total Cost:</strong> {totalCost.toLocaleString()} credits
          </div>
        </div>

        <div className="summary-actions">
          <button onClick={onSave} className="btn-primary">
            Save Design
          </button>
          <button onClick={onPrint} className="btn-secondary">
            Print
          </button>
          <button onClick={handleExportCSV} className="btn-secondary">
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};
