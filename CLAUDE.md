# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Traveller SRD (Science Fiction Role-Playing Game System Reference Document) Small Craft Designer that is used to design custom small craft, less than 100 tons displacement, for the Traveller Role Playing Game (RPG).


This is a **Traveller Small Craft Designer** - a React-based web application for designing vehicles (sub 100 ton surface, air and space vehicles, potentially, focus on space for now) based on the Traveller SRD (System Reference Document) vehicle design rules, see https://www.traveller-srd.com/high-guard/small-craft-design/

The application uses IndexedDB for local persistence and features a multi-panel wizard interface for configuring all aspects of a small craft.

## Common Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Linting
npm run lint

# Testing
npm test                # Run tests in watch mode
npm run test:ui         # Run tests with UI
npm run test:run        # Run tests once (used in CI)

# Database management
npm run extractDB       # Export ships from IndexedDB to JSON files
npm run preloadDB       # Import ships from JSON files to IndexedDB
npm run flushDB         # Clear all ships from IndexedDB
npm run setInitialDB    # Reset DB to initial state
npm run apply-feature   # Apply feature branches to ships
```

## Build System & Technology Stack

- **Build Tool**: Webpack 5 with webpack-dev-server
- **Frontend**: React 19 with TypeScript
- **Testing**: Jest with Testing Library
- **Database**: IndexedDB (via fake-indexeddb for tests) - browser-based local storage
- **Bundler Config**: `webpack.config.cjs` - entry point is `src/main.tsx`
- **Dev Server**: Runs on port 8080 (configured in webpack.config.cjs)
- **Node Version**: 22.x (specified in package.json engines)

## Architecture Overview

### Core Application Structure

**Main Entry Point**: `src/App.js` (compiled from App.tsx)
- Central state management for entire small craft design
- Orchestrates specialized panels in a wizard flow
- Handles mass/cost calculations and validation
- Manages file operations (save/load/print)

**Panel Flow**: Hull → Armor → Drives → Fittings → Weapons → Staff → Small Craft Design

### Key Design Patterns

1. **Wizard UI Pattern**: User progresses through panels sequentially. Each panel validates before allowing advancement.

2. **Centralized State**: `App.js` maintains the complete `smallcraftDesign` object containing all ship components (hull, armor, drives, fittings, weapons,  cargo).

3. **Mass & Cost Tracking**: Real-time calculations in `App.js` methods:
   - `calculateMass()`: Sums masses from all components + fuel + armor + reloads
   - `calculateCost()`: Sums costs from all components
   - Validation prevents over-mass designs

4. **Database Service Pattern**: `src/services/database.ts` provides IndexedDB abstraction
   - Small craft are stored with unique names (enforced by unique index)
   - Auto-initialization loads `public/initial-ships.json` on first run
   - Handles version migrations (no version yet)

### Critical Data Files

**`src/data/constants.ts`**: Central source of truth for game rules
- Tech levels (A-H mapping to TL 10-17+)
- Tonnage codes for small craft (S1-S10 for 10-100 tons)
- Drive performance tables (power plant, maneuver)
- Weapon types
- Fuel calculation formula

**`src/types/ship.ts`**: TypeScript interfaces for all ship components
- `ShipDesign`: Root interface containing all component arrays
- Component interfaces: `Drive`, `Fitting`, `Weapon`, `Cargo`

### Component Architecture

Components follow a consistent pattern:
- **Props**: Receive current state + `onUpdate` callback
- **State**: Local UI state only (selections, toggles)
- **Updates**: Call `onUpdate` with new array/object to update parent
- **Validation**: Display warnings but allow invalid states (validation enforced at panel navigation level)

Example: `WeaponsPanel` manages weapon selection UI but calls `onUpdate(weapons)` to update App state.

### Database Persistence

**IndexedDB Schema** (no version yet):
- **Object Store**: `smallcraft`
- **Key Path**: `id` (auto-increment)
- **Indexes**:
  - `name` (unique) on `smallcraft.name` - enforces unique small craft names
  - `createdAt` on `createdAt` - for sorting
- **Migration Logic**: none yet

**Initial Data**: On first load, if DB is empty, loads ships from `public/initial-smallcraft.json` via `initialDataService.ts`

## Important Implementation Details

### Mass Calculation Complexity

The `calculateMass()` function in App.js handles:
- Component masses (some are per-item, some are pre-multiplied by quantity)
- Fuel mass calculation using `calculateTotalFuelMass()` 
- Armor mass (percentage of hull tonnage)

### Tech Level Dependencies

Many features are tech-level gated

Use helper functions: `isTechLevelAtLeast()`, `getTechLevelIndex()`

### Print Functionality

`handleFilePrint()` generates printable HTML view with small craft stats. Uses `generatePrintContent()` to create standalone HTML document with embedded styles. Simplified compared to SummaryPanel's detailed view.

## Testing Approach

- **Test Runner**: Jest with jsdom environment
- **Test Location**: Co-located with source files (`.test.ts` extension)
- **Setup Files**:
  - `jest.setup.js`: Global mocks
  - `src/test/setup.ts`: Testing Library setup
  - `jest-environment-jsdom-with-structuredclone.js`: Custom environment for structuredClone support
- **Coverage**: Focus on utility functions (`sparesCalculation`, `constants`) and services (`database`, `initialDataService`)
- **Mocking**: `fake-indexeddb` for IndexedDB tests

## File Operations

The app supports standard file operations via FileMenu component:
- **Save (Ctrl+S)**: Updates existing ship in DB
- **Save As (Ctrl+Shift+S)**: Prompts for new name and creates copy
- **Print (Ctrl+P)**: Opens print dialog with ship summary
- **Back to Ship Select**: Returns to ship selection panel

Small craft names must be unique (enforced by DB unique index). Attempting to save duplicate names will throw an error.

## Debugging Tips

1. **Database Issues**: Check browser DevTools → Application → IndexedDB → StarshipDesignerDB
2. **Mass Calculation Problems**: Add console.log in `calculateMass()` to trace component contributions
3. **Panel Validation**: Check `isCurrentPanelValid()` and `canAdvance()` in App.js
4. **Initial Data Loading**: Check `SelectSmallCraftPanel.tsx` and `initialDataService.ts` for DB initialization logic

## Common Modifications

**Adding a new component type**:
1. Add interface to `src/types/ship.ts`
2. Add array to `ShipDesign` interface
3. Add panel component in `src/components/`
4. Add case to `renderCurrentPanel()` in App.js
5. Update `calculateMass()` and `calculateCost()`
6. Add to initial small craft design state in App.js

**Adding a new rule**:
1. Add rule definition to RulesMenu component
2. Add rule ID to `activeRules` checks where needed
3. Update calculation functions to use `activeRules.has('rule_id')`

**Modifying validation**:
- Panel-specific validation in `isCurrentPanelValid()` switch statement
- Mass overweight check in `canAdvance()`

## Known Issues & Quirks

- App.js is compiled JavaScript (not TypeScript source) - prefer editing App.tsx if available, or be aware of JSX syntax when editing
- Small craft names in DB are stored as `smallcraft.name` (nested property) for indexing
- Port 8080 is hardcoded in webpack config
- `public/initial-smallcraft.json` is loaded once on first DB initialization - subsequent changes require DB flush
