import React, { useState, useEffect } from 'react';
import { Drive, Fuel } from '../types/ship';
import {
  DriveModel,
  DriveType,
  getDriveSpec,
  getDriveTypeName,
  mcrToCredits,
  getAvailableDriveModels,
  getAvailableDriveModelsForType,
  getDrivePerformance,
  formatPerformanceRating,
  calculatePowerPlantFuel,
  calculateManeuverDriveFuel,
  calculateTotalFuelRequirement,
} from '../data/constants';

interface DrivesPanelProps {
  drives: Drive[];
  fuel: Fuel;
  hullTonnage: number;
  onUpdateDrives: (drives: Drive[]) => void;
  onUpdateFuel: (fuel: Fuel) => void;
}

export const DrivesPanel: React.FC<DrivesPanelProps> = ({
  drives,
  fuel,
  hullTonnage,
  onUpdateDrives,
  onUpdateFuel,
}) => {
  const [selectedDriveType, setSelectedDriveType] = useState<DriveType>('gravitic_m');
  const [selectedModel, setSelectedModel] = useState<DriveModel>('sA');
  const [driveCategory, setDriveCategory] = useState<'maneuver' | 'powerPlant'>('maneuver');

  // Operation duration for fuel calculations
  const [powerPlantWeeks, setPowerPlantWeeks] = useState<number>(2);
  const [maneuverHours, setManeuverHours] = useState<number>(2);

  // Check if we have gravitic or reaction maneuver drives installed
  const hasGraviticDrive = drives.some((d) => d.type === 'maneuver' && d.driveType === 'gravitic_m');
  const hasReactionDrive = drives.some((d) => d.type === 'maneuver' && d.driveType === 'reaction_m');

  // Get available drive models based on hull tonnage and drive type
  const availableDriveModels =
    driveCategory === 'maneuver'
      ? getAvailableDriveModelsForType(hullTonnage, selectedDriveType)
      : getAvailableDriveModels(hullTonnage);

  // Update selected model if it becomes unavailable
  useEffect(() => {
    if (!availableDriveModels.includes(selectedModel)) {
      if (availableDriveModels.length > 0) {
        setSelectedModel(availableDriveModels[0]);
      }
    }
  }, [hullTonnage, selectedModel, selectedDriveType, driveCategory, availableDriveModels]);

  // Calculate recommended fuel based on installed drives
  const calculateRecommendedFuel = () => {
    const drivesWithPerformance = drives.map((drive) => ({
      ...drive,
      performance: getDrivePerformance(drive.model as DriveModel, hullTonnage) || 0,
    }));

    // For gravitic drives, always use 2 weeks (hardwired)
    // For reaction drives, use user-specified hours
    const maneuverDuration = hasGraviticDrive && !hasReactionDrive ? 2 : maneuverHours;

    return calculateTotalFuelRequirement(
      drivesWithPerformance,
      hullTonnage,
      powerPlantWeeks,
      hasReactionDrive ? maneuverDuration : 0 // Gravitic uses no fuel, so pass 0 for hours
    );
  };

  const recommendedFuel = calculateRecommendedFuel();

  const handleAddDrive = () => {
    const spec = getDriveSpec(selectedDriveType, selectedModel);
    const newDrive: Drive = {
      id: `drive-${Date.now()}`,
      type: driveCategory,
      driveType: selectedDriveType,
      model: selectedModel,
      rating: 1,
      mass: spec.tonnage,
      cost: mcrToCredits(spec.cost),
      quantity: 1,
    };
    onUpdateDrives([...drives, newDrive]);
  };

  const handleRemoveDrive = (id: string) => {
    onUpdateDrives(drives.filter((d) => d.id !== id));
  };

  const handleUpdateDrive = (id: string, updates: Partial<Drive>) => {
    onUpdateDrives(
      drives.map((drive) => {
        if (drive.id === id) {
          const updatedDrive = { ...drive, ...updates };
          // If model or driveType changed, update mass and cost
          if (updates.model || updates.driveType) {
            const driveType = (updates.driveType || drive.driveType) as DriveType;
            const model = (updates.model || drive.model) as DriveModel;
            const spec = getDriveSpec(driveType, model);
            updatedDrive.mass = spec.tonnage;
            updatedDrive.cost = mcrToCredits(spec.cost);
          }
          return updatedDrive;
        }
        return drive;
      })
    );
  };

  // Calculate fuel per hour for reaction drives
  const getReactionFuelPerHour = (): number => {
    if (!hasReactionDrive) return 0;

    const reactionDrives = drives.filter(
      (d) => d.type === 'maneuver' && d.driveType === 'reaction_m'
    );

    let totalFuelPerHour = 0;
    reactionDrives.forEach((drive) => {
      const performance = getDrivePerformance(drive.model as DriveModel, hullTonnage) || 0;
      totalFuelPerHour += calculateManeuverDriveFuel('reaction_m', performance, hullTonnage, 1);
    });

    return totalFuelPerHour;
  };

  const handleFuelChange = (field: keyof Fuel, value: number) => {
    onUpdateFuel({ ...fuel, [field]: value });
  };

  // Set recommended fuel amount and corresponding duration
  const handleSetRecommendedFuel = () => {
    const fuelAmount = parseFloat(recommendedFuel.total.toFixed(2));

    // Calculate duration based on drive type
    let duration: number;

    if (hasReactionDrive) {
      // For reaction drives, use the hours that were calculated
      duration = maneuverHours;
    } else if (hasGraviticDrive) {
      // For gravitic drives, duration matches power plant operation (weeks converted to hours)
      // Gravitic drives work as long as they have power
      duration = powerPlantWeeks * 7 * 24; // weeks * 7 days * 24 hours
    } else {
      // No maneuver drives, just use current duration
      duration = fuel.duration;
    }

    onUpdateFuel({
      amount: fuelAmount,
      duration: duration,
      mass: fuelAmount,
    });
  };

  // Get available drive types based on category
  const getAvailableDriveTypes = (category: 'maneuver' | 'powerPlant'): DriveType[] => {
    if (category === 'maneuver') {
      return ['gravitic_m', 'reaction_m'];
    }
    return ['fusion_p', 'chemical_p'];
  };

  return (
    <div className="panel drives-panel">
      <h2>Drives & Fuel Configuration</h2>
      <div className="panel-content">
        <h3>Add Drive</h3>
        <div className="form-group">
          <label htmlFor="driveCategory">Drive Category:</label>
          <select
            id="driveCategory"
            value={driveCategory}
            onChange={(e) => {
              const category = e.target.value as 'maneuver' | 'powerPlant';
              setDriveCategory(category);
              // Reset drive type to first available for the new category
              const availableTypes = getAvailableDriveTypes(category);
              setSelectedDriveType(availableTypes[0]);
            }}
          >
            <option value="maneuver">Maneuver Drive</option>
            <option value="powerPlant">Power Plant</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="driveType">Drive Type:</label>
          <select
            id="driveType"
            value={selectedDriveType}
            onChange={(e) => setSelectedDriveType(e.target.value as DriveType)}
          >
            {getAvailableDriveTypes(driveCategory).map((type) => (
              <option key={type} value={type}>
                {getDriveTypeName(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="driveModel">Drive Code:</label>
          <select
            id="driveModel"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as DriveModel)}
          >
            {availableDriveModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          {availableDriveModels.length === 0 && (
            <p className="warning">No drives available for this hull tonnage</p>
          )}
        </div>

        {availableDriveModels.length > 0 && (
          <div className="drive-specs">
            <p>
              <strong>Tonnage:</strong> {getDriveSpec(selectedDriveType, selectedModel).tonnage}{' '}
              tons
            </p>
            <p>
              <strong>Cost:</strong> {getDriveSpec(selectedDriveType, selectedModel).cost} MCr
            </p>
            <p>
              <strong>Performance:</strong>{' '}
              {formatPerformanceRating(
                getDrivePerformance(selectedModel, hullTonnage),
                driveCategory
              )}
            </p>
            {selectedDriveType === 'reaction_m' && (
              <p className="fuel-info">
                <strong>Fuel per hour:</strong>{' '}
                {calculateManeuverDriveFuel(
                  'reaction_m',
                  getDrivePerformance(selectedModel, hullTonnage) || 0,
                  hullTonnage,
                  1
                ).toFixed(2)}{' '}
                tons (
                {(
                  (calculateManeuverDriveFuel(
                    'reaction_m',
                    getDrivePerformance(selectedModel, hullTonnage) || 0,
                    hullTonnage,
                    1
                  ) /
                    hullTonnage) *
                  100
                ).toFixed(1)}
                % of hull)
              </p>
            )}
          </div>
        )}

        {selectedDriveType === 'reaction_m' && availableDriveModels.length === 0 && (
          <p className="warning">
            No reaction drives available - all would consume more than 90% of hull tonnage per
            hour of thrust
          </p>
        )}

        <button onClick={handleAddDrive} disabled={availableDriveModels.length === 0}>
          Add Drive
        </button>

        <h3>Installed Drives</h3>
        <div className="drives-list">
          {drives.length === 0 ? (
            <p>No drives configured. Add a power plant and maneuver drive.</p>
          ) : (
            drives.map((drive) => (
              <div key={drive.id} className="drive-item">
                <div className="drive-details">
                  <h4>
                    {drive.type === 'powerPlant' ? 'Power Plant' : 'Maneuver Drive'}
                  </h4>
                  <div className="form-group">
                    <label>Drive Type:</label>
                    <select
                      value={drive.driveType || ''}
                      onChange={(e) =>
                        handleUpdateDrive(drive.id, { driveType: e.target.value })
                      }
                    >
                      {getAvailableDriveTypes(drive.type as 'maneuver' | 'powerPlant').map(
                        (type) => (
                          <option key={type} value={type}>
                            {getDriveTypeName(type)}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Drive Code:</label>
                    <select
                      value={drive.model}
                      onChange={(e) => handleUpdateDrive(drive.id, { model: e.target.value })}
                    >
                      {(drive.type === 'maneuver' && drive.driveType
                        ? getAvailableDriveModelsForType(hullTonnage, drive.driveType as DriveType)
                        : getAvailableDriveModels(hullTonnage)
                      ).map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p>
                    <strong>Tonnage:</strong> {drive.mass} tons
                  </p>
                  <p>
                    <strong>Cost:</strong> {(drive.cost / 1000000).toFixed(2)} MCr
                  </p>
                  <p>
                    <strong>Performance:</strong>{' '}
                    {formatPerformanceRating(
                      getDrivePerformance(drive.model as DriveModel, hullTonnage),
                      drive.type as 'maneuver' | 'powerPlant'
                    )}
                  </p>
                  {drive.type === 'powerPlant' && drive.driveType && (
                    <p className="fuel-info">
                      <strong>Fuel (2 weeks):</strong>{' '}
                      {calculatePowerPlantFuel(
                        drive.driveType as DriveType,
                        drive.model as DriveModel,
                        2
                      ).toFixed(2)}{' '}
                      tons
                    </p>
                  )}
                  {drive.type === 'maneuver' && drive.driveType === 'reaction_m' && (
                    <p className="fuel-info">
                      <strong>Fuel (per hour):</strong>{' '}
                      {calculateManeuverDriveFuel(
                        'reaction_m',
                        getDrivePerformance(drive.model as DriveModel, hullTonnage) || 0,
                        hullTonnage,
                        1
                      ).toFixed(2)}{' '}
                      tons
                    </p>
                  )}
                  {drive.type === 'maneuver' && drive.driveType === 'gravitic_m' && (
                    <p className="fuel-info info-text">
                      <strong>Fuel:</strong> None required (Gravitic)
                    </p>
                  )}
                </div>
                <button onClick={() => handleRemoveDrive(drive.id)}>Remove</button>
              </div>
            ))
          )}
        </div>

        <h3>Fuel Calculator</h3>
        <p className="info-text">
          Calculate fuel requirements based on your installed drives and operation duration.
        </p>

        <div className="fuel-calculator">
          <div className="form-group">
            <label htmlFor="powerPlantWeeks">Power Plant Operation (weeks):</label>
            <input
              type="number"
              id="powerPlantWeeks"
              value={powerPlantWeeks}
              onChange={(e) => setPowerPlantWeeks(parseFloat(e.target.value) || 0)}
              min={0}
              step={0.5}
            />
          </div>

          {hasReactionDrive && (
            <div className="form-group">
              <label htmlFor="maneuverHours">Maneuver Drive Operation (hours):</label>
              <input
                type="number"
                id="maneuverHours"
                value={maneuverHours}
                onChange={(e) => setManeuverHours(parseFloat(e.target.value) || 0)}
                min={0}
                step={0.5}
              />
            </div>
          )}

          {hasGraviticDrive && !hasReactionDrive && (
            <div className="form-group">
              <label htmlFor="maneuverWeeks">Maneuver Drive Operation (weeks):</label>
              <input
                type="number"
                id="maneuverWeeks"
                value={powerPlantWeeks}
                disabled
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
              />
              <p className="info-text">
                Gravitic drives work as long as they have power (matches Power Plant: {powerPlantWeeks} weeks)
              </p>
            </div>
          )}

          {drives.length > 0 && (
            <div className="fuel-requirements">
              <h4>Calculated Fuel Requirements:</h4>
              {recommendedFuel.breakdown.powerPlant > 0 && (
                <p>
                  <strong>Power Plant:</strong> {recommendedFuel.breakdown.powerPlant.toFixed(2)}{' '}
                  tons ({powerPlantWeeks} weeks)
                </p>
              )}
              {recommendedFuel.breakdown.maneuver > 0 && hasReactionDrive && (
                <p>
                  <strong>Reaction M-Drive:</strong>{' '}
                  {recommendedFuel.breakdown.maneuver.toFixed(2)} tons ({maneuverHours} hours)
                </p>
              )}
              {hasGraviticDrive && (
                <p className="info-text">
                  <strong>Gravitic M-Drives:</strong> No fuel required
                </p>
              )}
              <p className="total-fuel">
                <strong>Total Recommended Fuel:</strong> {recommendedFuel.total.toFixed(2)} tons
              </p>
              {recommendedFuel.total > 0 && (
                <button onClick={handleSetRecommendedFuel} className="btn-secondary">
                  Set Fuel to Recommended Amount
                </button>
              )}
            </div>
          )}
        </div>

        <h3>Fuel Configuration</h3>
        <div className="form-group">
          <label htmlFor="fuelAmount">Fuel Amount (tons):</label>
          <input
            type="number"
            id="fuelAmount"
            value={fuel.amount}
            onChange={(e) => handleFuelChange('amount', parseFloat(e.target.value) || 0)}
            min={0}
            max={hullTonnage}
            step={0.5}
          />
          {fuel.amount > hullTonnage && (
            <p className="warning">
              Warning: Fuel amount ({fuel.amount.toFixed(2)} tons) exceeds hull tonnage ({hullTonnage} tons)
            </p>
          )}
          {fuel.amount < recommendedFuel.total && drives.length > 0 && (
            <p className="warning">
              Warning: Fuel amount is less than recommended ({recommendedFuel.total.toFixed(2)}{' '}
              tons)
            </p>
          )}
          {hasReactionDrive && (
            <p className="info-text">
              Fuel per hour: {getReactionFuelPerHour().toFixed(2)} tons
              {fuel.amount > 0 && getReactionFuelPerHour() > 0 && (
                <span>
                  {' '}
                  (Supports ~{(fuel.amount / getReactionFuelPerHour()).toFixed(1)} hours of
                  thrust)
                </span>
              )}
            </p>
          )}
        </div>

        {hasGraviticDrive && !hasReactionDrive && (
          <div className="form-group">
            <label htmlFor="fuelDurationWeeks">Operation Duration (weeks):</label>
            <input
              type="number"
              id="fuelDurationWeeks"
              value={powerPlantWeeks}
              disabled
              style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
            />
            <p className="info-text">
              Gravitic drives work as long as they have power. Duration matches Power Plant
              operation ({powerPlantWeeks} weeks).
            </p>
          </div>
        )}

        {hasReactionDrive && (
          <div className="form-group">
            <label htmlFor="fuelDurationHours">Operation Duration (hours):</label>
            <input
              type="number"
              id="fuelDurationHours"
              value={fuel.duration}
              onChange={(e) => handleFuelChange('duration', parseFloat(e.target.value) || 0)}
              min={0}
              step={0.5}
            />
            <p className="info-text">
              Adjust thrust duration as needed (fuel consumption:{' '}
              {(fuel.duration * getReactionFuelPerHour()).toFixed(2)} tons)
            </p>
            {fuel.duration * getReactionFuelPerHour() > hullTonnage && (
              <p className="warning">
                Warning: {fuel.duration} hours of thrust would require{' '}
                {(fuel.duration * getReactionFuelPerHour()).toFixed(2)} tons of fuel, exceeding
                hull tonnage
              </p>
            )}
          </div>
        )}

        {!hasReactionDrive && !hasGraviticDrive && (
          <div className="form-group">
            <label htmlFor="fuelDuration">Duration (hours):</label>
            <input
              type="number"
              id="fuelDuration"
              value={fuel.duration}
              onChange={(e) => handleFuelChange('duration', parseInt(e.target.value) || 0)}
              min={0}
            />
            <p className="info-text">Add maneuver drives to see fuel duration settings</p>
          </div>
        )}
      </div>
    </div>
  );
};
