#!/usr/bin/env node
/**
 * preloadDB.js
 * Imports small craft from a JSON file into IndexedDB
 * Usage: npm run preloadDB
 */

const fs = require('fs');
const path = require('path');

// Setup fake-indexeddb for Node.js environment
const { default: indexedDB } = require('fake-indexeddb');
const { default: IDBKeyRange } = require('fake-indexeddb/lib/FDBKeyRange');

// Make IndexedDB available globally
global.indexedDB = indexedDB;
global.IDBKeyRange = IDBKeyRange;

const DB_NAME = 'SmallCraftDesignerDB';
const DB_VERSION = 1;
const STORE_NAME = 'smallcraft';
const INPUT_FILE = path.join(__dirname, '..', 'extracted-smallcraft.json');

// Open database connection
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });

        objectStore.createIndex('name', 'name', { unique: true });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

// Import small craft
async function importSmallCraft(smallCraftList) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    let successCount = 0;
    let errorCount = 0;

    smallCraftList.forEach((craft) => {
      // Remove id to let autoIncrement assign new IDs
      const { id, ...craftWithoutId } = craft;
      const request = store.add(craftWithoutId);

      request.onsuccess = () => {
        successCount++;
      };

      request.onerror = () => {
        errorCount++;
        console.error(`Failed to import "${craft.name}":`, request.error?.message);
      };
    });

    transaction.oncomplete = () => {
      db.close();
      resolve({ successCount, errorCount });
    };

    transaction.onerror = () => {
      db.close();
      reject(new Error('Transaction failed'));
    };
  });
}

// Main execution
async function main() {
  try {
    // Check if input file exists
    if (!fs.existsSync(INPUT_FILE)) {
      console.error(`✗ Input file not found: ${INPUT_FILE}`);
      console.log('  Run "npm run extractDB" first to create the file.');
      process.exit(1);
    }

    console.log(`Reading from: ${INPUT_FILE}`);

    // Read and parse JSON file
    const fileContent = fs.readFileSync(INPUT_FILE, 'utf8');
    const smallCraft = JSON.parse(fileContent);

    if (!Array.isArray(smallCraft)) {
      console.error('✗ Invalid file format: expected an array of small craft');
      process.exit(1);
    }

    if (smallCraft.length === 0) {
      console.log('No small craft to import (file is empty).');
      process.exit(0);
    }

    console.log(`Found ${smallCraft.length} small craft to import...`);

    // Import to database
    const { successCount, errorCount } = await importSmallCraft(smallCraft);

    console.log(`✓ Successfully imported ${successCount} small craft`);
    if (errorCount > 0) {
      console.log(`  (${errorCount} failed - possibly duplicate names)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to preload small craft:', error.message);
    process.exit(1);
  }
}

main();
