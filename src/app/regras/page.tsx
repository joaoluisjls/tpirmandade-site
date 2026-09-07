import RegrasClient from "./RegrasClient";
import { getAnonClient } from "@/lib/supabase";

export default async function RegrasPage() {
  const supabase = getAnonClient();
  const { data: rules } = await supabase
    .from("rules")
    .select("id, title, content, category")
    .order("id", { ascending: true });

  return <RegrasClient initialRules={rules ?? []} />;
}
