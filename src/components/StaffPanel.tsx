import React from 'react';
import { Staff } from '../types/ship';

interface StaffPanelProps {
  staff: Staff;
  onUpdate: (staff: Staff) => void;
}

export const StaffPanel: React.FC<StaffPanelProps> = ({ staff, onUpdate }) => {
  const handleChange = (field: keyof Staff, value: number) => {
    onUpdate({ ...staff, [field]: value });
  };

  const totalCrew = staff.pilot + staff.navigator + staff.engineer + staff.gunner + staff.other;

  return (
    <div className="panel staff-panel">
      <h2>Staff Configuration</h2>
      <div className="panel-content">
        <p className="info">Define crew requirements for your small craft.</p>

        <div className="form-group">
          <label htmlFor="pilot">Pilots:</label>
          <input
            type="number"
            id="pilot"
            value={staff.pilot}
            onChange={(e) => handleChange('pilot', parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>

        <div className="form-group">
          <label htmlFor="navigator">Navigators:</label>
          <input
            type="number"
            id="navigator"
            value={staff.navigator}
            onChange={(e) => handleChange('navigator', parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>

        <div className="form-group">
          <label htmlFor="engineer">Engineers:</label>
          <input
            type="number"
            id="engineer"
            value={staff.engineer}
            onChange={(e) => handleChange('engineer', parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gunner">Gunners:</label>
          <input
            type="number"
            id="gunner"
            value={staff.gunner}
            onChange={(e) => handleChange('gunner', parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>

        <div className="form-group">
          <label htmlFor="other">Other:</label>
          <input
            type="number"
            id="other"
            value={staff.other}
            onChange={(e) => handleChange('other', parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>

        <div className="staff-summary">
          <strong>Total Crew: {totalCrew}</strong>
        </div>
      </div>
    </div>
  );
};
