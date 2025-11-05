import React from 'react';
import { Hull } from '../types/ship';
import { TECH_LEVELS, getHullCode, getHullCost, mcrToCredits } from '../data/constants';

interface HullPanelProps {
  hull: Hull;
  onUpdate: (hull: Hull) => void;
}

export const HullPanel: React.FC<HullPanelProps> = ({ hull, onUpdate }) => {
  const handleChange = (field: keyof Hull, value: string | number) => {
    onUpdate({ ...hull, [field]: value });
  };

  const handleTonnageChange = (tonnage: number) => {
    const hullCode = getHullCode(tonnage);
    const hullCostMCr = getHullCost(tonnage);
    const hullCostCredits = mcrToCredits(hullCostMCr);

    onUpdate({
      ...hull,
      tonnage,
      tonnageCode: hullCode,
      cost: hullCostCredits,
    });
  };

  // Generate tonnage options from 10 to 100
  const tonnageOptions = Array.from({ length: 91 }, (_, i) => i + 10);

  return (
    <div className="panel hull-panel">
      <h2>Hull Configuration</h2>
      <div className="panel-content">
        <div className="form-group">
          <label htmlFor="name">Small Craft Name:</label>
          <input
            type="text"
            id="name"
            value={hull.name}
            onChange={(e) => handleChange('name', e.target.value)}
            maxLength={32}
            placeholder="Enter craft name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="techLevel">Tech Level:</label>
          <select
            id="techLevel"
            value={hull.techLevel}
            onChange={(e) => handleChange('techLevel', e.target.value)}
          >
            <option value="">Select Tech Level</option>
            {Object.keys(TECH_LEVELS).map((level) => (
              <option key={level} value={level}>
                {level} (TL {TECH_LEVELS[level as keyof typeof TECH_LEVELS]})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tonnage">Hull Tonnage:</label>
          <select
            id="tonnage"
            value={hull.tonnage || ''}
            onChange={(e) => handleTonnageChange(parseInt(e.target.value))}
          >
            <option value="">Select Tonnage</option>
            {tonnageOptions.map((tons) => (
              <option key={tons} value={tons}>
                {tons} tons
              </option>
            ))}
          </select>
        </div>

        {hull.tonnage > 0 && (
          <div className="info">
            <strong>Hull Code:</strong> {hull.tonnageCode.toUpperCase()} | <strong>Hull Cost:</strong>{' '}
            {(hull.cost / 1000000).toFixed(1)} MCr ({hull.cost.toLocaleString()} credits)
          </div>
        )}

        <div className="form-group">
          <label htmlFor="description">Description (optional):</label>
          <textarea
            id="description"
            value={hull.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter craft description"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};
