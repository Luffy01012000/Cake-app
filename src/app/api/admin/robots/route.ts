import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getRobotsConfig, saveRobotsConfig, getSiteSettings } from "@/lib/data-service";
import { formatRobotsTxt } from "@/lib/robots-utils";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [config, settings] = await Promise.all([
    getRobotsConfig(),
    getSiteSettings(),
  ]);

  const preview = formatRobotsTxt(config, settings.siteUrl);

  return NextResponse.json({ config, preview });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const updated = await saveRobotsConfig(data);
    const settings = await getSiteSettings();
    const preview = formatRobotsTxt(updated, settings.siteUrl);

    revalidatePath("/robots.txt");
    revalidatePath("/admin/robots");

    return NextResponse.json({ success: true, config: updated, preview });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to update robots config: " + (err as Error).message },
      { status: 500 }
    );
  }
}
