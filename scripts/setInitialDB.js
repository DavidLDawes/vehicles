#!/usr/bin/env node
/**
 * setInitialDB.js
 * Sets up the initial small craft data for bootstrapping the app
 *
 * This script:
 * 1. Checks for extracted-smallcraft.json (created by extractDB)
 * 2. Copies it to public/initial-smallcraft.json
 * 3. This file is then loaded automatically when the app first runs
 *
 * Usage: npm run setInitialDB
 */

const fs = require('fs');
const path = require('path');

const EXTRACTED_FILE = path.join(__dirname, '..', 'extracted-smallcraft.json');
const INITIAL_FILE = path.join(__dirname, '..', 'public', 'initial-smallcraft.json');

// Main execution
async function main() {
  try {
    // Check if extracted file exists
    if (!fs.existsSync(EXTRACTED_FILE)) {
      console.error(`✗ Extracted file not found: ${EXTRACTED_FILE}`);
      console.log('\nPlease run these steps first:');
      console.log('  1. Create and save your desired initial small craft in the app');
      console.log('  2. Run "npm run extractDB" to export them to extracted-smallcraft.json');
      console.log('  3. Run this command again');
      process.exit(1);
    }

    console.log(`Reading from: ${EXTRACTED_FILE}`);

    // Read and validate JSON file
    const fileContent = fs.readFileSync(EXTRACTED_FILE, 'utf8');
    const smallCraft = JSON.parse(fileContent);

    if (!Array.isArray(smallCraft)) {
      console.error('✗ Invalid file format: expected an array of small craft');
      process.exit(1);
    }

    console.log(`Found ${smallCraft.length} small craft`);

    // Ensure public directory exists
    const publicDir = path.dirname(INITIAL_FILE);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log(`Created directory: ${publicDir}`);
    }

    // Copy to initial-smallcraft.json
    fs.writeFileSync(INITIAL_FILE, JSON.stringify(smallCraft, null, 2), 'utf8');

    console.log(`✓ Initial small craft data saved to: ${INITIAL_FILE}`);
    console.log('\nThis file will be automatically loaded when users first run the app.');
    console.log('The app will detect an empty database and load these designs as defaults.');

    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to set initial data:', error.message);
    process.exit(1);
  }
}

main();
