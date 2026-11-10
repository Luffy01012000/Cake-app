# Milestone 1 Explorer 1 Handoff Report: User-Agent Classification & Bot Detection

**Author**: Milestone 1 Explorer 1 (`m1_explorer_1`)  
**Working Directory**: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/explorer_1`  
**Target Specification File**: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/src/lib/visit-utils.ts`  
**Reference Code Artifact**: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/explorer_1/proposed_visit-utils.ts`

---

## 1. Observation

### 1.1 Specification & Interface Contracts
- **`ORIGINAL_REQUEST.md` (lines 12–14, 29–32)**:
  > "R1. Visit Analytics (Normal Users vs. Bots): Track and categorize incoming page traffic by inspecting request User-Agent headers to distinguish normal user visits from automated bot or search engine/AI crawler visits."  
  > "Visits from standard web browser User-Agents are classified and tallied as normal user visits."  
  > "Visits from crawler and bot User-Agents (including search engine bots and AI crawlers) are classified and tallied as bot visits."
- **`PROJECT.md` (lines 37–45, Interface Contract 1)**:
  ```ts
  export interface UAClassification {
    isBot: boolean;
    botName?: string;
    category: "BROWSER" | "AI_CRAWLER" | "SEARCH_BOT" | "SCRAPER_TOOL";
  }
  export function classifyUserAgent(ua: string | null | undefined): UAClassification;
  ```
- **`src/lib/robots-utils.ts` (lines 28–50)**:
  Lists existing project AI bots: `GPTBot`, `PerplexityBot`, `ClaudeBot`, `anthropic-ai`, `Google-Extended`, `CCBot`.
- **`package.json` (lines 16–39)**:
  Zero external UA parser libraries (`ua-parser-js`, `isbot`, etc.) are installed in dependencies. Vitest `5.1.0` is configured in pure Node mode. The classifier must be an in-house, zero-dependency, high-performance TypeScript implementation.

### 1.2 Observed Real-World User-Agent Behaviors & Traps
Direct experimentation via Node.js runtime revealed four critical edge cases:
1. **Embedded Bot Tokens in Standard Browser UAs**:
   - `Googlebot Smartphone`: `Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.94 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` contains `Chrome`, `Safari`, and `Mobile Safari`.
   - `Chrome-Lighthouse`: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Safari/537.36 Chrome-Lighthouse`.
   - `HeadlessChrome`: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.6099.109 Safari/537.36`.
   - `PerplexityBot`: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)`.
   - `Applebot-Extended`: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot-Extended/0.1; +http://www.apple.com/go/applebot)`.
   *Finding*: If browser checks run before bot checks, all modern bots masquerading with browser rendering engines are misclassified as `BROWSER`.
2. **False Positive Bot Collisions in Benign Device Names**:
   - User-Agent: `Mozilla/5.0 (Linux; Android 10; CUBOT_X30) AppleWebKit/537.36 Chrome/80.0 Mobile Safari/537.36`.
   - A naive regex `/[a-z]+bot/i` matches `CUBOT_X30` and falsely classifies real Android phones as bots.
   - Word boundary `/\bbot\b/i` or negative lookahead `/\b(?!(?:cu|tal|cha|tur|ab|sa)bot\b)[a-zA-Z0-9_-]+bot\b/i` correctly rejects `CUBOT`, `talbot`, `turbot`, `robotics`, `bottom`, and `bottleneck`.
3. **Applebot vs Applebot-Extended Precedence**:
   - `Applebot` is a Search Bot (`SEARCH_BOT`).
   - `Applebot-Extended` is an AI training Crawler (`AI_CRAWLER`).
   - Matching `Applebot-Extended` must precede `Applebot`.
4. **Degenerate Inputs (`null`, `undefined`, `""`, whitespace)**:
   - Must not throw `TypeError`.
   - Standard web browsers always transmit a non-empty `User-Agent`. Missing or blank headers indicate automated HTTP scrapers or raw scripts.

---

## 2. Logic Chain

1. **Step 1 (Interface Compliance)**:  
   Per `PROJECT.md` line 39–44, the classifier returns an object with `{ isBot: boolean, botName?: string, category: "BROWSER" | "AI_CRAWLER" | "SEARCH_BOT" | "SCRAPER_TOOL" }`. When `isBot` is false, `category` is `"BROWSER"` and `botName` is `undefined`. When `isBot` is true, `botName` contains the canonical name (e.g. `"GPTBot"`, `"Googlebot"`, `"curl"`).

2. **Step 2 (Strict Precedence Pipeline)**:  
   To prevent modern crawlers and headless browsers from being recognized as normal browsers:
   - **Stage 1**: Check `AI_CRAWLER_BOTS` (13 crawlers + Meta-ExternalAgent).
   - **Stage 2**: Check `SEARCH_ENGINE_BOTS` (7 search bots + Applebot, social indexers).
   - **Stage 3**: Check `SCRAPER_TOOLS` (curl, Wget, python-requests, Scrapy, HeadlessChrome, Lighthouse, PostmanRuntime, axios, etc.).
   - **Stage 4**: Check `GENERIC_BOT_REGEX` (catches generic crawlers/spiders while safeguarding against `CUBOT` / English benign words).
   - **Stage 5**: Check `isBrowserSignature` (verifies `Mozilla/5.0` or browser family tokens + interactive platform identifiers).
   - **Stage 6**: Fallback for empty/unrecognized non-browser inputs -> `{ isBot: true, category: "SCRAPER_TOOL" }`.

3. **Step 3 (Canonical Bot Name Normalization)**:  
   User-Agents may use mixed casing (`gptbot/1.0`, `GptBot`, `CURL/8.4.0`, `GOOGLEBOT/2.1`). By decoupling regex matching (case-insensitive `/pattern/i`) from the returned `botName`, all classifications normalize to canonical casing (`"GPTBot"`, `"curl"`, `"Googlebot"`), ensuring that `botBreakdown: Record<string, number>` aggregations remain clean without duplicate split keys.

4. **Step 4 (Comprehensive Catalog Mapping)**:

   | Category | Bot / Tool Name | Matching Regex Pattern | Example UA Snippet |
   |:---|:---|:---|:---|
   | **AI_CRAWLER** | `GPTBot` | `/\bgptbot\b/i` | `GPTBot/1.2; +https://openai.com/gptbot` |
   | **AI_CRAWLER** | `ChatGPT-User` | `/\bchatgpt-user\b/i` | `ChatGPT-User/1.0; +https://openai.com/bot` |
   | **AI_CRAWLER** | `PerplexityBot` | `/\bperplexitybot\b/i` | `PerplexityBot/1.0 (+https://perplexity.ai/perplexitybot)` |
   | **AI_CRAWLER** | `ClaudeBot` | `/\b(?:claudebot\|anthropic-ai)\b/i` | `ClaudeBot/1.0; +claudebot@anthropic.com` |
   | **AI_CRAWLER** | `Claude-Web` | `/\bclaude-web\b/i` | `Claude-Web/1.0; +claudebot@anthropic.com` |
   | **AI_CRAWLER** | `Google-Extended` | `/\bgoogle-extended\b/i` | `Google-Extended; +https://developers.google.com/...` |
   | **AI_CRAWLER** | `CCBot` | `/\bccbot\b/i` | `CCBot/2.0 (https://commoncrawl.org/faq/)` |
   | **AI_CRAWLER** | `Applebot-Extended` | `/\bapplebot-extended\b/i` | `Applebot-Extended/0.1; +http://www.apple.com/go/applebot` |
   | **AI_CRAWLER** | `Bytespider` | `/\bbytespider\b/i` | `Bytespider; spider-feedback@bytedance.com` |
   | **AI_CRAWLER** | `Diffbot` | `/\bdiffbot\b/i` | `Diffbot/0.1; +http://www.diffbot.com` |
   | **AI_CRAWLER** | `ImagesiftBot` | `/\bimagesiftbot\b/i` | `ImagesiftBot/1.0 (+http://imagesift.com)` |
   | **AI_CRAWLER** | `Cohere-ai` | `/\bcohere-ai\b/i` | `cohere-ai/1.0 (https://cohere.com/bot)` |
   | **AI_CRAWLER** | `OAI-SearchBot` | `/\boai-searchbot\b/i` | `OAI-SearchBot/1.0; (+https://openai.com/bot)` |
   | **AI_CRAWLER** | `Meta-ExternalAgent`| `/\bmeta-external(?:agent\|fetcher)\b/i` | `Meta-ExternalAgent/1.1; +https://developers.facebook.com/...` |
   | **SEARCH_BOT** | `Googlebot` | `/\bgooglebot(?:-(?:image\|news\|video\|mobile))?\b/i` | `Googlebot/2.1; +http://www.google.com/bot.html` |
   | **SEARCH_BOT** | `Bingbot` | `/\b(?:bingbot\|msnbot\|bingpreview)\b/i` | `bingbot/2.0; +http://www.bing.com/bingbot.htm` |
   | **SEARCH_BOT** | `Slurp` | `/\b(?:yahoo!?\s*slurp\|slurp)\b/i` | `Yahoo! Slurp; http://help.yahoo.com/...` |
   | **SEARCH_BOT** | `DuckDuckBot` | `/\bduckduck(?:bot\|go)\b/i` | `DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)` |
   | **SEARCH_BOT** | `Baiduspider` | `/\bbaiduspider(?:-[a-z0-9_-]+)?\b/i` | `Baiduspider/2.0; +http://www.baidu.com/search/spider.html` |
   | **SEARCH_BOT** | `YandexBot` | `/\byandex(?:bot\|mobilebot\|images\|video\|metrika)?\b/i` | `YandexBot/3.0; +http://yandex.com/bots` |
   | **SEARCH_BOT** | `Sogou` | `/\bsogou(?:\s*web\s*spider\|\s*pic\s*spider\|spider\|head)?\b/i` | `Sogou web spider/4.0` |
   | **SEARCH_BOT** | `Applebot` | `/\bapplebot\b/i` | `Applebot/0.1; +http://www.apple.com/go/applebot` |
   | **SEARCH_BOT** | `FacebookBot` | `/\b(?:facebookexternalhit\|facebot)\b/i` | `facebookexternalhit/1.1` |
   | **SEARCH_BOT** | `Twitterbot` | `/\btwitterbot\b/i` | `Twitterbot/1.0` |
   | **SCRAPER_TOOL** | `curl` | `/\bcurl\b/i` | `curl/7.88.1`, `curl/8.4.0` |
   | **SCRAPER_TOOL** | `Wget` | `/\bwget\b/i` | `Wget/1.21.4 (linux-gnu)` |
   | **SCRAPER_TOOL** | `python-requests`| `/\b(?:python-requests\|requests)(?:\/\|\b)/i` | `python-requests/2.31.0` |
   | **SCRAPER_TOOL** | `Scrapy` | `/\bscrapy\b/i` | `Scrapy/2.11.0 (+https://scrapy.org)` |
   | **SCRAPER_TOOL** | `HeadlessChrome` | `/\bheadlesschrome\b/i` | `HeadlessChrome/120.0.6099.109 Safari/537.36` |
   | **SCRAPER_TOOL** | `Lighthouse` | `/\b(?:chrome-lighthouse\|lighthouse)\b/i` | `Chrome-Lighthouse` |
   | **SCRAPER_TOOL** | `PostmanRuntime`| `/\bpostmanruntime\b/i` | `PostmanRuntime/7.36.1` |
   | **SCRAPER_TOOL** | `axios` | `/\baxios\b/i` | `axios/1.6.7` |
   | **SCRAPER_TOOL** | `aiohttp` / `httpx` | `/\baiohttp\b/i`, `/\bhttpx\b/i` | `aiohttp/3.9.1`, `HTTPX/0.25.2` |
   | **SCRAPER_TOOL** | `Puppeteer` / `Playwright` | `/\bpuppeteer\b/i`, `/\bplaywright\b/i` | `Puppeteer`, `Playwright` |
   | **BROWSER** | `Chrome` | Desktop & Android Chrome | `Mozilla/5.0 ... Chrome/122.0.0.0 Safari/537.36` |
   | **BROWSER** | `Safari` | Desktop Safari & Mobile Safari | `Mozilla/5.0 ... Version/17.2 Mobile/15E148 Safari/604.1` |
   | **BROWSER** | `Firefox` | Desktop Firefox & Firefox Mobile/iOS | `Mozilla/5.0 ... Firefox/123.0`, `FxiOS/123.0` |
   | **BROWSER** | `Edge` | Desktop Edge & Mobile Edge | `Mozilla/5.0 ... Edg/122.0.2365.66`, `EdgA/122.0.2365.66` |
   | **BROWSER** | `Opera` | Desktop Opera & Opera Touch | `Mozilla/5.0 ... OPR/108.0.0.0` |

---

## 3. Caveats

1. **User-Agent Spoofing**: HTTP User-Agent headers can be spoofed by an adversary (e.g. `curl -A "Mozilla/5.0 ..."`). In web analytics, User-Agent classification operates at the application/proxy layer without blocking requests. For visit metrics and SEO analysis, heuristic User-Agent parsing is the industry-standard approach.
2. **Missing / Empty User-Agents**: RFC 9110 states that browsers transmit a non-empty `User-Agent`. Missing or blank headers are classified as `SCRAPER_TOOL` (`isBot: true`) with `botName: undefined`. If an alternative interpretation is preferred (e.g. assigning `botName: "Unknown"`), the classifier can be updated trivially.
3. **No External Dependencies**: We intentionally avoided pulling third-party packages to keep the build lightweight, zero-dependency, and fully compliant with Next.js 16 Edge and Node runtimes.

---

## 4. Conclusion

1. **Architecture & Contract**:
   `src/lib/visit-utils.ts` should implement `classifyUserAgent(ua: string | null | undefined): UAClassification` adhering strictly to `PROJECT.md`.
2. **Ready-to-Use Artifact**:
   The full reference implementation has been generated and validated in:
   `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/explorer_1/proposed_visit-utils.ts`
   The implementation worker can directly copy this file to `src/lib/visit-utils.ts`.
3. **Downstream Integration**:
   - `src/lib/data-service.ts`: `recordVisit` can invoke `classifyUserAgent(data.userAgent)` to auto-populate `isBot` and `botName`.
   - `src/proxy.ts`: Next.js 16 request interceptor can inspect `request.headers.get("user-agent")` and pass classification metadata.
   - `src/lib/seed-data.ts`: `SEED_VISITS` can use the canonical bot names (`GPTBot`, `Googlebot`, `Bingbot`, `ClaudeBot`, `curl`, `Lighthouse`, etc.) so `getVisitAnalytics()` aggregates realistic numbers out of the box.

---

## 5. Verification Method

### 5.1 Standalone Prototype Execution
To verify the classification logic across all 42 real-world test cases:
```bash
node -e '
const { classifyUserAgent } = require("./.agents/teamwork/milestone_1/explorer_1/proposed_visit-utils.ts");
// Or run via tsx:
'
```
Or run directly with `tsx`:
```bash
npx tsx -e '
import { classifyUserAgent } from "./.agents/teamwork/milestone_1/explorer_1/proposed_visit-utils";
const testUAs = [
  ["Desktop Chrome", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36", false, "BROWSER"],
  ["CUBOT phone", "Mozilla/5.0 (Linux; Android 10; CUBOT_X30) AppleWebKit/537.36 Chrome/80.0 Mobile Safari/537.36", false, "BROWSER"],
  ["Googlebot Smartphone", "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.94 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", true, "SEARCH_BOT"],
  ["GPTBot", "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)", true, "AI_CRAWLER"],
  ["Applebot-Extended", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot-Extended/0.1; +http://www.apple.com/go/applebot)", true, "AI_CRAWLER"],
  ["Lighthouse", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Safari/537.36 Chrome-Lighthouse", true, "SCRAPER_TOOL"],
  ["curl", "curl/7.88.1", true, "SCRAPER_TOOL"],
  ["empty", "", true, "SCRAPER_TOOL"]
];
for (const [desc, ua, isBot, cat] of testUAs) {
  const res = classifyUserAgent(ua);
  if (res.isBot !== isBot || res.category !== cat) {
    throw new Error(`Failed on ${desc}: expected ${isBot}/${cat}, got ${res.isBot}/${res.category}`);
  }
}
console.log("All sample verifications passed successfully!");
'
```

### 5.2 TypeScript Typechecking
```bash
npx tsc --noEmit .agents/teamwork/milestone_1/explorer_1/proposed_visit-utils.ts
```
Expected output: exit code 0, 0 diagnostic errors.

### 5.3 Test Suite Execution
When deployed to `src/lib/visit-utils.ts`:
```bash
pnpm test
```
All Vitest unit tests in `tests/` must pass with 0 failures.

### 5.4 Invalidation Conditions
- A test asserts that `CUBOT_X30` is classified as a bot (false positive).
- An AI crawler containing `Chrome` or `Safari` tokens is classified as `BROWSER`.
- An incoming `null` or `undefined` User-Agent throws an unhandled exception instead of returning a valid `UAClassification`.
