import { Hono } from 'hono';
import { eq, sql, and, SQL, asc, desc } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { tableRegistry, primaryKeyMap } from '../db/schema.js';

type DrizzleDb = NodePgDatabase;

function resolveTable(tableName: string): { table: PgTable; pkField: string } | null {
  const key = tableName.toLowerCase().replace(/[-_]/g, '');
  // Try exact match first, then normalized
  const table = tableRegistry[tableName.toLowerCase()] || tableRegistry[key];
  const pkField = primaryKeyMap[tableName.toLowerCase()] || primaryKeyMap[key] || 'id';
  if (!table) return null;
  return { table, pkField };
}

function getTableColumns(table: PgTable): Record<string, any> {
  return (table as any)[Symbol.for('drizzle:Columns')] || {};
}

function stripMetaFields(body: Record<string, any>): Record<string, any> {
  const { __model, __anchor, ...rest } = body;
  return rest;
}

function buildInsertData(body: Record<string, any>, columns: Record<string, any>): Record<string, any> {
  const data = stripMetaFields(body);
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    // Only include fields that exist as columns in the table
    if (key in columns) {
      result[key] = value;
    }
  }
  // Auto-set timestamps
  const now = new Date();
  if ('createdAt' in columns && !result.createdAt) result.createdAt = now;
  if ('updatedAt' in columns) result.updatedAt = now;
  if ('version' in columns && !result.version) result.version = 1;
  return result;
}

export function createCrudRoutes(db: DrizzleDb): Hono {
  const app = new Hono();

  // ─── Paginated list: GET /:table/statement/pageBy ──────────────────────
  // Also handle paginateBy variant
  app.get('/:table/statement/:stmtType', async (c) => {
    const tableName = c.req.param('table');
    const stmtType = c.req.param('stmtType');
    const resolved = resolveTable(tableName);
    if (!resolved) return c.json({ error: `Unknown table: ${tableName}` }, 404);

    const { table } = resolved;
    const page = parseInt(c.req.query('page') || '0');
    const size = parseInt(c.req.query('size') || '25');
    const offset = Math.max(0, page * size);

    // Count total
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(table);
    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / size);

    // Fetch page
    const data = await db.select().from(table).limit(size).offset(offset);

    // Add __model to each record
    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const enriched = data.map((row: any) => ({ __model: modelName, ...row }));

    return c.json({
      data: enriched,
      total: totalPages,
      current: page,
      count: total,
    });
  });

  // ─── Catch deeper statement paths: GET /:table/statement/paginateBy/:sortField ───
  app.get('/:table/statement/:stmtType/*', async (c) => {
    const tableName = c.req.param('table');
    const resolved = resolveTable(tableName);
    if (!resolved) return c.json({ error: `Unknown table: ${tableName}` }, 404);

    const { table } = resolved;
    const columns = getTableColumns(table);
    const limit = parseInt(c.req.query('limit') || '25');
    const offsetParam = parseInt(c.req.query('offset') || '1');
    const direction = c.req.query('direction') || 'asc';
    // offset is 1-based page number from Decaf framework
    const sqlOffset = Math.max(0, (offsetParam - 1) * limit);

    // Extract sort field from the wildcard path segment
    const urlPath = c.req.path;
    const pathParts = urlPath.split('/statement/')[1]?.split('/') || [];
    const sortField = pathParts[1]?.replace(/\/$/, '') || '';

    // Build query with sorting
    const sortCol = sortField && columns[sortField] ? columns[sortField] : null;
    const orderBy = sortCol
      ? (direction === 'desc' ? desc(sortCol) : asc(sortCol))
      : undefined;

    // Count total
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(table);
    const total = Number(countResult[0]?.count || 0);

    // Fetch page with sort and pagination
    let query = db.select().from(table);
    if (orderBy) query = query.orderBy(orderBy) as any;
    const data = await query.limit(limit).offset(sqlOffset);

    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const enriched = data.map((row: any) => ({ __model: modelName, ...row }));

    return c.json({
      data: enriched,
      total: Math.ceil(total / limit),
      current: offsetParam,
      count: total,
    });
  });

  // ─── Find by field: GET /:table/findBy/:field/:value ───────────────────
  app.get('/:table/findBy/:field/:value', async (c) => {
    const tableName = c.req.param('table');
    const field = c.req.param('field');
    const value = decodeURIComponent(c.req.param('value'));
    const resolved = resolveTable(tableName);
    if (!resolved) return c.json({ error: `Unknown table: ${tableName}` }, 404);

    const { table } = resolved;
    const columns = getTableColumns(table);
    const col = columns[field];
    if (!col) return c.json({ error: `Unknown field: ${field}` }, 400);

    const direction = c.req.query('direction') || 'asc';
    const sortOrder = direction === 'desc' ? desc(col) : asc(col);

    const data = await db.select().from(table).where(eq(col, value)).orderBy(sortOrder);
    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    return c.json(data.map((row: any) => ({ __model: modelName, ...row })));
  });

  // ─── Bulk read: GET /:table/bulk ───────────────────────────────────────
  app.get('/:table/bulk', async (c) => {
    const tableName = c.req.param('table');
    const resolved = resolveTable(tableName);
    if (!resolved) return c.json({ error: `Unknown table: ${tableName}` }, 404);

    const { table } = resolved;
    const data = await db.select().from(table);
    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    return c.json(data.map((row: any) => ({ __model: modelName, ...row })));
  });

  // ─── Read single: GET /:table/:id ──────────────────────────────────────
  app.get('/:table/:id', async (c) => {
    const tableName = c.req.param('table');
    const id = decodeURIComponent(c.req.param('id'));
    const resolved = resolveTable(tableName);
    if (!resolved) return c.json({ error: `Unknown table: ${tableName}` }, 404);

    const { table, pkField } = resolved;
    const columns = getTableColumns(table);
    const pkCol = columns[pkField];
    if (!pkCol) return c.json({ error: `Primary key ${pkField} not found` }, 500);

    const data = await db.select().from(table).where(eq(pkCol, id));
    if (!data.length) return c.json({ error: 'Not found' }, 404);

    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    return c.json({ __model: modelName, ...data[0] });
  });

  // ─── List all / filtered: GET /:table ──────────────────────────────────
  app.get('/:table', async (c) => {
    const tableName = c.req.param('table');
    const resolved = resolveTable(tableName);
    if (!resolved) return c.json({ error: `Unknown table: ${tableName}` }, 404);

    const { table } = resolved;
    const columns = getTableColumns(table);

    // Build filters from query params
    const filters: SQL[] = [];
    for (const [key, value] of Object.entries(c.req.query())) {
      if (key in columns && value !== undefined) {
        filters.push(eq(columns[key], value));
      }
    }

    const data = filters.length
      ? await db.select().from(table).where(and(...filters))
      : await db.select().from(table);

    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    return c.json(data.map((row: any) => ({ __model: modelName, ...row })));
  });

  // ─── Create: POST /:table ─────────────────────────────────────────────
  app.post('/:table', async (c) => {
    const tableName = c.req.param('table');
    const resolved = resolveTable(tableName);
    if (!resolved) return c.json({ error: `Unknown table: ${tableName}` }, 404);

    const { table } = resolved;
    const columns = getTableColumns(table);
    const body = await c.req.json();
    const insertData = buildInsertData(body, columns);

    const result = await db.insert(table).values(insertData).returning();
    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    return c.json({ __model: modelName, ...result[0] });
  });

  // ─── Update: PUT /:table/:id ──────────────────────────────────────────
  app.put('/:table/:id', async (c) => {
    const tableName = c.req.param('table');
    const id = decodeURIComponent(c.req.param('id'));
    const resolved = resolveTable(tableName);
    if (!resolved) return c.json({ error: `Unknown table: ${tableName}` }, 404);

    const { table, pkField } = resolved;
    const columns = getTableColumns(table);
    const pkCol = columns[pkField];
    if (!pkCol) return c.json({ error: `Primary key ${pkField} not found` }, 500);

    const body = await c.req.json();
    const updateData = stripMetaFields(body);

    // Filter to valid columns and update timestamp
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (key in columns && key !== pkField) {
        filtered[key] = value;
      }
    }
    filtered.updatedAt = new Date();
    if ('version' in columns) {
      filtered.version = sql`${columns.version} + 1`;
    }

    const result = await db.update(table).set(filtered).where(eq(pkCol, id)).returning();
    if (!result.length) return c.json({ error: 'Not found' }, 404);

    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    return c.json({ __model: modelName, ...result[0] });
  });

  // ─── Delete: DELETE /:table/:id ────────────────────────────────────────
  app.delete('/:table/:id', async (c) => {
    const tableName = c.req.param('table');
    const id = decodeURIComponent(c.req.param('id'));
    const resolved = resolveTable(tableName);
    if (!resolved) return c.json({ error: `Unknown table: ${tableName}` }, 404);

    const { table, pkField } = resolved;
    const columns = getTableColumns(table);
    const pkCol = columns[pkField];
    if (!pkCol) return c.json({ error: `Primary key ${pkField} not found` }, 500);

    const result = await db.delete(table).where(eq(pkCol, id)).returning();
    if (!result.length) return c.json({ error: 'Not found' }, 404);

    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    return c.json({ __model: modelName, ...result[0] });
  });

  return app;
}
