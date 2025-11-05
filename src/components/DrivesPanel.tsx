import React, { useState } from 'react';
import { Drive, Fuel } from '../types/ship';
import {
  DRIVE_MODELS,
  DriveModel,
  DriveType,
  getDriveSpec,
  getDriveTypeName,
  mcrToCredits,
} from '../data/constants';

interface DrivesPanelProps {
  drives: Drive[];
  fuel: Fuel;
  onUpdateDrives: (drives: Drive[]) => void;
  onUpdateFuel: (fuel: Fuel) => void;
}

export const DrivesPanel: React.FC<DrivesPanelProps> = ({
  drives,
  fuel,
  onUpdateDrives,
  onUpdateFuel,
}) => {
  const [selectedDriveType, setSelectedDriveType] = useState<DriveType>('gravitic_m');
  const [selectedModel, setSelectedModel] = useState<DriveModel>('sA');
  const [driveCategory, setDriveCategory] = useState<'maneuver' | 'powerPlant'>('maneuver');

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

  const handleFuelChange = (field: keyof Fuel, value: number) => {
    onUpdateFuel({ ...fuel, [field]: value });
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
            {DRIVE_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="drive-specs">
          <p>
            <strong>Tonnage:</strong> {getDriveSpec(selectedDriveType, selectedModel).tonnage} tons
          </p>
          <p>
            <strong>Cost:</strong> {getDriveSpec(selectedDriveType, selectedModel).cost} MCr
          </p>
        </div>

        <button onClick={handleAddDrive}>Add Drive</button>

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
                      {DRIVE_MODELS.map((model) => (
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
                </div>
                <button onClick={() => handleRemoveDrive(drive.id)}>Remove</button>
              </div>
            ))
          )}
        </div>

        <h3>Fuel</h3>
        <div className="form-group">
          <label htmlFor="fuelAmount">Fuel Amount (tons):</label>
          <input
            type="number"
            id="fuelAmount"
            value={fuel.amount}
            onChange={(e) => handleFuelChange('amount', parseFloat(e.target.value))}
            min={0}
            step={0.5}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fuelDuration">Duration (hours):</label>
          <input
            type="number"
            id="fuelDuration"
            value={fuel.duration}
            onChange={(e) => handleFuelChange('duration', parseInt(e.target.value))}
            min={0}
          />
        </div>
      </div>
    </div>
  );
};
