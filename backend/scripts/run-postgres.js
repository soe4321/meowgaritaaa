const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');
const fs = require('fs');

async function start() {
  const dataDir = path.resolve(__dirname, '../.pgdata');
  console.log('[PostgreSQL] Initializing PostgreSQL cluster at:', dataDir);

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    port: 5432,
    user: 'postgres',
    password: 'password',
    persistent: true,
  });

  try {
    if (!fs.existsSync(dataDir)) {
      console.log('[PostgreSQL] Initialising cluster for the first time...');
      await pg.initialise();
    }
    console.log('[PostgreSQL] Starting PostgreSQL server on port 5432...');
    await pg.start();
    console.log('[PostgreSQL] Server started successfully!');

    try {
      console.log('[PostgreSQL] Creating database campus_od_db...');
      await pg.createDatabase('campus_od_db');
      console.log('[PostgreSQL] Database campus_od_db created/ready!');
    } catch (e) {
      console.log('[PostgreSQL] Database note:', e.message);
    }

    console.log('[PostgreSQL] PostgreSQL is running and ready for connections on port 5432!');
  } catch (err) {
    console.error('[PostgreSQL] Error starting PostgreSQL:', err);
    process.exit(1);
  }

  // Handle graceful exit
  process.on('SIGINT', async () => {
    console.log('\n[PostgreSQL] Stopping PostgreSQL server...');
    await pg.stop();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await pg.stop();
    process.exit(0);
  });
}

start();
