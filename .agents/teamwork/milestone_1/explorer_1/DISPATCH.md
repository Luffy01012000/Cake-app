# Dispatch: Milestone 1 - Explorer 1 (UA Classification & Bot Detection)

You are Milestone 1 Explorer 1 (`teamwork_explorer`).
Working directory: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/explorer_1`
Project root: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator`
Original Request: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md`
Project Specification: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md`

## Mission
1. Read `ORIGINAL_REQUEST.md` and `PROJECT.md`.
2. Investigate User-Agent classification logic for `src/lib/visit-utils.ts`:
   - Enumerate all AI crawlers: GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Claude-Web, Google-Extended, CCBot, Applebot-Extended, Bytespider, Diffbot, ImagesiftBot, Cohere-ai, OAI-SearchBot.
   - Enumerate search engine bots: Googlebot, Bingbot, Slurp, DuckDuckBot, Baiduspider, YandexBot, Sogou.
   - Enumerate scraper tools / automated clients: curl, Wget, python-requests, Scrapy, HeadlessChrome, lighthouse, PostmanRuntime, axios.
   - Normal browser signatures (Chrome, Safari, Firefox, Edge, Mobile Safari/Chrome).
   - Handle edge cases: null/undefined/empty string, mixed casing, bot tokens embedded in browser tokens (e.g. Chrome-Lighthouse).
3. Recommend the exact interface, function signatures, and implementation strategy for `classifyUserAgent`.
4. Write handoff report to `handoff.md` in your working directory and notify parent.


## 2026-11-06T06:10:34Z
You are Milestone 1 Explorer 1 (m1_explorer_1).
Working directory: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/explorer_1
Project root: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator
Original Request File: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
Dispatch Instructions: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/explorer_1/DISPATCH.md
Project Specification: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md

Investigate User-Agent classification logic, AI crawler tokens, search bot signatures, scraper tools, normal browsers, and edge cases.
Write your handoff report to /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/explorer_1/handoff.md and notify parent via send_message.
