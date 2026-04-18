const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Fetching circles...');
  const { data: circles, error } = await supabase.from('circles').select('id, name, slug');
  
  if (error) {
    console.error('Error fetching circles:', error);
    // If column doesn't exist, this will error. We can't add column via JS easily unless we use RPC.
    // Let's try to see if it errors.
  }
  
  console.log('Circles:', circles);
}

migrate();
