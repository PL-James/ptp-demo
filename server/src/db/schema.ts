import { pgTable, text, boolean, timestamp, integer, jsonb, serial } from 'drizzle-orm/pg-core';

// Common fields shared by all HLF models
const commonFields = {
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  createdBy: text('createdBy'),
  updatedBy: text('updatedBy'),
  version: integer('version').default(1),
  owner: text('owner'),
};

// ─── Product ────────────────────────────────────────────────────────────────
export const product = pgTable('product', {
  productCode: text('productCode').primaryKey(), // GTIN-14
  inventedName: text('inventedName').notNull(),
  nameMedicinalProduct: text('nameMedicinalProduct'),
  internalMaterialCode: text('internalMaterialCode'),
  productRecall: boolean('productRecall').default(false),
  imageData: text('imageData'), // base64 or reference
  ...commonFields,
});

// ─── Batch ──────────────────────────────────────────────────────────────────
export const batch = pgTable('batch', {
  id: text('id').primaryKey(), // composed: productCode:batchNumber
  productCode: text('productCode').notNull(),
  batchNumber: text('batchNumber').notNull(),
  expiryDate: text('expiryDate'), // stored as GS1 format string (YYMMDD)
  importLicenseNumber: text('importLicenseNumber'),
  dateOfManufacturing: text('dateOfManufacturing'),
  manufacturerName: text('manufacturerName'),
  manufacturerAddress: jsonb('manufacturerAddress'), // nested ManufacturerAddress object
  packagingSiteName: text('packagingSiteName'),
  batchRecall: boolean('batchRecall').default(false),
  ...commonFields,
});

// ─── Leaflet ────────────────────────────────────────────────────────────────
export const leaflet = pgTable('leaflet', {
  id: text('id').primaryKey(), // composed: productCode:batchNumber:type:lang:market
  productCode: text('productCode').notNull(),
  batchNumber: text('batchNumber'),
  leafletType: text('leafletType').notNull(), // 'leaflet' | 'prescribingInfo' | 'smpc'
  lang: text('lang').notNull(),
  epiMarket: text('epiMarket'),
  xmlFileContent: text('xmlFileContent'),
  ...commonFields,
});

// ─── Audit ──────────────────────────────────────────────────────────────────
export const audit = pgTable('audit', {
  id: text('id').primaryKey(), // UUID
  userId: text('userId'),
  userGroup: text('userGroup'),
  model: text('model'), // 'product' | 'batch' | 'leaflet'
  transaction: text('transaction'), // 'create' | 'read' | 'update' | 'delete'
  action: text('action'),
  diffs: jsonb('diffs'),
  owner: text('owner'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  version: integer('version').default(1),
});

// ─── ProductStrength ────────────────────────────────────────────────────────
export const productStrength = pgTable('product_strength', {
  id: serial('id').primaryKey(),
  uuid: text('uuid'),
  productCode: text('productCode').notNull(),
  strength: text('strength'),
  substance: text('substance'),
  legalEntityName: text('legalEntityName'),
  ...commonFields,
});

// ─── ProductMarket ──────────────────────────────────────────────────────────
export const productMarket = pgTable('product_market', {
  id: serial('id').primaryKey(),
  marketId: text('marketId'),
  productCode: text('productCode').notNull(),
  nationalCode: text('nationalCode'),
  mahName: text('mahName'),
  legalEntityName: text('legalEntityName'),
  mahAddress: text('mahAddress'),
  ...commonFields,
});

// ─── ProductImage ───────────────────────────────────────────────────────────
export const productImage = pgTable('product_image', {
  id: serial('id').primaryKey(),
  productCode: text('productCode').notNull(),
  content: text('content'), // base64 image data
  ...commonFields,
});

// ─── LeafletFile ────────────────────────────────────────────────────────────
export const leafletFile = pgTable('leaflet_file', {
  id: serial('id').primaryKey(),
  leafletId: text('leafletId').notNull(),
  content: text('content'),
  filename: text('filename'),
  ...commonFields,
});

// Table registry — maps model names to Drizzle table objects
export const tableRegistry: Record<string, any> = {
  product,
  batch,
  leaflet,
  audit,
  productstrength: productStrength,
  product_strength: productStrength,
  productmarket: productMarket,
  product_market: productMarket,
  productimage: productImage,
  product_image: productImage,
  leafletfile: leafletFile,
  leaflet_file: leafletFile,
};

// Primary key field for each table
export const primaryKeyMap: Record<string, string> = {
  product: 'productCode',
  batch: 'id',
  leaflet: 'id',
  audit: 'id',
  productstrength: 'id',
  product_strength: 'id',
  productmarket: 'id',
  product_market: 'id',
  productimage: 'id',
  product_image: 'id',
  leafletfile: 'id',
  leaflet_file: 'id',
};
