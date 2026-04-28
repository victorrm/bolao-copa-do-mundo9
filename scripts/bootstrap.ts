import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as schema from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? "./data/bolao.db";
  const sqlite = new Database(dbUrl);
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });

  const superadminEmail = process.env.SUPERADMIN_EMAIL?.toLowerCase().trim();
  if (!superadminEmail) {
    console.error("SUPERADMIN_EMAIL ausente");
    process.exit(1);
  }

  const now = Math.floor(Date.now() / 1000);

  const existing = db.select().from(schema.users).where(eq(schema.users.email, superadminEmail)).all();
  if (existing.length === 0) {
    const tempPassword = "bolao-" + nanoid(12);
    const hash = await hashPassword(tempPassword);
    db.insert(schema.users).values({
      id: nanoid(21),
      email: superadminEmail,
      role: "superadmin",
      passwordHash: hash,
      passwordMustChange: 1,
      consentLgpd: 1,
      consentLgpdAt: now,
      createdAt: now,
    }).run();
    console.log(`✓ superadmin criado: ${superadminEmail}`);
    console.log(`  senha temporária: ${tempPassword}`);
    console.log(`  → entre em /admin/login e troque na sequência`);
  } else {
    console.log(`• superadmin já existe: ${superadminEmail}`);
  }

  const domain = superadminEmail.split("@")[1];
  if (domain) {
    const existingDomain = db.select().from(schema.allowedDomains).where(eq(schema.allowedDomains.domain, domain)).all();
    if (existingDomain.length === 0) {
      db.insert(schema.allowedDomains).values({ domain, isWildcard: 0, createdAt: now }).run();
      console.log(`✓ domínio liberado: ${domain}`);
    }
  }

  sqlite.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
