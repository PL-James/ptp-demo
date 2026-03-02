import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import auth from './routes/auth.js';
import { createCrudRoutes } from './routes/crud.js';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// Auto-migrate: create tables if they don't exist
async function autoMigrate() {
  const client = await pool.connect();
  try {
    // Check if schema needs recreation (missing columns from initial bad migration)
    const { rows: cols } = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'imageData'`
    );
    if (cols.length === 0) {
      console.log('Schema mismatch detected, recreating tables...');
      await client.query(`
        DROP TABLE IF EXISTS leaflet_file CASCADE;
        DROP TABLE IF EXISTS product_image CASCADE;
        DROP TABLE IF EXISTS product_market CASCADE;
        DROP TABLE IF EXISTS product_strength CASCADE;
        DROP TABLE IF EXISTS audit CASCADE;
        DROP TABLE IF EXISTS leaflet CASCADE;
        DROP TABLE IF EXISTS batch CASCADE;
        DROP TABLE IF EXISTS product CASCADE;
      `);
    }
    await client.query(`
      CREATE TABLE IF NOT EXISTS product (
        "productCode" TEXT PRIMARY KEY,
        "inventedName" TEXT NOT NULL,
        "nameMedicinalProduct" TEXT,
        "internalMaterialCode" TEXT,
        "productRecall" BOOLEAN DEFAULT false,
        "imageData" TEXT,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
      CREATE TABLE IF NOT EXISTS batch (
        id TEXT PRIMARY KEY,
        "productCode" TEXT NOT NULL,
        "batchNumber" TEXT NOT NULL,
        "expiryDate" TEXT,
        "importLicenseNumber" TEXT,
        "dateOfManufacturing" TEXT,
        "manufacturerName" TEXT,
        "manufacturerAddress" JSONB,
        "packagingSiteName" TEXT,
        "batchRecall" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
      CREATE TABLE IF NOT EXISTS leaflet (
        id TEXT PRIMARY KEY,
        "productCode" TEXT NOT NULL,
        "batchNumber" TEXT,
        "leafletType" TEXT NOT NULL,
        lang TEXT NOT NULL,
        "epiMarket" TEXT,
        "xmlFileContent" TEXT,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
      CREATE TABLE IF NOT EXISTS audit (
        id TEXT PRIMARY KEY,
        "userId" TEXT,
        "userGroup" TEXT,
        model TEXT,
        transaction TEXT,
        action TEXT,
        diffs JSONB,
        "owner" TEXT,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "version" INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS product_strength (
        id SERIAL PRIMARY KEY,
        uuid TEXT,
        "productCode" TEXT NOT NULL,
        strength TEXT,
        substance TEXT,
        "legalEntityName" TEXT,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
      CREATE TABLE IF NOT EXISTS product_market (
        id SERIAL PRIMARY KEY,
        "marketId" TEXT,
        "productCode" TEXT NOT NULL,
        "nationalCode" TEXT,
        "mahName" TEXT,
        "legalEntityName" TEXT,
        "mahAddress" TEXT,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
      CREATE TABLE IF NOT EXISTS product_image (
        id SERIAL PRIMARY KEY,
        "productCode" TEXT NOT NULL,
        content TEXT,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
      CREATE TABLE IF NOT EXISTS leaflet_file (
        id SERIAL PRIMARY KEY,
        "leafletId" TEXT NOT NULL,
        content TEXT,
        filename TEXT,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
    `);
    console.log('Database tables ensured');

    // Auto-seed if product table is empty
    const { rows } = await client.query('SELECT COUNT(*) FROM product');
    if (parseInt(rows[0].count) === 0) {
      console.log('Empty database detected, running seed...');
      const { seed } = await import('./db/seed.js');
      await seed(db);
      console.log('Seed complete');
    }
  } finally {
    client.release();
  }
}

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: (origin) => origin || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  credentials: true,
}));
app.use('*', logger());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Auth routes
app.route('/', auth);

// SSE events endpoint (stub for Decaf event listener)
app.get('/demo-events', (c) => {
  return c.text('data: {"type":"connected"}\n\n', 200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
});

app.get('/events', (c) => {
  return c.text('data: {"type":"connected"}\n\n', 200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
});

// CRUD routes for all tables
app.route('/', createCrudRoutes(db));

const port = parseInt(process.env.PORT || '3000');
console.log(`PTP Demo Server starting on port ${port}`);

autoMigrate()
  .then(() => {
    serve({ fetch: app.fetch, port }, (info) => {
      console.log(`Server running at http://localhost:${info.port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
