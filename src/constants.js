export const APP_VERSION = "3.1.0";
export const STORAGE_KEY = "veg-batch-checker:v9";
export const VEG_DB_KEY = "veg-batch-checker:vegdb-v4";
export const META_KEY = "veg-batch-checker:meta";

export const DEFAULT_VEG_DB = [
  { name: "Romaine",    requiresBang: false, requiresVisual: false, requiresHotWater: false, requiresDoubleWash: false },
  { name: "Iceberg",    requiresBang: false, requiresVisual: false, requiresHotWater: false, requiresDoubleWash: false },
  { name: "Leeks",      requiresBang: false, requiresVisual: false, requiresHotWater: false, requiresDoubleWash: false },
  { name: "Spinach",    requiresBang: false, requiresVisual: false, requiresHotWater: false, requiresDoubleWash: false },
  { name: "Herbs",      requiresBang: false, requiresVisual: false, requiresHotWater: false, requiresDoubleWash: false },
  { name: "Corn",       requiresBang: false, requiresVisual: false, requiresHotWater: true,  requiresDoubleWash: false },
  { name: "Broccoli",   requiresBang: true,  requiresVisual: false, requiresHotWater: true,  requiresDoubleWash: true  },
  { name: "Tenderstem", requiresBang: true,  requiresVisual: false, requiresHotWater: true,  requiresDoubleWash: true  },
  { name: "Cauliflower",requiresBang: false, requiresVisual: true,  requiresHotWater: false, requiresDoubleWash: false }
];
