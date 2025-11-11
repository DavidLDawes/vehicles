#!/usr/bin/env node
/**
 * flushDB.js
 * Deletes all small craft from IndexedDB
 * Usage: npm run flushDB
 */

// Setup fake-indexeddb for Node.js environment
const { default: indexedDB } = require('fake-indexeddb');
const { default: IDBKeyRange } = require('fake-indexeddb/lib/FDBKeyRange');

// Make IndexedDB available globally
global.indexedDB = indexedDB;
global.IDBKeyRange = IDBKeyRange;

const DB_NAME = 'SmallCraftDesignerDB';
const DB_VERSION = 1;
const STORE_NAME = 'smallcraft';

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

// Flush all small craft
async function flushSmallCraft() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to flush database'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Main execution
async function main() {
  try {
    console.log('Flushing all small craft from IndexedDB...');

    await flushSmallCraft();

    console.log('✓ All small craft deleted successfully');

    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to flush database:', error.message);
    process.exit(1);
  }
}

main();
