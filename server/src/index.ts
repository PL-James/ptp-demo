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
    await client.query(`
      CREATE TABLE IF NOT EXISTS product (
        "productCode" TEXT PRIMARY KEY,
        "inventedName" TEXT,
        "nameMedicinalProduct" TEXT,
        "internalMaterialCode" TEXT,
        "productRecall" BOOLEAN DEFAULT false,
        "createdAt" TEXT,
        "updatedAt" TEXT,
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
      CREATE TABLE IF NOT EXISTS batch (
        id TEXT PRIMARY KEY,
        "productCode" TEXT,
        "batchNumber" TEXT,
        "expiryDate" TEXT,
        "manufacturerName" TEXT,
        "batchRecall" BOOLEAN DEFAULT false,
        "createdAt" TEXT,
        "updatedAt" TEXT,
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
      CREATE TABLE IF NOT EXISTS leaflet (
        id TEXT PRIMARY KEY,
        "productCode" TEXT,
        "batchNumber" TEXT,
        "leafletType" TEXT,
        lang TEXT,
        "epiMarket" TEXT,
        "xmlFileContent" TEXT,
        "createdAt" TEXT,
        "updatedAt" TEXT,
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
        diffs TEXT,
        "createdAt" TEXT,
        "updatedAt" TEXT,
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
      CREATE TABLE IF NOT EXISTS product_strength (
        id SERIAL PRIMARY KEY,
        "productCode" TEXT,
        strength TEXT,
        substance TEXT,
        "createdAt" TEXT,
        "updatedAt" TEXT,
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
      CREATE TABLE IF NOT EXISTS product_market (
        id SERIAL PRIMARY KEY,
        "productCode" TEXT,
        "marketId" TEXT,
        "nationalCode" TEXT,
        "mahName" TEXT,
        "createdAt" TEXT,
        "updatedAt" TEXT,
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
      CREATE TABLE IF NOT EXISTS product_image (
        id SERIAL PRIMARY KEY,
        "productCode" TEXT,
        content TEXT,
        "createdAt" TEXT,
        "updatedAt" TEXT,
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "version" INTEGER DEFAULT 1,
        "owner" TEXT
      );
      CREATE TABLE IF NOT EXISTS leaflet_file (
        id SERIAL PRIMARY KEY,
        "leafletId" TEXT,
        content TEXT,
        filename TEXT,
        "createdAt" TEXT,
        "updatedAt" TEXT,
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
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
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
