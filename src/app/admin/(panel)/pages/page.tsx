import React from "react";
import { getAllPagesSeo } from "@/lib/data-service";
import PagesSeoManager from "@/components/admin/PagesSeoManager";

export default async function AdminStaticPagesSeoPage() {
  const pages = await getAllPagesSeo();
  return <PagesSeoManager initialPages={pages} />;
}
