import { SmallCraftDesign, Drive, Fitting, Weapon } from '../types/ship';
import { getHullCode, mcrToCredits } from '../data/constants';

interface CSVRow {
  category: string;
  item: string;
  tons: string;
  cost: string;
}

interface HeaderInfo {
  shipName: string;
  description: string;
  hullTonnage: number;
  hullCost: number;
  remainingContent: string;
}

/**
 * Parse CSV content and extract ship name and hull info from header lines
 * @param csvContent The raw CSV file content
 * @param filename The original filename (with or without .csv extension)
 * @returns Object containing ship name, hull tonnage, hull cost, and remaining CSV content
 */
export function extractHeaderInfo(csvContent: string, filename: string): HeaderInfo {
  const lines = csvContent.split('\n');

  let shipName = filename.replace(/\.csv$/i, '');
  let description = '';
  let hullTonnage = 0;
  let hullCost = 0;
  let lineIndex = 0;

  // Check first line for name
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    const nameMatch = firstLine.match(/^name,(.+)$/i);

    if (nameMatch) {
      // Extract ship name from CSV (handle quoted values)
      let extractedName = nameMatch[1].trim();

      // Remove quotes if present
      if (extractedName.startsWith('"') && extractedName.endsWith('"')) {
        extractedName = extractedName.slice(1, -1).replace(/""/g, '"');
      }

      shipName = extractedName;
      lineIndex = 1;
    }
  }

  // Check next line for Description: "Description,<text>" (ignoring leading whitespace)
  if (lines.length > lineIndex) {
    const descLine = lines[lineIndex].trim();
    const descMatch = descLine.match(/^Description,(.+)$/i);

    if (descMatch) {
      // Extract description from CSV (handle quoted values)
      let extractedDesc = descMatch[1].trim();

      // Remove quotes if present
      if (extractedDesc.startsWith('"') && extractedDesc.endsWith('"')) {
        extractedDesc = extractedDesc.slice(1, -1).replace(/""/g, '"');
      }

      description = extractedDesc;
      lineIndex++;
    }
  }

  // Check next line for Hull info: "Hull,90 tons,98.1 MCr" (ignoring leading whitespace)
  if (lines.length > lineIndex) {
    const hullLine = lines[lineIndex].trim();
    const hullMatch = hullLine.match(/^Hull,\s*(\d+(?:\.\d+)?)\s*tons?\s*,\s*(\d+(?:\.\d+)?)\s*MCr/i);

    if (hullMatch) {
      hullTonnage = parseFloat(hullMatch[1]);
      hullCost = mcrToCredits(parseFloat(hullMatch[2]));
      lineIndex++;
    }
  }

  // Return remaining content after the header lines
  const remainingContent = lines.slice(lineIndex).join('\n');

  return {
    shipName,
    description,
    hullTonnage,
    hullCost,
    remainingContent,
  };
}

/**
 * Parse a CSV line and unescape values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Add last value
  values.push(currentValue.trim());

  return values;
}

/**
 * Parse CSV rows into structured data
 */
function parseCSVRows(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
  const rows: CSVRow[] = [];

  let foundHeader = false;
  let currentCategory = '';

  for (const line of lines) {
    const values = parseCSVLine(line);

    // Skip until we find the header row
    if (!foundHeader) {
      if (values[0] === 'Category' || values[0]?.toLowerCase() === 'category') {
        foundHeader = true;
      }
      continue;
    }

    // Skip empty or total rows
    if (values.length < 2 || values[0] === 'TOTALS' || values[1] === 'Total Mass') {
      continue;
    }

    // Update current category if present
    if (values[0] && values[0].trim().length > 0) {
      currentCategory = values[0].trim();
    }

    // Skip the main Hull detail row (not Armor or other items in Hull category)
    // The Hull detail row typically contains the tonnage code like "S9 (90 tons)"
    if (currentCategory === 'Hull' && values[1] && values[1].match(/^\s*S\d+\s*\(/)) {
      continue;
    }

    rows.push({
      category: currentCategory,
      item: values[1] || '',
      tons: values[2] || '0',
      cost: values[3] || '0',
    });
  }

  return rows;
}

/**
 * Import ship design from CSV content
 * Note: This is a basic implementation that creates a skeleton design
 * Full import would require parsing all components from CSV format
 */
export function importFromCSV(csvContent: string, filename: string): SmallCraftDesign {
  // Extract header info (name, description, and hull) from the first lines
  const { shipName, description, hullTonnage, hullCost, remainingContent } = extractHeaderInfo(csvContent, filename);

  // Parse the remaining CSV rows (skipping the header lines)
  const rows = parseCSVRows(remainingContent);

  // Initialize empty design
  const design: SmallCraftDesign = {
    name: shipName,
    description: description || undefined,
    hull: {
      name: shipName,
      techLevel: 'A', // Default, should be parsed
      tonnageCode: hullTonnage > 0 ? getHullCode(hullTonnage) : '',
      tonnage: hullTonnage,
      cost: hullCost,
      description: hullTonnage > 0 ? `${hullTonnage} tons` : '',
    },
    drives: [],
    fuel: {
      amount: 0,
      duration: 0,
      mass: 0,
    },
    fittings: [],
    weapons: [],
    cargo: {
      cargoBay: 0,
      shipsLocker: 0,
      missileReloads: 0,
      modularCutterBay: false,
    },
    staff: {
      pilot: 1,
      gunner: 0,
      engineer: false,
      comms: false,
      sensors: false,
      ecm: false,
      other: 0,
    },
  };

  // Note: Hull data is already extracted from header, so we skip the main Hull detail row in the category data

  // Parse armor (may be in Hull or Armor category)
  const armorRow = rows.find(r =>
    (r.category === 'Armor' || r.category === 'Hull') &&
    r.item.match(/Rating\s+\d+/)
  );
  if (armorRow) {
    const ratingMatch = armorRow.item.match(/Rating\s+(\d+)/);
    const typeMatch = armorRow.item.match(/^(\w+)/);

    if (ratingMatch && typeMatch) {
      design.armor = {
        type: typeMatch[1],
        rating: parseInt(ratingMatch[1], 10),
        mass: parseFloat(armorRow.tons) || 0,
        cost: mcrToCredits(parseFloat(armorRow.cost) || 0),
      };
    }
  }

  // Parse drives
  const driveRows = rows.filter(r => r.category === 'Drives');
  driveRows.forEach((row, index) => {
    const modelMatch = row.item.match(/Model\s+(\w+)/);
    const typeMatch = row.item.match(/^(\w+)/);
    const ratingMatch = row.item.match(/\(([^)]+)\)/);

    if (modelMatch && typeMatch) {
      // Extract numeric rating from string like "6G" or "4"
      let rating = 0;
      if (ratingMatch) {
        const ratingStr = ratingMatch[1];
        const numMatch = ratingStr.match(/(\d+)/);
        rating = numMatch ? parseInt(numMatch[1], 10) : 0;
      }

      const drive: Drive = {
        id: `drive-${index}`,
        type: typeMatch[1].toLowerCase() as 'maneuver' | 'powerPlant',
        model: modelMatch[1],
        rating: rating,
        mass: parseFloat(row.tons) || 0,
        cost: mcrToCredits(parseFloat(row.cost) || 0),
        quantity: 1,
      };
      design.drives.push(drive);
    }
  });

  // Parse fuel
  const fuelRow = rows.find(r => r.category === 'Fuel');
  if (fuelRow) {
    const amountMatch = fuelRow.item.match(/(\d+)\s*tons/);
    const durationMatch = fuelRow.item.match(/(\d+)\s*hours/);

    if (amountMatch) {
      design.fuel.amount = parseFloat(amountMatch[1]);
      design.fuel.mass = design.fuel.amount;
    }
    if (durationMatch) {
      design.fuel.duration = parseInt(durationMatch[1], 10);
    }
  }

  // Parse fittings
  const fittingRows = rows.filter(r => r.category === 'Fittings');
  fittingRows.forEach((row, index) => {
    const quantityMatch = row.item.match(/x(\d+)$/);
    const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
    const name = row.item.replace(/\s*x\d+$/, '').trim();

    const fitting: Fitting = {
      id: `fitting-${index}`,
      name: name,
      type: 'other', // Default type
      mass: parseFloat(row.tons) || 0,
      cost: mcrToCredits(parseFloat(row.cost) || 0),
      quantity: quantity,
    };
    design.fittings.push(fitting);
  });

  // Parse weapons
  const weaponRows = rows.filter(r => r.category === 'Weapons' && r.item !== 'Unarmed');
  weaponRows.forEach((row, index) => {
    const quantityMatch = row.item.match(/x(\d+)/);
    const mountMatch = row.item.match(/\(([^)]+)\)$/);
    const name = row.item.replace(/\s*x\d+.*$/, '').trim();

    const weapon: Weapon = {
      id: `weapon-${index}`,
      name: name,
      type: 'missile', // Default type
      mountType: mountMatch ? mountMatch[1] : 'fixed',
      mass: parseFloat(row.tons) || 0,
      cost: mcrToCredits(parseFloat(row.cost) || 0),
      quantity: quantityMatch ? parseInt(quantityMatch[1], 10) : 1,
    };
    design.weapons.push(weapon);
  });

  // Parse cargo
  const cargoRows = rows.filter(r => r.category === 'Cargo');
  cargoRows.forEach(row => {
    if (row.item.includes('Cargo Bay')) {
      const tonsMatch = row.item.match(/(\d+)\s*tons/);
      if (tonsMatch) {
        design.cargo.cargoBay = parseFloat(tonsMatch[1]);
      }
    } else if (row.item.includes("Ship's Locker")) {
      const tonsMatch = row.item.match(/(\d+)\s*tons/);
      if (tonsMatch) {
        design.cargo.shipsLocker = parseFloat(tonsMatch[1]);
      }
    } else if (row.item.includes('Missile Reloads')) {
      const tonsMatch = row.item.match(/(\d+)\s*tons/);
      if (tonsMatch) {
        design.cargo.missileReloads = parseFloat(tonsMatch[1]);
      }
    } else if (row.item.includes('Modular Cutter Bay')) {
      design.cargo.modularCutterBay = true;
    }
  });

  // Parse staff
  const staffRows = rows.filter(r => r.category === 'Staff');
  staffRows.forEach(row => {
    const match = row.item.match(/(\w+):\s*(\d+)/);
    if (match) {
      const role = match[1].toLowerCase();
      const count = parseInt(match[2], 10);

      switch (role) {
        case 'pilots':
          design.staff.pilot = count;
          break;
        case 'gunners':
          design.staff.gunner = count;
          break;
        case 'engineer':
          design.staff.engineer = count > 0;
          break;
        case 'communications':
          design.staff.comms = count > 0;
          break;
        case 'sensors':
          design.staff.sensors = count > 0;
          break;
        case 'ecm':
          design.staff.ecm = count > 0;
          break;
        case 'other':
          design.staff.other = count;
          break;
      }
    }
  });

  return design;
}
