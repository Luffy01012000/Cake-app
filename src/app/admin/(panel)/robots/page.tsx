import React from "react";
import { getRobotsConfig, getSiteSettings } from "@/lib/data-service";
import RobotsManager from "@/components/admin/RobotsManager";

export default async function AdminRobotsPage() {
  const [config, settings] = await Promise.all([
    getRobotsConfig(),
    getSiteSettings(),
  ]);

  return <RobotsManager initialConfig={config} siteUrl={settings.siteUrl} />;
}
