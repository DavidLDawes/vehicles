import React, { useState } from 'react';
import { SmallCraftDesign, PanelType, Hull, Drive, Fuel, Fitting, Weapon, Armor, Staff } from './types/ship';
import { SelectSmallCraftPanel } from './components/SelectSmallCraftPanel';
import { HullPanel } from './components/HullPanel';
import { ArmorPanel } from './components/ArmorPanel';
import { DrivesPanel } from './components/DrivesPanel';
import { FittingsPanel } from './components/FittingsPanel';
import { WeaponsPanel } from './components/WeaponsPanel';
import { StaffPanel } from './components/StaffPanel';
import { SummaryPanel } from './components/SummaryPanel';
import './App.css';

const App: React.FC = () => {
  // Current panel state
  const [currentPanel, setCurrentPanel] = useState<PanelType>('select');

  // Small craft design state
  const [smallCraftDesign, setSmallCraftDesign] = useState<SmallCraftDesign | null>(null);

  // Initialize empty design
  const createNewDesign = (): SmallCraftDesign => ({
    name: 'Unnamed Small Craft',
    hull: {
      name: '',
      techLevel: '',
      tonnageCode: '',
      tonnage: 0,
      cost: 0,
      description: '',
    },
    drives: [],
    fuel: {
      amount: 0,
      duration: 0,
      mass: 0,
    },
    fittings: [],
    weapons: [],
    cargo: {
      amount: 0,
    },
    staff: {
      pilot: 1,
      navigator: 0,
      engineer: 0,
      gunner: 0,
      other: 0,
    },
  });

  // Calculate total mass
  const calculateMass = (): number => {
    if (!smallCraftDesign) return 0;

    let totalMass = 0;

    // Drives mass
    totalMass += smallCraftDesign.drives.reduce((sum, drive) => sum + drive.mass * drive.quantity, 0);

    // Fuel mass
    totalMass += smallCraftDesign.fuel.amount;

    // Fittings mass
    totalMass += smallCraftDesign.fittings.reduce(
      (sum, fitting) => sum + fitting.mass * fitting.quantity,
      0
    );

    // Weapons mass
    totalMass += smallCraftDesign.weapons.reduce(
      (sum, weapon) => sum + weapon.mass * weapon.quantity,
      0
    );

    // Cargo mass
    totalMass += smallCraftDesign.cargo.amount;

    // Armor mass (directly from armor.mass)
    if (smallCraftDesign.armor) {
      totalMass += smallCraftDesign.armor.mass;
    }

    return totalMass;
  };

  // Calculate cost breakdown by category
  const calculateCostBreakdown = () => {
    if (!smallCraftDesign) {
      return {
        hull: 0,
        drives: 0,
        fittings: 0,
        weapons: 0,
        armor: 0,
        total: 0,
      };
    }

    const hullCost = smallCraftDesign.hull.cost;
    const drivesCost = smallCraftDesign.drives.reduce(
      (sum, drive) => sum + drive.cost * drive.quantity,
      0
    );
    const fittingsCost = smallCraftDesign.fittings.reduce(
      (sum, fitting) => sum + fitting.cost * fitting.quantity,
      0
    );
    const weaponsCost = smallCraftDesign.weapons.reduce(
      (sum, weapon) => sum + weapon.cost * weapon.quantity,
      0
    );
    const armorCost = smallCraftDesign.armor ? smallCraftDesign.armor.cost : 0;

    return {
      hull: hullCost,
      drives: drivesCost,
      fittings: fittingsCost,
      weapons: weaponsCost,
      armor: armorCost,
      total: hullCost + drivesCost + fittingsCost + weaponsCost + armorCost,
    };
  };

  // Calculate total cost
  const calculateCost = (): number => {
    return calculateCostBreakdown().total;
  };

  // Panel validation
  const isCurrentPanelValid = (): boolean => {
    if (!smallCraftDesign) return false;

    switch (currentPanel) {
      case 'select':
        return true;
      case 'hull':
        return (
          smallCraftDesign.hull.name.length > 0 &&
          smallCraftDesign.hull.techLevel.length > 0 &&
          smallCraftDesign.hull.tonnage > 0
        );
      case 'armor':
        return true; // Armor is optional
      case 'drives':
        return smallCraftDesign.drives.length > 0; // At least one drive required
      case 'fittings':
        return smallCraftDesign.fittings.length > 0; // At least one fitting required
      case 'weapons':
        return true; // Weapons are optional
      case 'staff':
        return smallCraftDesign.staff.pilot > 0; // At least one pilot required
      case 'summary':
        return true;
      default:
        return false;
    }
  };

  // Check if design is overweight
  const isOverweight = (): boolean => {
    if (!smallCraftDesign) return false;
    return calculateMass() > smallCraftDesign.hull.tonnage;
  };

  // Can advance to next panel
  const canAdvance = (): boolean => {
    return isCurrentPanelValid() && !isOverweight();
  };

  // Panel navigation
  const panelOrder: PanelType[] = [
    'select',
    'hull',
    'armor',
    'drives',
    'fittings',
    'weapons',
    'staff',
    'summary',
  ];

  const handleNext = () => {
    if (!canAdvance()) return;

    const currentIndex = panelOrder.indexOf(currentPanel);
    if (currentIndex < panelOrder.length - 1) {
      setCurrentPanel(panelOrder[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = panelOrder.indexOf(currentPanel);
    if (currentIndex > 0) {
      setCurrentPanel(panelOrder[currentIndex - 1]);
    }
  };

  const handleBackToSelect = () => {
    setCurrentPanel('select');
    setSmallCraftDesign(null);
  };

  // Design update handlers
  const handleUpdateHull = (hull: Hull) => {
    if (smallCraftDesign) {
      setSmallCraftDesign({ ...smallCraftDesign, hull });
    }
  };

  const handleUpdateArmor = (armor?: Armor) => {
    if (smallCraftDesign) {
      setSmallCraftDesign({ ...smallCraftDesign, armor });
    }
  };

  const handleUpdateDrives = (drives: Drive[]) => {
    if (smallCraftDesign) {
      setSmallCraftDesign({ ...smallCraftDesign, drives });
    }
  };

  const handleUpdateFuel = (fuel: Fuel) => {
    if (smallCraftDesign) {
      setSmallCraftDesign({ ...smallCraftDesign, fuel });
    }
  };

  const handleUpdateFittings = (fittings: Fitting[]) => {
    if (smallCraftDesign) {
      setSmallCraftDesign({ ...smallCraftDesign, fittings });
    }
  };

  const handleUpdateWeapons = (weapons: Weapon[]) => {
    if (smallCraftDesign) {
      setSmallCraftDesign({ ...smallCraftDesign, weapons });
    }
  };

  const handleUpdateStaff = (staff: Staff) => {
    if (smallCraftDesign) {
      setSmallCraftDesign({ ...smallCraftDesign, staff });
    }
  };

  // File operations
  const handleSave = () => {
    if (smallCraftDesign) {
      console.log('Saving design:', smallCraftDesign);
      // TODO: Save to IndexedDB
      alert('Design saved! (Database integration pending)');
    }
  };

  const handlePrint = () => {
    if (smallCraftDesign) {
      console.log('Printing design:', smallCraftDesign);
      // TODO: Generate printable HTML
      window.print();
    }
  };

  const handleSelectCraft = (craft: SmallCraftDesign | null) => {
    if (craft) {
      setSmallCraftDesign(craft);
      setCurrentPanel('hull');
    }
  };

  const handleCreateNew = () => {
    setSmallCraftDesign(createNewDesign());
    setCurrentPanel('hull');
  };

  // Render current panel
  const renderCurrentPanel = () => {
    if (!smallCraftDesign && currentPanel !== 'select') {
      return <div>Loading...</div>;
    }

    switch (currentPanel) {
      case 'select':
        return (
          <SelectSmallCraftPanel onSelectCraft={handleSelectCraft} onCreateNew={handleCreateNew} />
        );
      case 'hull':
        return <HullPanel hull={smallCraftDesign!.hull} onUpdate={handleUpdateHull} />;
      case 'armor':
        return (
          <ArmorPanel
            armor={smallCraftDesign!.armor}
            hull={smallCraftDesign!.hull}
            onUpdate={handleUpdateArmor}
          />
        );
      case 'drives':
        return (
          <DrivesPanel
            drives={smallCraftDesign!.drives}
            fuel={smallCraftDesign!.fuel}
            hullTonnage={smallCraftDesign!.hull.tonnage}
            onUpdateDrives={handleUpdateDrives}
            onUpdateFuel={handleUpdateFuel}
          />
        );
      case 'fittings':
        return (
          <FittingsPanel
            fittings={smallCraftDesign!.fittings}
            hullTonnage={smallCraftDesign!.hull.tonnage}
            onUpdate={handleUpdateFittings}
          />
        );
      case 'weapons':
        return <WeaponsPanel weapons={smallCraftDesign!.weapons} onUpdate={handleUpdateWeapons} />;
      case 'staff':
        return <StaffPanel staff={smallCraftDesign!.staff} onUpdate={handleUpdateStaff} />;
      case 'summary':
        return (
          <SummaryPanel
            design={smallCraftDesign!}
            totalMass={calculateMass()}
            totalCost={calculateCost()}
            onSave={handleSave}
            onPrint={handlePrint}
          />
        );
      default:
        return <div>Unknown panel</div>;
    }
  };

  // Render sidebar with mass and cost tracking (visible after hull panel)
  const renderSidebar = () => {
    if (!smallCraftDesign || currentPanel === 'select' || currentPanel === 'hull') {
      return null;
    }

    const totalMass = calculateMass();
    const maxTonnage = smallCraftDesign.hull.tonnage;
    const remainingMass = maxTonnage - totalMass;
    const massPercentage = (totalMass / maxTonnage) * 100;

    const costBreakdown = calculateCostBreakdown();

    return (
      <div className="sidebar">
        {/* Mass Tracking */}
        <div className="sidebar-section">
          <h3>Mass Tracking</h3>
          <div className="stats">
            <div className="stat-item">
              <span>Total:</span>
              <strong>{maxTonnage} tons</strong>
            </div>
            <div className="stat-item">
              <span>Used:</span>
              <strong>{totalMass.toFixed(2)} tons</strong>
            </div>
            <div className="stat-item">
              <span>Remaining:</span>
              <strong className={remainingMass < 0 ? 'overweight' : ''}>
                {remainingMass.toFixed(2)} tons
              </strong>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${massPercentage > 100 ? 'overweight' : ''}`}
                style={{ width: `${Math.min(massPercentage, 100)}%` }}
              />
            </div>
            {isOverweight() && (
              <div className="warning">Warning: Design exceeds maximum tonnage!</div>
            )}
          </div>
        </div>

        {/* Cost Tracking */}
        <div className="sidebar-section">
          <h3>Cost Tracking</h3>
          <div className="stats">
            {costBreakdown.hull > 0 && (
              <div className="stat-item cost-breakdown">
                <span>Hull:</span>
                <strong>{(costBreakdown.hull / 1000000).toFixed(2)} MCr</strong>
              </div>
            )}
            {costBreakdown.armor > 0 && (
              <div className="stat-item cost-breakdown">
                <span>Armor:</span>
                <strong>{(costBreakdown.armor / 1000000).toFixed(2)} MCr</strong>
              </div>
            )}
            {costBreakdown.drives > 0 && (
              <div className="stat-item cost-breakdown">
                <span>Drives:</span>
                <strong>{(costBreakdown.drives / 1000000).toFixed(2)} MCr</strong>
              </div>
            )}
            {costBreakdown.fittings > 0 && (
              <div className="stat-item cost-breakdown">
                <span>Fittings:</span>
                <strong>{(costBreakdown.fittings / 1000000).toFixed(2)} MCr</strong>
              </div>
            )}
            {costBreakdown.weapons > 0 && (
              <div className="stat-item cost-breakdown">
                <span>Weapons:</span>
                <strong>{(costBreakdown.weapons / 1000000).toFixed(2)} MCr</strong>
              </div>
            )}
            <div className="stat-item cost-total">
              <span>Total Cost:</span>
              <strong>{(costBreakdown.total / 1000000).toFixed(2)} MCr</strong>
            </div>
            <div className="stat-item-small">
              <span>{costBreakdown.total.toLocaleString()} credits</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Traveller Small Craft Designer</h1>
        {smallCraftDesign && currentPanel !== 'select' && (
          <div className="header-info">
            <span>{smallCraftDesign.name}</span>
            <button onClick={handleBackToSelect} className="btn-link">
              Back to Selection
            </button>
          </div>
        )}
      </header>

      <div className="app-content">
        <main className="main-panel">{renderCurrentPanel()}</main>
        {renderSidebar()}
      </div>

      {currentPanel !== 'select' && (
        <footer className="app-footer">
          <div className="navigation-buttons">
            {currentPanel !== 'hull' && (
              <button onClick={handlePrevious} className="btn-secondary">
                Previous
              </button>
            )}
            {currentPanel !== 'summary' && (
              <button onClick={handleNext} className="btn-primary" disabled={!canAdvance()}>
                Next
              </button>
            )}
          </div>
          <div className="validation-message">
            {!isCurrentPanelValid() && <span className="error">Please complete required fields</span>}
            {isOverweight() && <span className="error">Design is overweight</span>}
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
