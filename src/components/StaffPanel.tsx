import React, { useEffect } from 'react';
import { Staff, Weapon, Drive, Fitting } from '../types/ship';
import { calculateRequiredGunners } from '../data/constants';

interface StaffPanelProps {
  staff: Staff;
  weapons: Weapon[];
  drives: Drive[];
  fittings: Fitting[];
  onUpdate: (staff: Staff) => void;
}

export const StaffPanel: React.FC<StaffPanelProps> = ({ staff, weapons, drives, fittings, onUpdate }) => {
  const handleChange = (field: keyof Staff, value: number | boolean) => {
    onUpdate({ ...staff, [field]: value });
  };

  // Calculate required gunners from weapons
  const requiredGunners = calculateRequiredGunners(weapons);

  // Auto-update gunners when weapons change
  useEffect(() => {
    if (staff.gunner !== requiredGunners) {
      onUpdate({ ...staff, gunner: requiredGunners });
    }
  }, [requiredGunners]); // Only depend on requiredGunners to avoid infinite loops

  // Check if engineer checkbox should be shown (2+ power plants or 2+ maneuver drives)
  const powerPlantCount = drives.filter((d) => d.type === 'powerPlant').length;
  const maneuverDriveCount = drives.filter((d) => d.type === 'maneuver').length;
  const showEngineerOption = powerPlantCount >= 2 || maneuverDriveCount >= 2;

  // Check if ECM checkbox should be shown (Basic Military or better electronics installed)
  const electronicsWithECM = ['basic_military', 'advanced', 'very_advanced'];
  const hasECMCapableElectronics = fittings.some(
    (f) => f.type === 'electronics' && f.electronicsType && electronicsWithECM.includes(f.electronicsType)
  );

  // Auto-clear engineer if no longer meets requirements
  useEffect(() => {
    if (staff.engineer && !showEngineerOption) {
      onUpdate({ ...staff, engineer: false });
    }
  }, [showEngineerOption]);

  // Auto-clear ECM if electronics no longer support it
  useEffect(() => {
    if (staff.ecm && !hasECMCapableElectronics) {
      onUpdate({ ...staff, ecm: false });
    }
  }, [hasECMCapableElectronics]);

  // Calculate total crew including optional positions
  const optionalCrew = (staff.engineer ? 1 : 0) + (staff.comms ? 1 : 0) + (staff.sensors ? 1 : 0) + (staff.ecm ? 1 : 0);
  const totalCrew = staff.pilot + staff.gunner + optionalCrew + staff.other;

  // Calculate gunner breakdown for display
  const getGunnerBreakdown = (): string[] => {
    const breakdown: string[] = [];
    const shipWeapons = weapons.filter((w) => w.category === 'ship');

    // Count barbettes
    const barbetteCount = shipWeapons.filter((w) => w.type === 'particle_beam_barbette').length;
    if (barbetteCount > 0) {
      breakdown.push(`${barbetteCount} Particle Beam Barbette${barbetteCount > 1 ? 's' : ''}`);
    }

    // Check for torpedoes
    const torpedoCount = shipWeapons.filter((w) => w.type === 'torpedo').length;
    if (torpedoCount > 0) {
      breakdown.push(`Torpedo${torpedoCount > 1 ? 's' : ''} (${torpedoCount} launcher${torpedoCount > 1 ? 's' : ''})`);
    }

    // Check for missile launchers
    const missileLauncherCount = shipWeapons.filter((w) => w.type.startsWith('missile_launcher_')).length;
    if (missileLauncherCount > 0) {
      breakdown.push(`Missile Launcher Turrets (${missileLauncherCount} turret${missileLauncherCount > 1 ? 's' : ''})`);
    }

    // Check for pulse laser turrets
    const hasPulseLaser = shipWeapons.some((w) => w.type.startsWith('pulse_laser_'));
    if (hasPulseLaser) {
      const count = shipWeapons.filter((w) => w.type.startsWith('pulse_laser_')).length;
      breakdown.push(`Pulse Laser Turrets (${count} turret${count > 1 ? 's' : ''})`);
    }

    // Check for beam laser turrets
    const hasBeamLaser = shipWeapons.some((w) => w.type.startsWith('beam_laser_'));
    if (hasBeamLaser) {
      const count = shipWeapons.filter((w) => w.type.startsWith('beam_laser_')).length;
      breakdown.push(`Beam Laser Turrets (${count} turret${count > 1 ? 's' : ''})`);
    }

    return breakdown;
  };

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
            min={1}
          />
          <p className="info-text">Minimum 1 pilot required</p>
        </div>

        <div className="form-group">
          <label htmlFor="gunner">Gunners (auto-calculated):</label>
          <input
            type="number"
            id="gunner"
            value={requiredGunners}
            disabled
            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
          />
          {requiredGunners > 0 && (
            <div className="gunner-breakdown">
              <p className="info-text">
                <strong>Required for:</strong>
              </p>
              <ul>
                {getGunnerBreakdown().map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {requiredGunners === 0 && (
            <p className="info-text">No weapons installed - no gunners required</p>
          )}
        </div>

        <h3>Optional Crew Positions</h3>
        <p className="info">Select additional specialized crew positions (each adds 1 crew member).</p>

        {showEngineerOption && (
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                id="engineer"
                checked={staff.engineer || false}
                onChange={(e) => handleChange('engineer', e.target.checked)}
              />
              <span>Engineer (useful with multiple power plants or maneuver drives)</span>
            </label>
          </div>
        )}

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              id="comms"
              checked={staff.comms || false}
              onChange={(e) => handleChange('comms', e.target.checked)}
            />
            <span>Communications Specialist</span>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              id="sensors"
              checked={staff.sensors || false}
              onChange={(e) => handleChange('sensors', e.target.checked)}
            />
            <span>Sensor Operator</span>
          </label>
        </div>

        {hasECMCapableElectronics && (
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                id="ecm"
                checked={staff.ecm || false}
                onChange={(e) => handleChange('ecm', e.target.checked)}
              />
              <span>ECM (Electronic Countermeasures) Specialist</span>
            </label>
            <p className="info-text">Requires Basic Military or better electronics with jammers</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="other">Other Crew:</label>
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
          <div className="crew-breakdown">
            <p>Pilots: {staff.pilot}</p>
            {staff.gunner > 0 && <p>Gunners: {staff.gunner}</p>}
            {staff.engineer && <p>Engineer: 1</p>}
            {staff.comms && <p>Comms: 1</p>}
            {staff.sensors && <p>Sensors: 1</p>}
            {staff.ecm && <p>ECM: 1</p>}
            {staff.other > 0 && <p>Other: {staff.other}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
