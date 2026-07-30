import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

function getClient() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required for Supabase email OTP");
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

export async function sendEmailOTP(email: string) {
  const { error } = await getClient().auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw new Error(`Supabase could not send the verification email: ${error.message}`);
}

export async function verifyEmailOTP(email: string, token: string) {
  const { data, error } = await getClient().auth.verifyOtp({ email, token, type: "email" });
  if (error || !data.user) throw new Error(error?.message || "Supabase email OTP verification failed");
  return data.user;
}
