const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envFile = process.env.CONTEXT ? `.env.${process.env.CONTEXT}` : '.env.local';

dotenv.config({ path: '../.env', override: true });
dotenv.config({ path: `../${envFile}`, override: true });
dotenv.config({ path: '../.env.secret' });

const sample = fs.readFileSync(path.join(__dirname, '../src/assets/env.sample.js'), 'utf8');
const env = path.join(__dirname, '../src/assets/env.js');

const content = sample.replace(/\$\{([A-Z0-9_]+)\}/g, (match, varName) => {
  const value = process.env[varName];
  if (envFile.includes('local') || envFile.includes('demo')) {
    if (varName.includes('KEYCLOAK')) {
      return '';
    }
  }
  return value ? (/\$/.test(value) ? '' : value) : match;
});

fs.writeFileSync(env, content);
