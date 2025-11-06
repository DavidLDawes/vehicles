// TypeScript type definitions for Traveller Small Craft Designer

export interface Hull {
  name: string;
  techLevel: string; // A-H (TL 10-17+)
  tonnageCode: string; // s1-s10 (based on tonnage)
  tonnage: number; // Actual tonnage value (10-100)
  cost: number; // Cost in credits
  description?: string;
}

export interface Armor {
  type: string; // Armor type key (titanium_steel, crystaliron, bonded_superdense)
  rating: number; // Armor points
  mass: number; // Tons
  cost: number; // Credits
}

export interface Drive {
  id: string;
  type: 'powerPlant' | 'maneuver' | 'jump';
  driveType?: string; // 'gravitic_m', 'reaction_m', 'fusion_p', 'chemical_p'
  model: string;
  rating: number;
  mass: number;
  cost: number;
  quantity: number;
}

export interface Fuel {
  amount: number; // tons
  duration: number; // hours/weeks
  mass: number;
}

export interface Fitting {
  id: string;
  type: string; // cockpit, control_cabin, airlock, cabin_space, mini_berth, full_berth, etc.
  name: string;
  mass: number;
  cost: number;
  quantity: number;
  crew?: number; // For cockpit/control cabin - number of crew positions
  passengers?: number; // For control cabin - calculated as floor(crew / 2)
  description?: string;
}

export interface Weapon {
  id: string;
  type: string;
  name: string;
  category?: 'ship' | 'anti-personnel'; // ship weapons or anti-personnel weapons
  mass: number;
  cost: number;
  quantity: number;
  slotsUsed?: number; // number of ship weapon slots consumed (default 1)
  mountType?: string;
  ammunition?: number;
}

export interface Cargo {
  cargoBay: number; // tons, no cost
  shipsLocker: number; // tons, 0.2 MCr per ton
  description?: string;
}

export interface Staff {
  pilot: number;
  gunner: number;
  comms: boolean; // Adds 1 crew if true
  sensors: boolean; // Adds 1 crew if true
  ecm: boolean; // Adds 1 crew if true
  other: number;
}

export interface SmallCraftDesign {
  id?: number; // Auto-increment from IndexedDB
  name: string; // Unique ship name
  hull: Hull;
  armor?: Armor;
  drives: Drive[];
  fuel: Fuel;
  fittings: Fitting[];
  weapons: Weapon[];
  cargo: Cargo;
  staff: Staff;
  createdAt?: string;
  updatedAt?: string;
}

// Helper type for panel navigation
export type PanelType =
  | 'select'
  | 'hull'
  | 'armor'
  | 'drives'
  | 'fittings'
  | 'weapons'
  | 'cargo'
  | 'staff'
  | 'summary';
