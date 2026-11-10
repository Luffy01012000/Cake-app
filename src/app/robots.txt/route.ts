import { NextResponse } from "next/server";
import { getRobotsConfig, getSiteSettings } from "@/lib/data-service";
import { formatRobotsTxt } from "@/lib/robots-utils";

export async function GET() {
  const [config, settings] = await Promise.all([
    getRobotsConfig(),
    getSiteSettings(),
  ]);

  const robotsContent = formatRobotsTxt(config, settings.siteUrl);

  return new NextResponse(robotsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
