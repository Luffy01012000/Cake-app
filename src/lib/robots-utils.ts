export interface RobotsConfigData {
  gptBotAllowed: boolean;
  perplexityBotAllowed: boolean;
  claudeBotAllowed: boolean;
  googleExtendedAllowed: boolean;
  ccBotAllowed: boolean;
  customRules?: string;
  sitemapUrl?: string;
}

export function formatRobotsTxt(
  config: RobotsConfigData,
  siteUrl: string = "https://aurapatisserie.com"
): string {
  const lines: string[] = [
    "# ====================================================",
    "# AURA Patisserie Dynamic Robots & AI Crawler Directives",
    "# ====================================================",
    "",
    "# Global Rules for General Web Crawlers",
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/*",
    "Disallow: /api/admin/*",
    "Disallow: /api/auth/*",
    "",
    "# AI & LLM Search Engine Directives",
    "# OpenAI GPTBot",
    "User-agent: GPTBot",
    config.gptBotAllowed ? "Allow: /" : "Disallow: /",
    "",
    "# Perplexity AI PerplexityBot",
    "User-agent: PerplexityBot",
    config.perplexityBotAllowed ? "Allow: /" : "Disallow: /",
    "",
    "# Anthropic ClaudeBot & Anthropic-AI",
    "User-agent: ClaudeBot",
    config.claudeBotAllowed ? "Allow: /" : "Disallow: /",
    "User-agent: anthropic-ai",
    config.claudeBotAllowed ? "Allow: /" : "Disallow: /",
    "",
    "# Google Gemini / Google-Extended",
    "User-agent: Google-Extended",
    config.googleExtendedAllowed ? "Allow: /" : "Disallow: /",
    "",
    "# Common Crawl CCBot",
    "User-agent: CCBot",
    config.ccBotAllowed ? "Allow: /" : "Disallow: /",
    "",
  ];

  if (config.customRules && config.customRules.trim()) {
    lines.push("# Custom Crawl Rules");
    lines.push(config.customRules.trim());
    lines.push("");
  }

  const sitemap = config.sitemapUrl
    ? config.sitemapUrl.startsWith("http")
      ? config.sitemapUrl
      : `${siteUrl.replace(/\/$/, "")}${config.sitemapUrl.startsWith("/") ? "" : "/"}${config.sitemapUrl}`
    : `${siteUrl.replace(/\/$/, "")}/sitemap.xml`;

  lines.push(`# Dynamic XML Sitemap`);
  lines.push(`Sitemap: ${sitemap}`);

  return lines.join("\n");
}
