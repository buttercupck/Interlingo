import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updatePassword() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: bun run scripts/update-password.ts <email> <password>');
    process.exit(1);
  }

  try {
    // First, find the user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError.message);
      process.exit(1);
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      console.error('User not found:', email);
      process.exit(1);
    }

    // Update the user's password
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        password,
        email_confirm: true // Ensure email is confirmed
      }
    );

    if (error) {
      console.error('Error updating password:', error.message);
      process.exit(1);
    }

    console.log('Password updated successfully!');
    console.log('Email:', data.user.email);
    console.log('User ID:', data.user.id);
    console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('\nYou can now log in with the new password.');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

updatePassword();
