import RegrasClient from "./RegrasClient";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function RegrasPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: rules, error } = await supabase
    .from("rules")
    .select("id, title, content, category")
    .order("id", { ascending: true });

  if (error) console.error("RegrasPage error:", error.message);

  return <RegrasClient initialRules={rules ?? []} />;
}
