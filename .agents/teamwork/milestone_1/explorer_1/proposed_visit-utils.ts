/**
 * User-Agent Classification & Bot Detection Utility
 *
 * Categorizes incoming HTTP request User-Agent strings into:
 * - BROWSER: Standard web browsers used by human visitors (Chrome, Safari, Firefox, Edge, Opera, Mobile variants)
 * - AI_CRAWLER: Generative AI and LLM training / search crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)
 * - SEARCH_BOT: Major search engine indexers (Googlebot, Bingbot, Baiduspider, DuckDuckBot, etc.)
 * - SCRAPER_TOOL: Automated tools, headless browsers, CLI utilities, and scrapers (curl, python-requests, HeadlessChrome, Lighthouse, etc.)
 */

export type UAClassificationCategory =
  | "BROWSER"
  | "AI_CRAWLER"
  | "SEARCH_BOT"
  | "SCRAPER_TOOL";

export interface UAClassification {
  isBot: boolean;
  botName?: string;
  category: UAClassificationCategory;
}

export interface BotSignature {
  name: string;
  regex: RegExp;
  category: "AI_CRAWLER" | "SEARCH_BOT" | "SCRAPER_TOOL";
}

/**
 * 1. AI Crawlers (OpenAI, Anthropic, Google Extended, Perplexity, Common Crawl, ByteDance, etc.)
 */
export const AI_CRAWLER_BOTS: ReadonlyArray<{ name: string; regex: RegExp }> = [
  { name: "GPTBot", regex: /\bgptbot\b/i },
  { name: "ChatGPT-User", regex: /\bchatgpt-user\b/i },
  { name: "PerplexityBot", regex: /\bperplexitybot\b/i },
  { name: "ClaudeBot", regex: /\b(?:claudebot|anthropic-ai)\b/i },
  { name: "Claude-Web", regex: /\bclaude-web\b/i },
  { name: "Google-Extended", regex: /\bgoogle-extended\b/i },
  { name: "CCBot", regex: /\bccbot\b/i },
  { name: "Applebot-Extended", regex: /\bapplebot-extended\b/i },
  { name: "Bytespider", regex: /\bbytespider\b/i },
  { name: "Diffbot", regex: /\bdiffbot\b/i },
  { name: "ImagesiftBot", regex: /\bimagesiftbot\b/i },
  { name: "Cohere-ai", regex: /\bcohere-ai\b/i },
  { name: "OAI-SearchBot", regex: /\boai-searchbot\b/i },
  { name: "Meta-ExternalAgent", regex: /\bmeta-external(?:agent|fetcher)\b/i },
];

/**
 * 2. Search Engine Indexing Bots (Google, Bing, Yahoo/Slurp, DuckDuckGo, Baidu, Yandex, Sogou, Apple, etc.)
 */
export const SEARCH_ENGINE_BOTS: ReadonlyArray<{ name: string; regex: RegExp }> = [
  { name: "Googlebot", regex: /\bgooglebot(?:-(?:image|news|video|mobile))?\b/i },
  { name: "Bingbot", regex: /\b(?:bingbot|msnbot|bingpreview)\b/i },
  { name: "Slurp", regex: /\b(?:yahoo!?\s*slurp|slurp)\b/i },
  { name: "DuckDuckBot", regex: /\bduckduck(?:bot|go)\b/i },
  { name: "Baiduspider", regex: /\bbaiduspider(?:-[a-z0-9_-]+)?\b/i },
  { name: "YandexBot", regex: /\byandex(?:bot|mobilebot|images|video|metrika)?\b/i },
  { name: "Sogou", regex: /\bsogou(?:\s*web\s*spider|\s*pic\s*spider|spider|head)?\b/i },
  { name: "Applebot", regex: /\bapplebot\b/i },
  { name: "Twitterbot", regex: /\btwitterbot\b/i },
  { name: "FacebookBot", regex: /\b(?:facebookexternalhit|facebot)\b/i },
  { name: "LinkedInBot", regex: /\b(?:linkedincrawler|linkedinbot)\b/i },
  { name: "Pinterestbot", regex: /\bpinterest(?:bot)?\b/i },
  { name: "Qwantify", regex: /\bqwantify\b/i },
];

/**
 * 3. Scrapers, CLI Tools & Headless Automations
 */
export const SCRAPER_TOOLS: ReadonlyArray<{ name: string; regex: RegExp }> = [
  { name: "curl", regex: /\bcurl\b/i },
  { name: "Wget", regex: /\bwget\b/i },
  { name: "python-requests", regex: /\b(?:python-requests|requests)(?:\/|\b)/i },
  { name: "Scrapy", regex: /\bscrapy\b/i },
  { name: "HeadlessChrome", regex: /\bheadlesschrome\b/i },
  { name: "Lighthouse", regex: /\b(?:chrome-lighthouse|lighthouse)\b/i },
  { name: "PostmanRuntime", regex: /\bpostmanruntime\b/i },
  { name: "axios", regex: /\baxios\b/i },
  { name: "aiohttp", regex: /\baiohttp\b/i },
  { name: "httpx", regex: /\bhttpx\b/i },
  { name: "Go-http-client", regex: /\bgo-http-client\b/i },
  { name: "node-fetch", regex: /\bnode-fetch\b/i },
  { name: "undici", regex: /\bundici\b/i },
  { name: "Puppeteer", regex: /\bpuppeteer\b/i },
  { name: "Playwright", regex: /\bplaywright\b/i },
  { name: "Selenium", regex: /\b(?:selenium|webdriver)\b/i },
  { name: "PhantomJS", regex: /\bphantomjs\b/i },
  { name: "Java-HttpClient", regex: /\b(?:java|apache-httpclient)\b/i },
];

/**
 * Generic bot matcher for unlisted bots/spiders, guarding against false-positive
 * substring collisions like "CUBOT" (Android phone), "talbot", "turbot", "robotics", "bottom", "bottleneck".
 */
const GENERIC_BOT_REGEX =
  /\b(?!(?:cu|tal|cha|tur|ab|sa)bot\b)([a-zA-Z0-9_-]+bot|[a-zA-Z0-9_-]*crawler|[a-zA-Z0-9_-]*spider)\b|\b(?:scrape|scraper|spiderbot|webbot)\b/i;

/**
 * Browser signature check verifying typical browser family markers.
 */
function isBrowserSignature(ua: string): boolean {
  // Check for common browser family identifiers
  const hasBrowserEngine =
    /mozilla\/5\.0/i.test(ua) ||
    /firefox\/|chrome\/|safari\//i.test(ua);

  if (!hasBrowserEngine) {
    return false;
  }

  // Ensure it has at least one valid interactive browser marker
  return (
    /chrome|crios/i.test(ua) ||
    /safari/i.test(ua) ||
    /firefox|fxios/i.test(ua) ||
    /edg|edge|edga|edgios/i.test(ua) ||
    /opr|opera/i.test(ua) ||
    /mobile|android|iphone|ipad/i.test(ua)
  );
}

/**
 * Classifies an incoming User-Agent string.
 *
 * Evaluation order:
 * 1. AI Crawlers (e.g. GPTBot, PerplexityBot, Applebot-Extended)
 * 2. Search Bots (e.g. Googlebot, Bingbot, Applebot)
 * 3. Scrapers & Automated Tools (e.g. HeadlessChrome, Chrome-Lighthouse, curl, python-requests)
 * 4. Generic Bot Heuristic (excluding benign false-positive device names like CUBOT)
 * 5. Interactive Web Browsers (Chrome, Safari, Firefox, Edge, Opera, Mobile)
 * 6. Fallback (missing, empty, or unrecognized non-browser UAs default to SCRAPER_TOOL)
 *
 * @param ua User-Agent header value or null/undefined
 * @returns UAClassification
 */
export function classifyUserAgent(ua: string | null | undefined): UAClassification {
  if (!ua || typeof ua !== "string" || !ua.trim()) {
    return {
      isBot: true,
      category: "SCRAPER_TOOL",
    };
  }

  const cleanUa = ua.trim();

  // 1. Check AI Crawlers first (Applebot-Extended must be checked before search Applebot)
  for (const bot of AI_CRAWLER_BOTS) {
    if (bot.regex.test(cleanUa)) {
      return {
        isBot: true,
        botName: bot.name,
        category: "AI_CRAWLER",
      };
    }
  }

  // 2. Check Search Engine Bots
  for (const bot of SEARCH_ENGINE_BOTS) {
    if (bot.regex.test(cleanUa)) {
      return {
        isBot: true,
        botName: bot.name,
        category: "SEARCH_BOT",
      };
    }
  }

  // 3. Check Scraper Tools & Headless Automations (must precede normal browser check
  //    because Chrome-Lighthouse and HeadlessChrome contain Chrome/Safari strings)
  for (const tool of SCRAPER_TOOLS) {
    if (tool.regex.test(cleanUa)) {
      return {
        isBot: true,
        botName: tool.name,
        category: "SCRAPER_TOOL",
      };
    }
  }

  // 4. Check Generic Bot patterns (safeguarded against benign tokens like CUBOT)
  const genericMatch = cleanUa.match(GENERIC_BOT_REGEX);
  if (genericMatch) {
    return {
      isBot: true,
      botName: genericMatch[1] || "Unknown Bot",
      category: "SCRAPER_TOOL",
    };
  }

  // 5. Check Interactive Browsers
  if (isBrowserSignature(cleanUa)) {
    return {
      isBot: false,
      category: "BROWSER",
    };
  }

  // 6. Non-browser unclassified client (e.g. custom scripts, raw sockets)
  return {
    isBot: true,
    category: "SCRAPER_TOOL",
  };
}

/**
 * Convenience helper returning boolean isBot status.
 */
export function isBot(ua: string | null | undefined): boolean {
  return classifyUserAgent(ua).isBot;
}

/**
 * Convenience helper returning classification category.
 */
export function getBotCategory(ua: string | null | undefined): UAClassificationCategory {
  return classifyUserAgent(ua).category;
}

/**
 * Helper to display human-friendly category label in analytics UI.
 */
export function formatBotCategoryLabel(category: UAClassificationCategory): string {
  switch (category) {
    case "BROWSER":
      return "Normal User";
    case "AI_CRAWLER":
      return "AI Crawler";
    case "SEARCH_BOT":
      return "Search Bot";
    case "SCRAPER_TOOL":
      return "Scraper / Tool";
    default:
      return "Unknown";
  }
}
