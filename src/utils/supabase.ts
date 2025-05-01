import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Ensure the variables are not empty strings before creating the client
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Check your .env.local file.');
  // Optionally throw an error or handle this case appropriately
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// //Ensuring Supabase Client is Available // <- Commented out section seems redundant
//
//Make sure you have the Supabase client utility set up:
//```typescript
//import { createClient } from '@supabase/supabase-js';

//const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
//const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

//export const supabase = createClient(supabaseUrl, supabaseAnonKey);