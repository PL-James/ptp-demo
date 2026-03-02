import { Hono } from 'hono';
import { SignJWT } from 'jose';

const auth = new Hono();

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'ptp-demo-secret-key-not-for-production');

auth.get('/auth/login', async (c) => {
  const token = await new SignJWT({
    sub: 'demo-user-001',
    name: 'James Gannon',
    email: 'james@pharmaledger.org',
    preferred_username: 'james.gannon',
    given_name: 'James',
    family_name: 'Gannon',
    realm_access: { roles: ['admin', 'writer', 'reader'] },
    resource_access: {
      'ptp-client': { roles: ['admin', 'writer', 'reader'] },
    },
    org: 'PharmaLedger Association',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return c.json({ token });
});

// Also handle POST for flexibility
auth.post('/auth/login', async (c) => {
  const token = await new SignJWT({
    sub: 'demo-user-001',
    name: 'James Gannon',
    email: 'james@pharmaledger.org',
    preferred_username: 'james.gannon',
    given_name: 'James',
    family_name: 'Gannon',
    realm_access: { roles: ['admin', 'writer', 'reader'] },
    resource_access: {
      'ptp-client': { roles: ['admin', 'writer', 'reader'] },
    },
    org: 'PharmaLedger Association',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return c.json({ token });
});

export default auth;
