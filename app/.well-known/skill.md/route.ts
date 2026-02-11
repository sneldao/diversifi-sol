import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

let cachedContent: string | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60_000;

/**
 * RFC 8615 compliant skill.md endpoint for agent discovery.
 * Returns DiversiFi's capabilities and API endpoints.
 */
export async function GET() {
  const now = Date.now();

  if (!cachedContent || now - cachedAt > CACHE_TTL_MS) {
    const filePath = path.join(process.cwd(), "app", ".well-known", "skill.md", "skill-content.md");
    cachedContent = await fs.readFile(filePath, "utf-8");
    cachedAt = now;
  }

  return new NextResponse(cachedContent, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      "X-Agent-Capable": "true",
    },
  });
}
