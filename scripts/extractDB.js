#!/usr/bin/env node
/**
 * extractDB.js
 * Exports all small craft from IndexedDB to a JSON file
 * Usage: npm run extractDB
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
const OUTPUT_FILE = path.join(__dirname, '..', 'extracted-smallcraft.json');

// Open database connection (mirrored from database.ts)
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

// Extract all small craft
async function extractSmallCraft() {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to extract small craft'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log('Extracting small craft from IndexedDB...');

    const smallCraft = await extractSmallCraft();

    if (smallCraft.length === 0) {
      console.log('No small craft found in database.');
      console.log('Writing empty array to file...');
    } else {
      console.log(`Found ${smallCraft.length} small craft.`);
    }

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(smallCraft, null, 2), 'utf8');
    console.log(`✓ Exported to: ${OUTPUT_FILE}`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to extract small craft:', error.message);
    process.exit(1);
  }
}

main();
