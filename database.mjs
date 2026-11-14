// Remote durable storage on Vercel, local SQLite during development.
export async function openDatabase() {
  if (process.env.TURSO_DATABASE_URL) {
    const url = new URL(process.env.TURSO_DATABASE_URL);
    if (!['libsql:', 'https:'].includes(url.protocol)) throw new Error('TURSO_DATABASE_URL must use libsql:// or https://');
    const { createClient } = await import('@libsql/client/web');
    const client = createClient({ url: url.href, authToken: process.env.TURSO_AUTH_TOKEN });
    return {
      async exec(sql) { for (const statement of sql.split(';').filter(s => s.trim())) await client.execute(statement); },
      prepare(sql) { return {
        async get(...args) { return (await client.execute({ sql, args })).rows[0]; },
        async all(...args) { return (await client.execute({ sql, args })).rows; },
        async run(...args) { return client.execute({ sql, args }); },
      }; },
    };
  }
  if (process.env.VERCEL) throw new Error('Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel project settings, then redeploy.');
  const { DatabaseSync } = await import('node:sqlite');
  const { mkdirSync } = await import('node:fs');
  mkdirSync('data', { recursive: true });
  return new DatabaseSync(process.env.DB_PATH || 'data/issa.sqlite');
}
