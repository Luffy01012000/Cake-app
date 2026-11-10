import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getDatabaseStatus,
  getAllCakes,
  getAllPagesSeo,
  getRobotsConfig,
} from "@/lib/data-service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [dbStatus, cakes, pages, robots] = await Promise.all([
    getDatabaseStatus(),
    getAllCakes(),
    getAllPagesSeo(),
    getRobotsConfig(),
  ]);

  const totalFaqs =
    cakes.reduce((sum, c) => sum + (c.faqs?.length || 0), 0) +
    pages.reduce((sum, p) => sum + (p.faqs?.length || 0), 0);

  const missingAltCount = cakes.filter((c) => !c.imageAlt || c.imageAlt.length < 5).length;
  const missingMetaDescCount = cakes.filter(
    (c) => !c.metaDescription || c.metaDescription.length < 50
  ).length;

  return NextResponse.json({
    dbStatus,
    stats: {
      cakesCount: cakes.length,
      pagesCount: pages.length,
      faqsCount: totalFaqs,
      missingAltCount,
      missingMetaDescCount,
      aiCrawlersAllowed: [
        robots.gptBotAllowed && "GPTBot",
        robots.perplexityBotAllowed && "PerplexityBot",
        robots.claudeBotAllowed && "ClaudeBot",
        robots.googleExtendedAllowed && "Google-Extended",
        robots.ccBotAllowed && "CCBot",
      ].filter(Boolean),
    },
  });
}
