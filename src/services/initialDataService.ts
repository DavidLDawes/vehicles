// Service for loading initial small craft data on first run
import { SmallCraftDesign } from '../types/ship';
import { loadAllSmallCraft, saveSmallCraft } from './database';

const INITIAL_DATA_URL = '/initial-smallcraft.json';

/**
 * Check if database is empty and load initial data if so
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if database already has data
    const existingCraft = await loadAllSmallCraft();

    if (existingCraft.length > 0) {
      console.log(`Database already contains ${existingCraft.length} small craft - skipping initialization`);
      return;
    }

    console.log('Database is empty - loading initial data...');

    // Fetch initial data file
    const response = await fetch(INITIAL_DATA_URL);

    if (!response.ok) {
      console.log('No initial data file found - database will start empty');
      return;
    }

    const initialCraft: SmallCraftDesign[] = await response.json();

    if (!Array.isArray(initialCraft) || initialCraft.length === 0) {
      console.log('Initial data file is empty or invalid');
      return;
    }

    console.log(`Loading ${initialCraft.length} initial small craft...`);

    // Load each craft into the database
    let successCount = 0;
    let errorCount = 0;

    for (const craft of initialCraft) {
      try {
        // Remove id to let autoIncrement assign new IDs
        const { id, ...craftWithoutId } = craft;
        await saveSmallCraft(craftWithoutId as SmallCraftDesign);
        successCount++;
      } catch (error) {
        console.error(`Failed to load "${craft.name}":`, error);
        errorCount++;
      }
    }

    console.log(`✓ Successfully loaded ${successCount} initial small craft`);
    if (errorCount > 0) {
      console.log(`  (${errorCount} failed)`);
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Don't throw - allow app to continue even if initialization fails
  }
}
