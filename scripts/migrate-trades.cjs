const { Client } = require('pg');

const client = new Client({
  host: 'db.qjohjswvallpqkhlfkrl.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Money100$(0)00',
  ssl: { rejectUnauthorized: false }
});

const SQL = `
-- Add missing columns to trades table
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS direction text CHECK (direction IN ('long','short'));
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS stop_loss numeric(18,8);
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS take_profit numeric(18,8);
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS rating int2;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS status text DEFAULT 'open';
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS asset_class text;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS timeframe text;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS exit_time timestamptz;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS screenshots text[];
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS pnl_pct numeric(8,4);
`;

async function run() {
  await client.connect();
  console.log('Connected to database...');
  await client.query(SQL);
  console.log('✓ Added missing columns to trades table');

  // Show current columns
  const result = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trades'
    ORDER BY ordinal_position;
  `);
  console.log('\nCurrent trades columns:');
  result.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));

  console.log('\n✅ Migration complete!');
  await client.end();
}

run().catch(e => {
  console.error('❌ ERROR:', e.message);
  client.end();
});
