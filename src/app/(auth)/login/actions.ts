"use server";

import { db, schema } from "@/lib/db";
import { isEmailDomainAllowed } from "@/lib/auth/domains";
import { generateMagicLinkToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/send";
import { loadBranding } from "@/lib/email/branding";
import { magicLinkEmail } from "@/lib/email/templates";
import { getMessages } from "@/lib/i18n";
import { sql } from "drizzle-orm";
const RATE_LIMIT_PER_EMAIL = 5;
const RATE_WINDOW_SECONDS = 60 * 60;
const MAGIC_TTL_SECONDS = 60 * 15;

export async function requestMagicLink(email: string): Promise<{ message: string }> {
  const m = await getMessages();
  const generic = m.login.genericMessage;

  email = email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { message: generic };
  }

  const allowed = await isEmailDomainAllowed(email);
  if (!allowed) return { message: generic };

  const since = Math.floor(Date.now() / 1000) - RATE_WINDOW_SECONDS;
  const recent = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.magicLinks)
    .where(sql`${schema.magicLinks.email} = ${email} and ${schema.magicLinks.expiresAt} > ${since}`);
  if ((recent[0]?.count ?? 0) >= RATE_LIMIT_PER_EMAIL) {
    return { message: generic };
  }

  const { token, tokenHash } = generateMagicLinkToken();
  const expiresAt = Math.floor(Date.now() / 1000) + MAGIC_TTL_SECONDS;
  await db.insert(schema.magicLinks).values({ tokenHash, email, expiresAt });

  const url = `${process.env.APP_URL ?? "http://localhost:3000"}/verify?token=${token}`;
  const branding = await loadBranding();
  const tpl = magicLinkEmail(branding, url);
  await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });

  return { message: generic };
}
