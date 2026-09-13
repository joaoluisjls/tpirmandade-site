import RegrasClient from "./RegrasClient";
import { sql } from "@/lib/db";

export const revalidate = 60;

export default async function RegrasPage() {
  const { rows: rules } = await sql`SELECT id, title, content, category FROM rules ORDER BY id ASC LIMIT 50`;

  return <RegrasClient initialRules={(rules as any[]) ?? []} />;
}
