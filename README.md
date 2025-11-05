


# Traveller Small Craft Designer
Based on Traveller role playing game and [the Traveller Small Craft SRD](https://www.traveller-srd.com/high-guard/small-craft-design/)

Built with Claude. Using a Wizard UI and local storage for the DB. Copied most of the [AID approach](https://github.com/DavidLDawes/aid), in particular copied and edited the CLAUDE.md.
## Quick Start
npminstall
npm run dev

**TODO List**
* Actually build out the app with Claude, all spec, no muscle so far.

## 🚀 Features

- **Multi-Panel Design Interface**: specialized panels for complete small craft configuration
- **Real-time Mass & Cost Tracking**: Live calculations with overweight warnings
- **Component Library**: Extensive selection of engines, weapons, and fittings
- **Database Persistence**: Save and load ship designs into local storage
- **Responsive Design**: Works seamlessly on desktop and mobile devices - maybe

## 📋 System Requirements

- **Node.js** (v16 or higher)
- **npm** package manager

## 🛠️ Installation & Setup
Requires node, 
### 1. Clone the Repository

```bash
git clone https://github.com/DavidLDawes/aid.git
cd aid
```

### 2. Database Setup

1. **DB is auto-initialized the first time it is run**
Check out the npm run commands for DB manipulation scripts to flush, load and unload the DB.
### 3. Frontend Setup

```bash

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will be available at `http://localhost:5173`

## 🎮 Usage

### Design Process

1. **Hull Panel**: Configure basic ship information
   - Name (max 32 characters)
   - Tech Level (A-H)
   - Tonnage (maximum 100 tons)
   - Optional description

2. **Drives Panel**: Configure propulsion systems
   - Power Plant (Select model, determines performance based on tonnage)
   - Maneuver Drive (Select model, determines performance based on tonnage)
   - Fuel (Amount in tons, and duration of operation)

3. **Fittings Panel**: Essential ship components
   - Cockpit or Control Cabin (one or the other is required)
   - Airlocks (optional)
   - Cabin Space (optional)
   - Mini-berths (optional)
   - Full Berths (optional)
   - Armor (optional)

4. **Weapons Panel**: Offensive systems
   - Assorted weapon types
   - Mount limits based on small craft tonnage

5. **Staff Panel**: Crew requirements
    - Auto-calculated based on ship systems

6. **Small Craft Design Panel**: Final summary
    - Complete design overview
    - Save/Load functionality

### Mass Tracking

The **Mass Sidebar** (visible from Engines panel onward) shows:
- **Total**: Ship's maximum tonnage
- **Used**: Currently allocated mass
- **Remaining**: Available mass for components
- **Overweight Warning**: Alerts when design exceeds limits

## 🏗️ Project Structure

```
aid/
├── backend/                 # Node.js/Express API server
│   ├── server.ts           # Main server application
│   ├── schema.sql          # MySQL database schema
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment configuration
├── starship-designer/      # React frontend application
│   ├── src/
│   │   ├── components/     # React components for each panel
│   │   ├── types/          # TypeScript type definitions
│   │   ├── data/           # Constants and data structures
│   │   └── App.tsx         # Main application component
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

# Engine Performance Data

This application uses drive performance ratings based on the Traveller SRD Small Craft Design rules. The official engine performance table can be found at: [https://www.traveller-srd.com/high-guard/small-craft-design/](https://www.traveller-srd.com/high-guard/small-craft-design/)

The table shows drive performance ratings by drive letter (sA-sZ) across different hull tonnages (10-100 tons). This data is implemented in `src/data/constants.ts` as the `ENGINE_DRIVES` object and is used to determine which engine drives are compatible with specific hull sizes and power plant configurations.

# DB
Using innodb-like fake-indexeddb to handle indexing for shop names being exclusive, result is there's not really any SQL, just local files, which is actually kinda cool.

On startup if there are no Ships defined in the DB then the contents of public/initial-ships.json are read into the DB.

Adddedd a few npm scripts to twiddle with the DB:
* npm run extractDB - copies ships from the DB to file(s)
* npm run preloadDB - loads file(s) into Ships DB
* npm run flushDB - removes all ships from the DB

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

### Frontend Development

```bash
cd starship-designer
npm run dev    # Start Vite development server
npm run build  # Build for production
npm run preview # Preview production build
```

## 🔧 API Endpoints

- `GET /api/smallcraft` - List all saved ships
- `GET /api/smallcraft/:id` - Get specific ship design
- `POST /api/smallcraft` - Save new ship design
- `DELETE /api/smallcraft/:id` - Delete ship design

## 🎨 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **CSS3** with responsive design
- **Modern ES6+** JavaScript features

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Backend: Change `PORT` in `backend/.env`
   - Frontend: Vite will automatically suggest alternate port

2. **Module Not Found Errors**
   - Run `npm install` in both directories
   - Clear npm cache: `npm cache clean --force`

3. **CORS Errors**
   - Ensure backend server is running
   - Check API URL in frontend requests

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the vehicles repository and follows the same licensing terms.

## 🙏 Acknowledgments

Built with modern web technologies and designed for extensibility and maintainability.
