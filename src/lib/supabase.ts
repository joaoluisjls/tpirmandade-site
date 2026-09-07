import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let anonInstance: SupabaseClient | null = null;
let serviceInstance: SupabaseClient | null = null;

export function getAnonClient(): SupabaseClient {
  if (!anonInstance) anonInstance = createClient(url, anonKey);
  return anonInstance;
}

export function getServiceClient(): SupabaseClient {
  if (!serviceInstance) serviceInstance = createClient(url, serviceKey);
  return serviceInstance;
}
