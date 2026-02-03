import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: bun run scripts/create-user.ts <email> <password>');
    process.exit(1);
  }

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Skip email confirmation
    });

    if (error) {
      console.error('Error creating user:', error.message);
      process.exit(1);
    }

    console.log('User created successfully!');
    console.log('Email:', data.user?.email);
    console.log('User ID:', data.user?.id);
    console.log('\nYou can now log in with these credentials.');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

createUser();
