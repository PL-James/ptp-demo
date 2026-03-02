import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { sql } from 'drizzle-orm';
import {
  product,
  batch,
  leaflet,
  audit,
  productStrength,
  productMarket,
  productImage,
  leafletFile,
} from './schema.js';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// ─── Helpers ────────────────────────────────────────────────────────────────

function gtin(suffix: string): string {
  return ('0' + suffix).padStart(14, '0');
}

const now = new Date();
function daysAgo(days: number): Date {
  return new Date(now.getTime() - days * 86400000);
}

function uuid(n: number): string {
  return `aud-${String(n).padStart(3, '0')}`;
}

// ─── Products ───────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    productCode: gtin('7612345000011'),
    inventedName: 'Aspirin',
    nameMedicinalProduct: 'Acetylsalicylic Acid 500mg',
    productRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(5),
  },
  {
    productCode: gtin('7612345000028'),
    inventedName: 'Metformin XR',
    nameMedicinalProduct: 'Metformin Hydrochloride 1000mg Extended Release',
    productRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(85),
    updatedAt: daysAgo(12),
  },
  {
    productCode: gtin('7612345000035'),
    inventedName: 'Atorvastatin',
    nameMedicinalProduct: 'Atorvastatin Calcium 20mg',
    productRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(80),
    updatedAt: daysAgo(3),
  },
  {
    productCode: gtin('7612345000042'),
    inventedName: 'Omeprazole DR',
    nameMedicinalProduct: 'Omeprazole Delayed-Release 40mg',
    productRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(75),
    updatedAt: daysAgo(8),
  },
  {
    productCode: gtin('7612345000059'),
    inventedName: 'Amoxicillin',
    nameMedicinalProduct: 'Amoxicillin Trihydrate 500mg',
    productRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(70),
    updatedAt: daysAgo(15),
  },
  {
    productCode: gtin('7612345000066'),
    inventedName: 'Losartan',
    nameMedicinalProduct: 'Losartan Potassium 50mg',
    productRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(2),
  },
  {
    productCode: gtin('7612345000073'),
    inventedName: 'Levothyroxine',
    nameMedicinalProduct: 'Levothyroxine Sodium 100mcg',
    productRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(55),
    updatedAt: daysAgo(20),
  },
  {
    productCode: gtin('7612345000080'),
    inventedName: 'Ibuprofen',
    nameMedicinalProduct: 'Ibuprofen 400mg Film-Coated',
    productRecall: true,
    owner: 'PharmaLedger',
    createdAt: daysAgo(50),
    updatedAt: daysAgo(1),
  },
  {
    productCode: gtin('7612345000097'),
    inventedName: 'Simvastatin',
    nameMedicinalProduct: 'Simvastatin 40mg Film-Coated Tablets',
    productRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(7),
  },
  {
    productCode: gtin('7612345000103'),
    inventedName: 'Lisinopril',
    nameMedicinalProduct: 'Lisinopril 10mg Tablets',
    productRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(40),
    updatedAt: daysAgo(4),
  },
  {
    productCode: gtin('7612345000110'),
    inventedName: 'Paracetamol',
    nameMedicinalProduct: 'Paracetamol 500mg Tablets',
    productRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(35),
    updatedAt: daysAgo(6),
  },
  {
    productCode: gtin('7612345000127'),
    inventedName: 'Azithromycin',
    nameMedicinalProduct: 'Azithromycin 250mg Capsules',
    productRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(9),
  },
];

// ─── Batches ────────────────────────────────────────────────────────────────

const BATCHES = [
  { id: 'bt-001', productCode: PRODUCTS[0].productCode, batchNumber: 'BT-ASP-2026-001', expiryDate: '261200', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(45), updatedAt: daysAgo(10) },
  { id: 'bt-002', productCode: PRODUCTS[0].productCode, batchNumber: 'BT-ASP-2026-002', expiryDate: '270600', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(30), updatedAt: daysAgo(5) },
  { id: 'bt-003', productCode: PRODUCTS[1].productCode, batchNumber: 'BT-MET-2026-001', expiryDate: '271200', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(40), updatedAt: daysAgo(8) },
  { id: 'bt-004', productCode: PRODUCTS[2].productCode, batchNumber: 'BT-ATV-2026-001', expiryDate: '280300', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(35), updatedAt: daysAgo(3) },
  { id: 'bt-005', productCode: PRODUCTS[2].productCode, batchNumber: 'BT-ATV-2026-002', expiryDate: '270100', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(25), updatedAt: daysAgo(2) },
  { id: 'bt-006', productCode: PRODUCTS[3].productCode, batchNumber: 'BT-OMP-2026-001', expiryDate: '260900', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(20), updatedAt: daysAgo(4) },
  { id: 'bt-007', productCode: PRODUCTS[4].productCode, batchNumber: 'BT-AMX-2026-001', expiryDate: '271200', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(18), updatedAt: daysAgo(6) },
  { id: 'bt-008', productCode: PRODUCTS[7].productCode, batchNumber: 'BT-IBU-2026-001', expiryDate: '260600', batchRecall: true, owner: 'PharmaLedger', createdAt: daysAgo(15), updatedAt: daysAgo(1) },
  { id: 'bt-009', productCode: PRODUCTS[5].productCode, batchNumber: 'BT-LOS-2026-001', expiryDate: '280100', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(14), updatedAt: daysAgo(3) },
  { id: 'bt-010', productCode: PRODUCTS[6].productCode, batchNumber: 'BT-LEV-2026-001', expiryDate: '270900', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(12), updatedAt: daysAgo(2) },
  { id: 'bt-011', productCode: PRODUCTS[8].productCode, batchNumber: 'BT-SIM-2026-001', expiryDate: '271100', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(10), updatedAt: daysAgo(1) },
  { id: 'bt-012', productCode: PRODUCTS[9].productCode, batchNumber: 'BT-LIS-2026-001', expiryDate: '280200', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(8), updatedAt: daysAgo(1) },
  { id: 'bt-013', productCode: PRODUCTS[10].productCode, batchNumber: 'BT-PAR-2026-001', expiryDate: '270800', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(7), updatedAt: daysAgo(1) },
  { id: 'bt-014', productCode: PRODUCTS[11].productCode, batchNumber: 'BT-AZI-2026-001', expiryDate: '280500', batchRecall: false, owner: 'PharmaLedger', createdAt: daysAgo(5), updatedAt: daysAgo(1) },
];

// ─── Leaflets ───────────────────────────────────────────────────────────────

const LEAFLETS = [
  { id: 'lf-001', productCode: PRODUCTS[0].productCode, leafletType: 'leaflet', lang: 'en', epiMarket: 'EU', xmlFileContent: '<?xml version="1.0"?><leaflet product="Aspirin" type="leaflet" lang="en" />', owner: 'PharmaLedger', createdAt: daysAgo(60), updatedAt: daysAgo(10) },
  { id: 'lf-002', productCode: PRODUCTS[0].productCode, leafletType: 'prescribingInfo', lang: 'en', epiMarket: 'EU', xmlFileContent: '<?xml version="1.0"?><leaflet product="Aspirin" type="prescribingInfo" lang="en" />', owner: 'PharmaLedger', createdAt: daysAgo(58), updatedAt: daysAgo(8) },
  { id: 'lf-003', productCode: PRODUCTS[1].productCode, leafletType: 'leaflet', lang: 'en', epiMarket: 'US', xmlFileContent: '<?xml version="1.0"?><leaflet product="Metformin XR" type="leaflet" lang="en" />', owner: 'PharmaLedger', createdAt: daysAgo(55), updatedAt: daysAgo(12) },
  { id: 'lf-004', productCode: PRODUCTS[1].productCode, leafletType: 'leaflet', lang: 'pt-br', epiMarket: 'BR', xmlFileContent: '<?xml version="1.0"?><leaflet product="Metformin XR" type="leaflet" lang="pt-br" />', owner: 'PharmaLedger', createdAt: daysAgo(50), updatedAt: daysAgo(5) },
  { id: 'lf-005', productCode: PRODUCTS[2].productCode, leafletType: 'leaflet', lang: 'de', epiMarket: 'CH', xmlFileContent: '<?xml version="1.0"?><leaflet product="Atorvastatin" type="leaflet" lang="de" />', owner: 'PharmaLedger', createdAt: daysAgo(48), updatedAt: daysAgo(3) },
  { id: 'lf-006', productCode: PRODUCTS[2].productCode, leafletType: 'prescribingInfo', lang: 'de', epiMarket: 'DE', xmlFileContent: '<?xml version="1.0"?><leaflet product="Atorvastatin" type="prescribingInfo" lang="de" />', owner: 'PharmaLedger', createdAt: daysAgo(45), updatedAt: daysAgo(7) },
  { id: 'lf-007', productCode: PRODUCTS[3].productCode, leafletType: 'leaflet', lang: 'fr', epiMarket: 'FR', xmlFileContent: '<?xml version="1.0"?><leaflet product="Omeprazole DR" type="leaflet" lang="fr" />', owner: 'PharmaLedger', createdAt: daysAgo(40), updatedAt: daysAgo(15) },
  { id: 'lf-008', productCode: PRODUCTS[4].productCode, leafletType: 'leaflet', lang: 'en', epiMarket: 'UK', xmlFileContent: '<?xml version="1.0"?><leaflet product="Amoxicillin" type="leaflet" lang="en" />', owner: 'PharmaLedger', createdAt: daysAgo(35), updatedAt: daysAgo(2) },
  { id: 'lf-009', productCode: PRODUCTS[5].productCode, leafletType: 'smpc', lang: 'en', epiMarket: 'EU', xmlFileContent: '<?xml version="1.0"?><leaflet product="Losartan" type="smpc" lang="en" />', owner: 'PharmaLedger', createdAt: daysAgo(30), updatedAt: daysAgo(4) },
  { id: 'lf-010', productCode: PRODUCTS[7].productCode, leafletType: 'leaflet', lang: 'en', epiMarket: 'EU', xmlFileContent: '<?xml version="1.0"?><leaflet product="Ibuprofen" type="leaflet" lang="en" />', owner: 'PharmaLedger', createdAt: daysAgo(20), updatedAt: daysAgo(1) },
];

// ─── Audit ──────────────────────────────────────────────────────────────────

const DEMO_USERS = [
  'james.gannon@pharmaledger.org',
  'ana.silva@pharmaledger.org',
  'marc.dupont@pharmaledger.org',
  'sarah.chen@pharmaledger.org',
  'demerson.carvalho@pharmaledger.org',
];

const AUDITS = [
  { id: uuid(1), userId: DEMO_USERS[0], userGroup: 'admin', model: 'product', transaction: 'create', action: 'Add user', diffs: { inventedName: { old: '', new: 'Aspirin' } }, owner: 'PharmaLedger', createdAt: daysAgo(30), updatedAt: daysAgo(30) },
  { id: uuid(2), userId: DEMO_USERS[1], userGroup: 'write', model: 'batch', transaction: 'create', action: 'Create identity', diffs: null, owner: 'PharmaLedger', createdAt: daysAgo(28), updatedAt: daysAgo(28) },
  { id: uuid(3), userId: DEMO_USERS[2], userGroup: 'write', model: 'leaflet', transaction: 'create', action: 'Authorize integration user', diffs: null, owner: 'PharmaLedger', createdAt: daysAgo(25), updatedAt: daysAgo(25) },
  { id: uuid(4), userId: DEMO_USERS[3], userGroup: 'read', model: 'product', transaction: 'read', action: 'Access wallet', diffs: null, owner: 'PharmaLedger', createdAt: daysAgo(20), updatedAt: daysAgo(20) },
  { id: uuid(5), userId: DEMO_USERS[0], userGroup: 'admin', model: 'product', transaction: 'update', action: 'Login wallet', diffs: { expiryDate: { old: '261200', new: '271200' } }, owner: 'PharmaLedger', createdAt: daysAgo(15), updatedAt: daysAgo(15) },
  { id: uuid(6), userId: DEMO_USERS[4], userGroup: 'write', model: 'batch', transaction: 'update', action: 'Add user', diffs: null, owner: 'PharmaLedger', createdAt: daysAgo(12), updatedAt: daysAgo(12) },
  { id: uuid(7), userId: DEMO_USERS[1], userGroup: 'admin', model: 'leaflet', transaction: 'create', action: 'Create identity', diffs: null, owner: 'PharmaLedger', createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { id: uuid(8), userId: DEMO_USERS[2], userGroup: 'write', model: 'product', transaction: 'update', action: 'Authorize integration user', diffs: { nameMedicinalProduct: { old: 'Ibuprofen 200mg', new: 'Ibuprofen 400mg Film-Coated' } }, owner: 'PharmaLedger', createdAt: daysAgo(7), updatedAt: daysAgo(7) },
  { id: uuid(9), userId: DEMO_USERS[3], userGroup: 'read', model: 'batch', transaction: 'read', action: 'Access wallet', diffs: null, owner: 'PharmaLedger', createdAt: daysAgo(5), updatedAt: daysAgo(5) },
  { id: uuid(10), userId: DEMO_USERS[0], userGroup: 'admin', model: 'batch', transaction: 'update', action: 'Revoke integration user', diffs: { batchRecall: { old: false, new: true } }, owner: 'PharmaLedger', createdAt: daysAgo(2), updatedAt: daysAgo(2) },
  { id: uuid(11), userId: DEMO_USERS[0], userGroup: 'admin', model: 'product', transaction: 'create', action: 'Login wallet', diffs: null, owner: 'PharmaLedger', createdAt: daysAgo(1), updatedAt: daysAgo(1) },
  { id: uuid(12), userId: DEMO_USERS[1], userGroup: 'write', model: 'leaflet', transaction: 'update', action: 'Add user', diffs: null, owner: 'PharmaLedger', createdAt: daysAgo(0), updatedAt: daysAgo(0) },
];

// ─── Product Strengths ──────────────────────────────────────────────────────

const STRENGTHS = [
  { uuid: 'ps-001', productCode: PRODUCTS[0].productCode, strength: '500mg', substance: 'Acetylsalicylic Acid', owner: 'PharmaLedger', createdAt: daysAgo(90), updatedAt: daysAgo(90) },
  { uuid: 'ps-002', productCode: PRODUCTS[0].productCode, strength: '100mg', substance: 'Acetylsalicylic Acid', owner: 'PharmaLedger', createdAt: daysAgo(90), updatedAt: daysAgo(90) },
  { uuid: 'ps-003', productCode: PRODUCTS[1].productCode, strength: '1000mg', substance: 'Metformin Hydrochloride', owner: 'PharmaLedger', createdAt: daysAgo(85), updatedAt: daysAgo(85) },
  { uuid: 'ps-004', productCode: PRODUCTS[1].productCode, strength: '500mg', substance: 'Metformin Hydrochloride', owner: 'PharmaLedger', createdAt: daysAgo(85), updatedAt: daysAgo(85) },
  { uuid: 'ps-005', productCode: PRODUCTS[2].productCode, strength: '20mg', substance: 'Atorvastatin Calcium', owner: 'PharmaLedger', createdAt: daysAgo(80), updatedAt: daysAgo(80) },
  { uuid: 'ps-006', productCode: PRODUCTS[2].productCode, strength: '40mg', substance: 'Atorvastatin Calcium', owner: 'PharmaLedger', createdAt: daysAgo(80), updatedAt: daysAgo(80) },
  { uuid: 'ps-007', productCode: PRODUCTS[3].productCode, strength: '40mg', substance: 'Omeprazole', owner: 'PharmaLedger', createdAt: daysAgo(75), updatedAt: daysAgo(75) },
  { uuid: 'ps-008', productCode: PRODUCTS[4].productCode, strength: '500mg', substance: 'Amoxicillin Trihydrate', owner: 'PharmaLedger', createdAt: daysAgo(70), updatedAt: daysAgo(70) },
  { uuid: 'ps-009', productCode: PRODUCTS[5].productCode, strength: '50mg', substance: 'Losartan Potassium', owner: 'PharmaLedger', createdAt: daysAgo(60), updatedAt: daysAgo(60) },
  { uuid: 'ps-010', productCode: PRODUCTS[6].productCode, strength: '100mcg', substance: 'Levothyroxine Sodium', owner: 'PharmaLedger', createdAt: daysAgo(55), updatedAt: daysAgo(55) },
  { uuid: 'ps-011', productCode: PRODUCTS[7].productCode, strength: '400mg', substance: 'Ibuprofen', owner: 'PharmaLedger', createdAt: daysAgo(50), updatedAt: daysAgo(50) },
  { uuid: 'ps-012', productCode: PRODUCTS[7].productCode, strength: '200mg', substance: 'Ibuprofen', owner: 'PharmaLedger', createdAt: daysAgo(50), updatedAt: daysAgo(50) },
];

// ─── Product Markets ────────────────────────────────────────────────────────

const MARKETS = [
  { marketId: 'EU', productCode: PRODUCTS[0].productCode, nationalCode: 'EU/1/26/001', mahName: 'PharmaLedger EU', owner: 'PharmaLedger', createdAt: daysAgo(90), updatedAt: daysAgo(90) },
  { marketId: 'US', productCode: PRODUCTS[0].productCode, nationalCode: 'NDA-026001', mahName: 'PharmaLedger US', owner: 'PharmaLedger', createdAt: daysAgo(90), updatedAt: daysAgo(90) },
  { marketId: 'US', productCode: PRODUCTS[1].productCode, nationalCode: 'NDA-026002', mahName: 'PharmaLedger US', owner: 'PharmaLedger', createdAt: daysAgo(85), updatedAt: daysAgo(85) },
  { marketId: 'BR', productCode: PRODUCTS[1].productCode, nationalCode: 'BR-2026-002', mahName: 'PharmaLedger Brazil', owner: 'PharmaLedger', createdAt: daysAgo(85), updatedAt: daysAgo(85) },
  { marketId: 'CH', productCode: PRODUCTS[2].productCode, nationalCode: 'CH-2026-003', mahName: 'PharmaLedger Switzerland', owner: 'PharmaLedger', createdAt: daysAgo(80), updatedAt: daysAgo(80) },
  { marketId: 'DE', productCode: PRODUCTS[2].productCode, nationalCode: 'DE-2026-003', mahName: 'PharmaLedger Germany', owner: 'PharmaLedger', createdAt: daysAgo(80), updatedAt: daysAgo(80) },
  { marketId: 'FR', productCode: PRODUCTS[3].productCode, nationalCode: 'FR-2026-004', mahName: 'PharmaLedger France', owner: 'PharmaLedger', createdAt: daysAgo(75), updatedAt: daysAgo(75) },
  { marketId: 'UK', productCode: PRODUCTS[4].productCode, nationalCode: 'UK-2026-005', mahName: 'PharmaLedger UK', owner: 'PharmaLedger', createdAt: daysAgo(70), updatedAt: daysAgo(70) },
  { marketId: 'EU', productCode: PRODUCTS[5].productCode, nationalCode: 'EU/1/26/006', mahName: 'PharmaLedger EU', owner: 'PharmaLedger', createdAt: daysAgo(60), updatedAt: daysAgo(60) },
  { marketId: 'EU', productCode: PRODUCTS[7].productCode, nationalCode: 'EU/1/26/008', mahName: 'PharmaLedger EU', owner: 'PharmaLedger', createdAt: daysAgo(50), updatedAt: daysAgo(50) },
];

// ─── Seed Execution ─────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding PTP Demo database...\n');

  // Clear existing data (in reverse dependency order)
  console.log('Clearing existing data...');
  await db.delete(leafletFile);
  await db.delete(productImage);
  await db.delete(productMarket);
  await db.delete(productStrength);
  await db.delete(audit);
  await db.delete(leaflet);
  await db.delete(batch);
  await db.delete(product);

  // Insert products
  console.log(`Inserting ${PRODUCTS.length} products...`);
  await db.insert(product).values(PRODUCTS);

  // Insert batches
  console.log(`Inserting ${BATCHES.length} batches...`);
  await db.insert(batch).values(BATCHES);

  // Insert leaflets
  console.log(`Inserting ${LEAFLETS.length} leaflets...`);
  await db.insert(leaflet).values(LEAFLETS);

  // Insert audit
  console.log(`Inserting ${AUDITS.length} audit entries...`);
  await db.insert(audit).values(AUDITS);

  // Insert product strengths
  console.log(`Inserting ${STRENGTHS.length} product strengths...`);
  await db.insert(productStrength).values(STRENGTHS);

  // Insert product markets
  console.log(`Inserting ${MARKETS.length} product markets...`);
  await db.insert(productMarket).values(MARKETS);

  console.log('\nSeed complete!');
  console.log(`  Products: ${PRODUCTS.length}`);
  console.log(`  Batches: ${BATCHES.length}`);
  console.log(`  Leaflets: ${LEAFLETS.length}`);
  console.log(`  Audits: ${AUDITS.length}`);
  console.log(`  Strengths: ${STRENGTHS.length}`);
  console.log(`  Markets: ${MARKETS.length}`);

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  pool.end();
  process.exit(1);
});
