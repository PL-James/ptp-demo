/**
 * Demo data for screenshot/video purposes.
 * This file provides mock API responses so the app renders with realistic pharma data
 * without needing a live backend.
 */

function gtin(suffix: string): string {
  return ('0' + suffix).padStart(14, '0');
}

const now = new Date();
function daysAgo(days: number): string {
  return new Date(now.getTime() - days * 86400000).toISOString();
}

// ─── Products ───────────────────────────────────────────────────────────────
export const DEMO_PRODUCTS = [
  {
    __model: 'Product',
    productCode: gtin('7612345000011'),
    inventedName: 'Aspirin',
    nameMedicinalProduct: 'Acetylsalicylic Acid 500mg',
    productRecall: false,
    markets: [],
    strengths: [],
    createdAt: daysAgo(90),
    updatedAt: daysAgo(5),
  },
  {
    __model: 'Product',
    productCode: gtin('7612345000028'),
    inventedName: 'Metformin XR',
    nameMedicinalProduct: 'Metformin Hydrochloride 1000mg Extended Release',
    productRecall: false,
    markets: [],
    strengths: [],
    createdAt: daysAgo(85),
    updatedAt: daysAgo(12),
  },
  {
    __model: 'Product',
    productCode: gtin('7612345000035'),
    inventedName: 'Atorvastatin',
    nameMedicinalProduct: 'Atorvastatin Calcium 20mg',
    productRecall: false,
    markets: [],
    strengths: [],
    createdAt: daysAgo(80),
    updatedAt: daysAgo(3),
  },
  {
    __model: 'Product',
    productCode: gtin('7612345000042'),
    inventedName: 'Omeprazole DR',
    nameMedicinalProduct: 'Omeprazole Delayed-Release 40mg',
    productRecall: false,
    markets: [],
    strengths: [],
    createdAt: daysAgo(75),
    updatedAt: daysAgo(8),
  },
  {
    __model: 'Product',
    productCode: gtin('7612345000059'),
    inventedName: 'Amoxicillin',
    nameMedicinalProduct: 'Amoxicillin Trihydrate 500mg',
    productRecall: false,
    markets: [],
    strengths: [],
    createdAt: daysAgo(70),
    updatedAt: daysAgo(15),
  },
  {
    __model: 'Product',
    productCode: gtin('7612345000066'),
    inventedName: 'Losartan',
    nameMedicinalProduct: 'Losartan Potassium 50mg',
    productRecall: false,
    markets: [],
    strengths: [],
    createdAt: daysAgo(60),
    updatedAt: daysAgo(2),
  },
  {
    __model: 'Product',
    productCode: gtin('7612345000073'),
    inventedName: 'Levothyroxine',
    nameMedicinalProduct: 'Levothyroxine Sodium 100mcg',
    productRecall: false,
    markets: [],
    strengths: [],
    createdAt: daysAgo(55),
    updatedAt: daysAgo(20),
  },
  {
    __model: 'Product',
    productCode: gtin('7612345000080'),
    inventedName: 'Ibuprofen',
    nameMedicinalProduct: 'Ibuprofen 400mg Film-Coated',
    productRecall: true,
    markets: [],
    strengths: [],
    createdAt: daysAgo(50),
    updatedAt: daysAgo(1),
  },
];

// ─── Batches ────────────────────────────────────────────────────────────────
export const DEMO_BATCHES = [
  {
    __model: 'Batch',
    id: 'bt-001',
    productCode: DEMO_PRODUCTS[0].productCode,
    batchNumber: 'BT-ASP-2026-001',
    expiryDate: '261200',
    batchRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(10),
  },
  {
    __model: 'Batch',
    id: 'bt-002',
    productCode: DEMO_PRODUCTS[0].productCode,
    batchNumber: 'BT-ASP-2026-002',
    expiryDate: '270600',
    batchRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    __model: 'Batch',
    id: 'bt-003',
    productCode: DEMO_PRODUCTS[1].productCode,
    batchNumber: 'BT-MET-2026-001',
    expiryDate: '271200',
    batchRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(40),
    updatedAt: daysAgo(8),
  },
  {
    __model: 'Batch',
    id: 'bt-004',
    productCode: DEMO_PRODUCTS[2].productCode,
    batchNumber: 'BT-ATV-2026-001',
    expiryDate: '280300',
    batchRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(35),
    updatedAt: daysAgo(3),
  },
  {
    __model: 'Batch',
    id: 'bt-005',
    productCode: DEMO_PRODUCTS[2].productCode,
    batchNumber: 'BT-ATV-2026-002',
    expiryDate: '270100',
    batchRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(25),
    updatedAt: daysAgo(2),
  },
  {
    __model: 'Batch',
    id: 'bt-006',
    productCode: DEMO_PRODUCTS[3].productCode,
    batchNumber: 'BT-OMP-2026-001',
    expiryDate: '260900',
    batchRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(4),
  },
  {
    __model: 'Batch',
    id: 'bt-007',
    productCode: DEMO_PRODUCTS[4].productCode,
    batchNumber: 'BT-AMX-2026-001',
    expiryDate: '271200',
    batchRecall: false,
    owner: 'PharmaLedger',
    createdAt: daysAgo(18),
    updatedAt: daysAgo(6),
  },
  {
    __model: 'Batch',
    id: 'bt-008',
    productCode: DEMO_PRODUCTS[7].productCode,
    batchNumber: 'BT-IBU-2026-001',
    expiryDate: '260600',
    batchRecall: true,
    owner: 'PharmaLedger',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(1),
  },
];

// ─── Leaflets ───────────────────────────────────────────────────────────────
export const DEMO_LEAFLETS = [
  {
    __model: 'Leaflet',
    id: 'lf-001',
    productCode: DEMO_PRODUCTS[0].productCode,
    leafletType: 'leaflet',
    lang: 'en',
    epiMarket: 'EU',
    owner: 'PharmaLedger',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
  },
  {
    __model: 'Leaflet',
    id: 'lf-002',
    productCode: DEMO_PRODUCTS[0].productCode,
    leafletType: 'prescribingInfo',
    lang: 'en',
    epiMarket: 'EU',
    owner: 'PharmaLedger',
    createdAt: daysAgo(58),
    updatedAt: daysAgo(8),
  },
  {
    __model: 'Leaflet',
    id: 'lf-003',
    productCode: DEMO_PRODUCTS[1].productCode,
    leafletType: 'leaflet',
    lang: 'en',
    epiMarket: 'US',
    owner: 'PharmaLedger',
    createdAt: daysAgo(55),
    updatedAt: daysAgo(12),
  },
  {
    __model: 'Leaflet',
    id: 'lf-004',
    productCode: DEMO_PRODUCTS[1].productCode,
    leafletType: 'leaflet',
    lang: 'pt-br',
    epiMarket: 'BR',
    owner: 'PharmaLedger',
    createdAt: daysAgo(50),
    updatedAt: daysAgo(5),
  },
  {
    __model: 'Leaflet',
    id: 'lf-005',
    productCode: DEMO_PRODUCTS[2].productCode,
    leafletType: 'leaflet',
    lang: 'de',
    epiMarket: 'CH',
    owner: 'PharmaLedger',
    createdAt: daysAgo(48),
    updatedAt: daysAgo(3),
  },
  {
    __model: 'Leaflet',
    id: 'lf-006',
    productCode: DEMO_PRODUCTS[2].productCode,
    leafletType: 'prescribingInfo',
    lang: 'de',
    epiMarket: 'DE',
    owner: 'PharmaLedger',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(7),
  },
  {
    __model: 'Leaflet',
    id: 'lf-007',
    productCode: DEMO_PRODUCTS[3].productCode,
    leafletType: 'leaflet',
    lang: 'fr',
    epiMarket: 'FR',
    owner: 'PharmaLedger',
    createdAt: daysAgo(40),
    updatedAt: daysAgo(15),
  },
  {
    __model: 'Leaflet',
    id: 'lf-008',
    productCode: DEMO_PRODUCTS[4].productCode,
    leafletType: 'leaflet',
    lang: 'en',
    epiMarket: 'UK',
    owner: 'PharmaLedger',
    createdAt: daysAgo(35),
    updatedAt: daysAgo(2),
  },
  {
    __model: 'Leaflet',
    id: 'lf-009',
    productCode: DEMO_PRODUCTS[5].productCode,
    leafletType: 'smpc',
    lang: 'en',
    epiMarket: 'EU',
    owner: 'PharmaLedger',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(4),
  },
  {
    __model: 'Leaflet',
    id: 'lf-010',
    productCode: DEMO_PRODUCTS[7].productCode,
    leafletType: 'leaflet',
    lang: 'en',
    epiMarket: 'EU',
    owner: 'PharmaLedger',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(1),
  },
];

// ─── Audit ──────────────────────────────────────────────────────────────────
export const DEMO_AUDIT = [
  {
    __model: 'Audit',
    id: 'aud-001',
    userId: 'james.gannon@pharmaledger.org',
    userGroup: 'admin',
    model: 'product',
    transaction: 'create',
    action: 'Add user',
    diffs: { inventedName: { from: '', to: 'Aspirin' } },
    owner: 'PharmaLedger',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
  },
  {
    __model: 'Audit',
    id: 'aud-002',
    userId: 'ana.silva@pharmaledger.org',
    userGroup: 'write',
    model: 'batch',
    transaction: 'create',
    action: 'Create identity',
    owner: 'PharmaLedger',
    createdAt: daysAgo(28),
    updatedAt: daysAgo(28),
  },
  {
    __model: 'Audit',
    id: 'aud-003',
    userId: 'marc.dupont@pharmaledger.org',
    userGroup: 'write',
    model: 'leaflet',
    transaction: 'create',
    action: 'Authorize integration user',
    owner: 'PharmaLedger',
    createdAt: daysAgo(25),
    updatedAt: daysAgo(25),
  },
  {
    __model: 'Audit',
    id: 'aud-004',
    userId: 'sarah.chen@pharmaledger.org',
    userGroup: 'read',
    model: 'product',
    transaction: 'read',
    action: 'Access wallet',
    owner: 'PharmaLedger',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  {
    __model: 'Audit',
    id: 'aud-005',
    userId: 'james.gannon@pharmaledger.org',
    userGroup: 'admin',
    model: 'product',
    transaction: 'update',
    action: 'Login wallet',
    diffs: { expiryDate: { from: '261200', to: '271200' } },
    owner: 'PharmaLedger',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  {
    __model: 'Audit',
    id: 'aud-006',
    userId: 'demerson.carvalho@pharmaledger.org',
    userGroup: 'write',
    model: 'batch',
    transaction: 'update',
    action: 'Add user',
    owner: 'PharmaLedger',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(12),
  },
  {
    __model: 'Audit',
    id: 'aud-007',
    userId: 'ana.silva@pharmaledger.org',
    userGroup: 'admin',
    model: 'leaflet',
    transaction: 'create',
    action: 'Create identity',
    owner: 'PharmaLedger',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    __model: 'Audit',
    id: 'aud-008',
    userId: 'marc.dupont@pharmaledger.org',
    userGroup: 'write',
    model: 'product',
    transaction: 'update',
    action: 'Authorize integration user',
    diffs: { nameMedicinalProduct: { from: 'Ibuprofen 200mg', to: 'Ibuprofen 400mg Film-Coated' } },
    owner: 'PharmaLedger',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
  {
    __model: 'Audit',
    id: 'aud-009',
    userId: 'sarah.chen@pharmaledger.org',
    userGroup: 'read',
    model: 'batch',
    transaction: 'read',
    action: 'Access wallet',
    owner: 'PharmaLedger',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    __model: 'Audit',
    id: 'aud-010',
    userId: 'james.gannon@pharmaledger.org',
    userGroup: 'admin',
    model: 'batch',
    transaction: 'update',
    action: 'Revoke integration user',
    diffs: { batchRecall: { from: false, to: true } },
    owner: 'PharmaLedger',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    __model: 'Audit',
    id: 'aud-011',
    userId: 'james.gannon@pharmaledger.org',
    userGroup: 'admin',
    model: 'product',
    transaction: 'create',
    action: 'Login wallet',
    owner: 'PharmaLedger',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    __model: 'Audit',
    id: 'aud-012',
    userId: 'ana.silva@pharmaledger.org',
    userGroup: 'write',
    model: 'leaflet',
    transaction: 'update',
    action: 'Add user',
    owner: 'PharmaLedger',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
];

// ─── Table lookup ──────────────────────────────────────────────────────────
const DEMO_TABLES: Record<string, any[]> = {
  product: DEMO_PRODUCTS,
  batch: DEMO_BATCHES,
  leaflet: DEMO_LEAFLETS,
  audit: DEMO_AUDIT,
};

/**
 * Extract the pathname from a URL (handles both full URLs and paths).
 */
function extractPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname;
  } catch {
    // Already a relative path
    return url;
  }
}

/**
 * Wrap records in a SerializedPage format expected by the decaf-ts Paginator.
 */
function toSerializedPage(records: any[]): any {
  return {
    data: records,
    total: 1,
    current: 1,
    count: records.length,
  };
}

/**
 * Intercept a request and return mock response data,
 * or null if the URL doesn't match any demo table.
 */
export function getDemoResponse(url: string, method: string): any | null {
  if (!url) return null;

  const pathname = extractPath(url);

  // Auth endpoint
  if (pathname.includes('auth/login')) {
    const demoToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(
        JSON.stringify({
          sub: 'demo-user-001',
          name: 'James Gannon',
          email: 'james@pharmaledger.org',
          preferred_username: 'james.gannon',
          given_name: 'James',
          family_name: 'Gannon',
          realm_access: { roles: ['admin', 'writer', 'reader'] },
          org: 'PharmaLedger Association',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400,
        })
      ) +
      '.demo-signature';
    return JSON.stringify({ token: demoToken });
  }

  // Parse pathname into segments
  const parts = pathname.replace(/^\/+/, '').split('/').filter(Boolean);
  if (parts.length === 0) return null;

  // Table name is the first segment
  const tableName = parts[0].toLowerCase();
  const records = DEMO_TABLES[tableName];
  if (!records) return null;

  // Detect statement/paginateBy pattern: /{table}/statement/paginateBy/...
  const isStatement = parts.includes('statement');
  const isPaginateBy = parts.includes('paginateBy');

  if (isStatement && isPaginateBy) {
    // Return SerializedPage format for paginateBy
    return toSerializedPage(records);
  }

  if (isStatement) {
    // Other statement types (findBy, listBy, etc.) - return as page too
    return toSerializedPage(records);
  }

  // Bulk read: /{table}/bulk
  if (parts.includes('bulk')) {
    return records;
  }

  // Single record read: /{table}/{id} (only when exactly 2 segments)
  if (method === 'GET' && parts.length === 2) {
    const id = decodeURIComponent(parts[1]);
    const pkField = tableName === 'product' ? 'productCode' : 'id';
    const record = records.find((r: any) => r[pkField] === id);
    return record || null;
  }

  // Plain GET list
  if (method === 'GET' && parts.length === 1) {
    return records;
  }

  // POST/PUT/PATCH — just return success
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    return { success: true };
  }

  // Default: return the records for any GET
  if (method === 'GET') {
    return records;
  }

  return null;
}
