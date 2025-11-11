// IndexedDB service for persisting small craft designs
import { SmallCraftDesign } from '../types/ship';

const DB_NAME = 'SmallCraftDesignerDB';
const DB_VERSION = 1;
const STORE_NAME = 'smallcraft';

// Open database connection
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });

        // Create indexes
        objectStore.createIndex('name', 'name', { unique: true });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

// Save a new small craft design or update existing
export async function saveSmallCraft(design: SmallCraftDesign): Promise<number> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Add timestamps
    const now = new Date().toISOString();
    const designToSave = {
      ...design,
      updatedAt: now,
      createdAt: design.createdAt || now,
    };

    const request = design.id ? store.put(designToSave) : store.add(designToSave);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      reject(new Error(`Failed to save small craft: ${request.error?.message}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Load all small craft designs
export async function loadAllSmallCraft(): Promise<SmallCraftDesign[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as SmallCraftDesign[]);
    };

    request.onerror = () => {
      reject(new Error('Failed to load small craft'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Load a specific small craft by ID
export async function loadSmallCraftById(id: number): Promise<SmallCraftDesign | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result as SmallCraftDesign | null);
    };

    request.onerror = () => {
      reject(new Error('Failed to load small craft'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Delete a small craft by ID
export async function deleteSmallCraft(id: number): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to delete small craft'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Check if a name already exists (for duplicate checking)
export async function checkNameExists(name: string, excludeId?: number): Promise<boolean> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('name');
    const request = index.get(name);

    request.onsuccess = () => {
      const result = request.result as SmallCraftDesign | undefined;
      // Name exists if found AND (no excludeId OR found id differs from excludeId)
      resolve(!!result && (!excludeId || result.id !== excludeId));
    };

    request.onerror = () => {
      reject(new Error('Failed to check name'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}
