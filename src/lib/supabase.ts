import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let _anon: SupabaseClient | null = null;
let _service: SupabaseClient | null = null;

export function getAnonClient(): SupabaseClient {
  if (!_anon) _anon = createClient(url, anonKey);
  return _anon;
}

export function getServiceClient(): SupabaseClient {
  if (!_service) _service = createClient(url, serviceKey);
  return _service;
}
