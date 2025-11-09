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
        </div>
      </div>
    </div>
  );
};
