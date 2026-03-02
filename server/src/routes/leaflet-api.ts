import { Hono } from 'hono';
import { eq, and, isNull } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { product, batch, leaflet, productStrength, productMarket } from '../db/schema.js';

type DrizzleDb = NodePgDatabase;

// ─── Language name mapping ──────────────────────────────────────────────────
const LANG_NAMES: Record<string, { label: string; nativeName: string }> = {
  'en': { label: 'English', nativeName: 'English' },
  'de': { label: 'German', nativeName: 'Deutsch' },
  'fr': { label: 'French', nativeName: 'Français' },
  'pt-br': { label: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  'es': { label: 'Spanish', nativeName: 'Español' },
  'it': { label: 'Italian', nativeName: 'Italiano' },
};

// ─── Helper: flatten manufacturerAddress JSONB into address1-5 strings ──────
function flattenManufacturerAddress(addr: unknown): Record<string, string> {
  const result: Record<string, string> = {
    manufacturerAddress1: '',
    manufacturerAddress2: '',
    manufacturerAddress3: '',
    manufacturerAddress4: '',
    manufacturerAddress5: '',
  };
  if (!addr || typeof addr !== 'object') return result;
  const a = addr as Record<string, unknown>;
  if (a.manufacturerAddress1) result.manufacturerAddress1 = String(a.manufacturerAddress1);
  if (a.manufacturerAddress2) result.manufacturerAddress2 = String(a.manufacturerAddress2);
  if (a.manufacturerAddress3) result.manufacturerAddress3 = String(a.manufacturerAddress3);
  if (a.manufacturerAddress4) result.manufacturerAddress4 = String(a.manufacturerAddress4);
  if (a.manufacturerAddress5) result.manufacturerAddress5 = String(a.manufacturerAddress5);
  return result;
}

// ─── Helper: build product data response ────────────────────────────────────
async function buildProductData(db: DrizzleDb, gtin: string, batchNumber?: string) {
  // Query product
  const products = await db.select().from(product).where(eq(product.productCode, gtin)).limit(1);
  if (!products.length) return null;
  const prod = products[0];

  // Query batch (if requested)
  let batchData: Record<string, unknown> = {};
  if (batchNumber) {
    const batches = await db.select().from(batch).where(
      and(eq(batch.productCode, gtin), eq(batch.batchNumber, batchNumber))
    ).limit(1);
    if (batches.length) {
      const b = batches[0];
      const addrFields = flattenManufacturerAddress(b.manufacturerAddress);
      batchData = {
        productCode: b.productCode,
        batchNumber: b.batchNumber,
        epiProtocol: 'v1',
        lockId: '',
        expiryDate: b.expiryDate || '',
        batchRecall: b.batchRecall ?? false,
        packagingSiteName: b.packagingSiteName ?? null,
        importLicenseNumber: b.importLicenseNumber ?? null,
        manufacturerName: b.manufacturerName ?? null,
        dateOfManufacturing: b.dateOfManufacturing ?? null,
        ...addrFields,
      };
    }
  }

  // Query strengths
  const strengths = await db.select().from(productStrength).where(eq(productStrength.productCode, gtin));
  const strengthData = strengths.map((s) => ({
    uuid: s.uuid,
    productCode: s.productCode,
    strength: s.strength,
    substance: s.substance,
    legalEntityName: s.legalEntityName ?? null,
  }));

  // Query markets
  const markets = await db.select().from(productMarket).where(eq(productMarket.productCode, gtin));
  const marketData = markets.map((m) => ({
    marketId: m.marketId,
    nationalCode: m.nationalCode,
    mahName: m.mahName,
    legalEntityName: m.legalEntityName ?? null,
    mahAddress: m.mahAddress ?? null,
  }));

  return {
    productCode: prod.productCode,
    epiProtocol: 'v1',
    lockId: '',
    inventedName: prod.inventedName,
    nameMedicinalProduct: prod.nameMedicinalProduct,
    internalMaterialCode: prod.internalMaterialCode,
    productRecall: prod.productRecall ?? false,
    strengths: strengthData,
    markets: marketData,
    productPhoto: prod.imageData || '',
    batchData,
  };
}

// ─── Helper: build availableDocuments from leaflets ─────────────────────────
function buildAvailableDocuments(leaflets: Array<{ leafletType: string; lang: string }>) {
  const docs: Record<string, Record<string, Array<{ label: string; value: string; nativeName: string }>>> = {};

  for (const l of leaflets) {
    if (!docs[l.leafletType]) docs[l.leafletType] = {};
    if (!docs[l.leafletType][l.lang]) {
      const langInfo = LANG_NAMES[l.lang] || { label: l.lang, nativeName: l.lang };
      docs[l.leafletType][l.lang] = [{ label: langInfo.label, value: l.lang, nativeName: langInfo.nativeName }];
    }
  }

  return docs;
}

// ─── Helper: get base URL from request or env ───────────────────────────────
function getSelfUrl(c: { req: { header: (name: string) => string | undefined } }): string {
  if (process.env.SELF_URL) return process.env.SELF_URL;
  const proto = c.req.header('x-forwarded-proto') || 'http';
  const host = c.req.header('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

// ─── Route factory ──────────────────────────────────────────────────────────
export function createLeafletApiRoutes(db: DrizzleDb): Hono {
  const app = new Hono();

  // ── 1. GET /bdns ────────────────────────────────────────────────────────
  app.get('/bdns', (c) => {
    const selfUrl = getSelfUrl(c);
    return c.json({
      'local.epi': {
        anchoringServices: [selfUrl],
        brickStorages: [],
        replicas: [],
      },
    });
  });

  // ── 2. GET /gtinOwner/:domain/:gtin ─────────────────────────────────────
  app.get('/gtinOwner/:domain/:gtin', async (c) => {
    const gtin = c.req.param('gtin');
    const products = await db.select().from(product).where(eq(product.productCode, gtin)).limit(1);
    if (!products.length) {
      return c.json({ error: 'GTIN not found' }, 404);
    }
    return c.json({ domain: 'local.epi' });
  });

  // ── 3. GET /metadata/leaflet/:domain/:subdomain? ────────────────────────
  app.get('/metadata/leaflet/:domain/:subdomain?', async (c) => {
    const gtin = c.req.query('gtin');
    const batchParam = c.req.query('batch');

    if (!gtin) {
      return c.json({ error: 'gtin query parameter is required' }, 400);
    }

    const productData = await buildProductData(db, gtin, batchParam || undefined);
    if (!productData) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Query leaflets for this product
    const conditions = [eq(leaflet.productCode, gtin)];
    if (batchParam) {
      // Include both batch-specific and product-level leaflets
      const allLeaflets = await db.select().from(leaflet).where(eq(leaflet.productCode, gtin));
      const availableDocuments = buildAvailableDocuments(allLeaflets);
      return c.json({ productData, availableDocuments });
    }

    const allLeaflets = await db.select().from(leaflet).where(eq(leaflet.productCode, gtin));
    const availableDocuments = buildAvailableDocuments(allLeaflets);

    return c.json({ productData, availableDocuments });
  });

  // ── 4. GET /leaflets/:domain/:subdomain? ────────────────────────────────
  app.get('/leaflets/:domain/:subdomain?', async (c) => {
    const gtin = c.req.query('gtin');
    const lang = c.req.query('lang');
    const leafletType = c.req.query('leaflet_type');
    const batchNumber = c.req.query('batchNumber');
    const epiMarket = c.req.query('epiMarket');

    if (!gtin || !lang || !leafletType) {
      return c.json({ error: 'gtin, lang, and leaflet_type query parameters are required' }, 400);
    }

    // Build conditions for leaflet lookup
    const conditions = [
      eq(leaflet.productCode, gtin),
      eq(leaflet.lang, lang),
      eq(leaflet.leafletType, leafletType),
    ];

    if (batchNumber && batchNumber !== 'undefined') {
      conditions.push(eq(leaflet.batchNumber, batchNumber));
    }
    if (epiMarket && epiMarket !== 'unspecified') {
      conditions.push(eq(leaflet.epiMarket, epiMarket));
    }

    let found = await db.select().from(leaflet).where(and(...conditions)).limit(1);

    // If not found with batch, try product-level leaflet (batchNumber IS NULL)
    if (!found.length && batchNumber && batchNumber !== 'undefined') {
      const fallbackConditions = [
        eq(leaflet.productCode, gtin),
        eq(leaflet.lang, lang),
        eq(leaflet.leafletType, leafletType),
        isNull(leaflet.batchNumber),
      ];
      if (epiMarket && epiMarket !== 'unspecified') {
        fallbackConditions.push(eq(leaflet.epiMarket, epiMarket));
      }
      found = await db.select().from(leaflet).where(and(...fallbackConditions)).limit(1);
    }

    if (!found.length) {
      return c.json({ resultStatus: 'xml_not_found' }, 404);
    }

    // Build product data
    const productData = await buildProductData(db, gtin, batchNumber && batchNumber !== 'undefined' ? batchNumber : undefined);

    // Query all leaflets for this product to build available languages and types
    const allLeaflets = await db.select().from(leaflet).where(eq(leaflet.productCode, gtin));

    // Build availableLanguages (unique languages across all leaflet types)
    const langSet = new Set(allLeaflets.map((l) => l.lang));
    const availableLanguages = Array.from(langSet).map((l) => {
      const langInfo = LANG_NAMES[l] || { label: l, nativeName: l };
      return { label: langInfo.label, value: l, nativeName: langInfo.nativeName };
    });

    // Build availableTypes (unique leaflet types)
    const availableTypes = Array.from(new Set(allLeaflets.map((l) => l.leafletType)));

    return c.json({
      resultStatus: 'xml_found',
      xmlContent: found[0].xmlFileContent || '',
      leafletImages: {},
      productData: productData || {},
      availableLanguages,
      availableEpiMarkets: {},
      availableTypes,
    });
  });

  return app;
}
