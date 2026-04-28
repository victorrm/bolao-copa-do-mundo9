import { db, schema } from "@/lib/db";
import { inArray } from "drizzle-orm";

export async function DynamicBranding() {
  const rows = await db
    .select()
    .from(schema.settings)
    .where(inArray(schema.settings.key, ["primary_color", "secondary_color", "accent_color"]));
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const css: string[] = [];
  if (map.primary_color) css.push(`--brand-primary: ${map.primary_color};`);
  if (map.secondary_color) css.push(`--brand-secondary: ${map.secondary_color};`);
  if (map.accent_color) css.push(`--brand-accent: ${map.accent_color};`);

  if (css.length === 0) return null;

  return <style>{`:root { ${css.join(" ")} }`}</style>;
}
