import React from 'react';
import { SmallCraftDesign } from '../types/ship';

interface SelectSmallCraftPanelProps {
  onSelectCraft: (craft: SmallCraftDesign | null) => void;
  onCreateNew: () => void;
}

export const SelectSmallCraftPanel: React.FC<SelectSmallCraftPanelProps> = ({
  onSelectCraft: _onSelectCraft,
  onCreateNew,
}) => {
  return (
    <div className="panel select-craft-panel">
      <h2>Select Small Craft</h2>
      <div className="panel-content">
        <p>Load an existing small craft design or create a new one.</p>
        <button onClick={onCreateNew} className="btn-primary">
          Create New Small Craft
        </button>
        <div className="craft-list">
          {/* TODO: Load and display saved craft from IndexedDB */}
          <p>No saved craft found.</p>
        </div>
      </div>
    </div>
  );
};
