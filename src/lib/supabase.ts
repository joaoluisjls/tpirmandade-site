import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function getAnonClient(): SupabaseClient {
  return createClient(url, anonKey);
}

export function getServiceClient(): SupabaseClient {
  return createClient(url, serviceKey);
}
