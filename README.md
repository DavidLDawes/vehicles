


# Traveller Small Craft Designer
Based on Traveller role playing game and [the Traveller Small Craft SRD](https://www.traveller-srd.com/high-guard/small-craft-design/)

Built with Claude. Using a Wizard UI and IndexedDB for local storage. Copied most of the [AID approach](https://github.com/DavidLDawes/aid), in particular copied and edited the CLAUDE.md.

## Quick Start
```bash
npm install
npm run dev
```

Application will be available at `http://localhost:8080`

## 🚀 Features

- **Multi-Panel Wizard Interface**: Specialized panels guide you through complete small craft configuration
- **Real-time Mass & Cost Tracking**: Live calculations with overweight warnings
- **Comprehensive Component Library**: Full selection of drives, weapons, fittings, and electronics
- **Tech Level Support**: TL 8-17+ (A-H) with appropriate component filtering
- **IndexedDB Persistence**: Save and load craft designs locally in your browser
- **Export/Import**: Save designs to JSON files and load them back
- **Print Support**: Generate printable design summaries

## 📋 System Requirements

- **Node.js** (v22 or higher)
- **npm** package manager
- Modern web browser with IndexedDB support

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/DavidLDawes/vehicles.git
cd vehicles
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### 4. Database Auto-Initialization

The IndexedDB database is automatically initialized on first run with sample craft from `public/initial-smallcraft.json`.

## 🎮 Usage

### Design Process

1. **Select Small Craft Panel**: Choose existing design or create new
   - Browse saved designs from IndexedDB
   - Create new craft from scratch
   - Import designs from JSON files

2. **Hull Panel**: Configure basic craft information
   - Name (unique identifier)
   - Tech Level (A-H, representing TL 10-17+)
   - Tonnage Code (S1-S10 for 10-100 tons)
   - Optional description

3. **Armor Panel**: Add protective armor (optional)
   - **Titanium Steel** (TL 7+): 2 points per 5% hull, max armor = TL (up to 9)
   - **Crystaliron** (TL 10+): 4 points per 5% hull, max armor = TL (up to 13)
   - **Bonded Superdense** (TL 14+): 6 points per 5% hull, max armor = TL

4. **Drives Panel**: Configure propulsion and power systems
   - **Power Plants**: Fusion (TL 8+) or Chemical (TL 5+)
   - **Maneuver Drives**: Gravitic (TL 9+) or Reaction (TL 7+)
   - **Drive Models**: sA through sZ (performance varies by hull tonnage)
   - **Fuel Configuration**: Set fuel amount and operation duration
   - Multiple drives can be installed for redundancy

5. **Fittings Panel**: Essential craft components
   - **Cockpit** (1.5 tons/crew): Compact crew stations
   - **Control Cabin** (3 tons/crew): Spacious stations with passenger capacity
   - **Passenger Cabins** (1.5 tons/passenger): Accommodation for passengers
   - **Airlocks** (1 ton each, max 6): Entry/exit points
   - **Fresher** (1 ton): Bathroom facilities
   - **Galley** (0.5 tons): Kitchen facilities
   - **Electronics Systems** (TL-dependent):
     - Standard (TL 8, DM -4): Radar, Lidar - included in cockpit/control cabin
     - Basic Civilian (TL 9, DM -2): Radar, Lidar - 1 ton, Cr. 50,000
     - Basic Military (TL 10, DM +0): Radar, Lidar, Jammers - 2 tons, MCr. 1
     - Advanced (TL 11, DM +1): Radar, Lidar, Densitometer, Jammers - 3 tons, MCr. 2
     - Very Advanced (TL 12, DM +2): Full sensor suite with Neural Activity Sensor - 5 tons, MCr. 4

6. **Weapons Panel**: Offensive and defensive systems
   - **Ship Weapons** (limited by hull tonnage):
     - **Pulse Laser Turrets**: Single (1.7 MCr), Double (2.5 MCr), Triple (3.5 MCr)
     - **Beam Laser Turrets**: Single (2.2 MCr), Double (3.5 MCr), Triple (5 MCr)
     - **Particle Beam Barbette** (5.5 MCr, 40+ ton hulls only): Heavy weapon consuming 2 slots
     - **Torpedoes** (2 MCr): Guided munitions
   - **Weapon Limits**: S1-S3 (1 slot), S4-S6 (2 slots), S7-S8 (3 slots), S9 (4 slots), S10 (5 slots)
   - **Energy Weapon Requirements**: Larger power plants required for energy weapons
   - **Ammunition**: Configure missile/torpedo reloads (0.25 tons per reload)

7. **Cargo Panel**: Storage configuration
   - **Cargo Bay**: General storage (free)
   - **Ship's Locker**: Secured storage for equipment (0.2 MCr/ton)

8. **Staff Panel**: Crew configuration
   - **Pilots**: Number of pilot positions (minimum 1)
   - **Gunners**: Auto-calculated based on weapons, can override
     - 1 gunner per turret type (pulse laser, beam laser)
     - 1 gunner per particle beam barbette
     - 1 gunner if any torpedoes present
   - **Engineer**: Required if 2+ power plants or 2+ maneuver drives
   - **Communications Officer**: Optional specialist
   - **Sensors Officer**: Optional specialist
   - **ECM Officer**: Optional specialist
   - **Other Crew**: Additional crew positions

9. **Summary Panel**: Final design overview
   - Complete craft specifications
   - Mass and cost breakdown
   - Save/Print functionality

### Mass & Cost Tracking

The application continuously tracks:
- **Mass Calculation**: Sum of all components, fuel, armor, and cargo
- **Hull Tonnage Limit**: Design cannot exceed hull tonnage
- **Cost Breakdown**: Detailed costs by category (hull, armor, drives, fittings, weapons, cargo)
- **Overweight Warning**: Prevents advancing if design exceeds tonnage limit

## 🏗️ Project Structure

```
vehicles/
├── src/
│   ├── components/          # React components for each panel
│   │   ├── SelectSmallCraftPanel.tsx
│   │   ├── HullPanel.tsx
│   │   ├── ArmorPanel.tsx
│   │   ├── DrivesPanel.tsx
│   │   ├── FittingsPanel.tsx
│   │   ├── WeaponsPanel.tsx
│   │   ├── CargoPanel.tsx
│   │   ├── StaffPanel.tsx
│   │   └── SummaryPanel.tsx
│   ├── types/              # TypeScript type definitions
│   │   └── ship.ts         # SmallCraftDesign and component interfaces
│   ├── data/               # Game constants and rules
│   │   └── constants.ts    # Drive specs, weapons, fittings, electronics
│   ├── services/           # Business logic
│   │   ├── database.ts     # IndexedDB abstraction
│   │   └── initialDataService.ts  # Initial data loading
│   ├── App.tsx             # Main application component
│   ├── App.css             # Application styles
│   └── main.tsx            # Application entry point
├── public/
│   └── initial-smallcraft.json  # Sample craft loaded on first run
├── webpack.config.cjs      # Webpack configuration
├── package.json            # Dependencies and scripts
├── CLAUDE.md               # Instructions for Claude Code
└── README.md               # This file
```

## 📊 Drive Performance Data

This application implements drive performance ratings from the Traveller SRD Small Craft Design rules. The official performance tables can be found at: [https://www.traveller-srd.com/high-guard/small-craft-design/](https://www.traveller-srd.com/high-guard/small-craft-design/)

Drive performance varies by:
- **Drive Model** (sA through sZ)
- **Hull Tonnage** (10-100 tons)
- **Drive Type** (Gravitic, Reaction, Fusion, Chemical)

All drive specifications are implemented in `src/data/constants.ts` and include mass, cost, and performance ratings for each tonnage class.

## 💾 Database Management

The application uses **IndexedDB** for local browser storage with the following npm scripts:

```bash
npm run extractDB    # Export craft designs from IndexedDB to JSON files
npm run preloadDB    # Import craft designs from JSON files to IndexedDB
npm run flushDB      # Clear all craft from IndexedDB
npm run setInitialDB # Reset DB to initial state with sample craft
```

**Key Features**:
- Unique craft names enforced by database index
- Auto-initialization on first run with `public/initial-smallcraft.json`
- Version migration support for future schema changes
- No backend required - all data stored locally in browser

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start webpack-dev-server on port 8080
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:run     # Run tests once (CI mode)
```

## 🎨 Technology Stack

- **React 19** with TypeScript
- **Webpack 5** for bundling and development server
- **IndexedDB** (via fake-indexeddb for tests) for local storage
- **Jest** with Testing Library for testing
- **CSS3** with responsive design
- **Modern ES6+** JavaScript features

## 🐛 Troubleshooting

### Common Issues

1. **Port 8080 Already in Use**
   - Change port in `webpack.config.cjs` devServer configuration
   - Or stop the process using port 8080

2. **Module Not Found Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and `package-lock.json`, then run `npm install`

3. **IndexedDB Issues**
   - Clear browser storage (Application → IndexedDB in DevTools)
   - Run `npm run flushDB` to reset database
   - Check browser console for IndexedDB errors

4. **Build Errors**
   - Ensure Node.js version 22 or higher
   - Check for TypeScript errors: `npm run lint`
   - Delete `dist` folder and rebuild

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the vehicles repository and follows the same licensing terms.

## 🙏 Acknowledgments

Built with modern web technologies and designed for extensibility and maintainability.
