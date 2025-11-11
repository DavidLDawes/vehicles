import React from 'react';
import { Armor, Hull } from '../types/ship';
import {
  ARMOR_TYPES,
  getAvailableArmorTypes,
  calculateArmorMass,
  calculateArmorCost,
  TECH_LEVELS,
} from '../data/constants';

interface ArmorPanelProps {
  armor?: Armor;
  hull: Hull;
  onUpdate: (armor?: Armor) => void;
}

export const ArmorPanel: React.FC<ArmorPanelProps> = ({ armor, hull, onUpdate }) => {
  const availableArmorTypes = getAvailableArmorTypes(hull.techLevel);
  const techLevelNumber = TECH_LEVELS[hull.techLevel as keyof typeof TECH_LEVELS] || 0;

  const handleArmorTypeChange = (typeKey: string) => {
    if (typeKey === 'none') {
      onUpdate(undefined);
      return;
    }

    const armorDef = ARMOR_TYPES[typeKey];
    const maxArmor = armorDef.getMaxArmor(techLevelNumber);
    const newRating = armor ? Math.min(armor.rating, maxArmor) : 1;

    onUpdate({
      type: typeKey,
      rating: newRating,
      mass: calculateArmorMass(newRating, armorDef, hull.tonnage),
      cost: calculateArmorCost(newRating, armorDef, hull.cost),
    });
  };

  const handleArmorRatingChange = (rating: number) => {
    if (!armor) return;

    const armorDef = ARMOR_TYPES[armor.type];
    const maxArmor = armorDef.getMaxArmor(techLevelNumber);
    const clampedRating = Math.max(1, Math.min(rating, maxArmor));

    onUpdate({
      ...armor,
      rating: clampedRating,
      mass: calculateArmorMass(clampedRating, armorDef, hull.tonnage),
      cost: calculateArmorCost(clampedRating, armorDef, hull.cost),
    });
  };

  const currentArmorDef = armor ? ARMOR_TYPES[armor.type] : null;
  const maxArmorRating = currentArmorDef ? currentArmorDef.getMaxArmor(techLevelNumber) : 0;
  const armorPercentage = armor
    ? ((armor.mass / hull.tonnage) * 100).toFixed(1)
    : 0;

  return (
    <div className="panel armor-panel">
      <h2>Armor Configuration</h2>
      <div className="panel-content">
        <div className="form-group">
          <label htmlFor="armorType">Armor Type:</label>
          <select
            id="armorType"
            value={armor ? armor.type : 'none'}
            onChange={(e) => handleArmorTypeChange(e.target.value)}
          >
            <option value="none">None (0 tons, 0 MCr)</option>
            {availableArmorTypes.map((armorType) => {
              const key = Object.keys(ARMOR_TYPES).find(
                (k) => ARMOR_TYPES[k] === armorType
              );
              return (
                <option key={key} value={key}>
                  {armorType.name} (TL {armorType.minTechLevel}+)
                </option>
              );
            })}
          </select>
        </div>

        {armor && currentArmorDef && (
          <>
            <div className="form-group">
              <label htmlFor="armorRating">Armor Rating:</label>
              <input
                type="number"
                id="armorRating"
                value={armor.rating}
                onChange={(e) => handleArmorRatingChange(parseInt(e.target.value) || 1)}
                min={1}
                max={maxArmorRating}
              />
              <small>Maximum: {maxArmorRating} at TL {techLevelNumber}</small>
            </div>

            <div className="info">
              <div>
                <strong>Protection:</strong> {armor.rating} points
              </div>
              <div>
                <strong>Mass:</strong> {armor.mass.toFixed(2)} tons ({armorPercentage}% of hull)
              </div>
              <div>
                <strong>Cost:</strong> {(armor.cost / 1000000).toFixed(2)} MCr (
                {armor.cost.toLocaleString()} credits)
              </div>
              <div className="armor-stats">
                <small>
                  {currentArmorDef.protectionPer5Percent} protection per 5% of hull tonnage
                </small>
              </div>
            </div>
          </>
        )}

        {!armor && (
          <div className="info">
            <p>This craft has no armor plating.</p>
          </div>
        )}
      </div>
    </div>
  );
};
