import React from "react";
import {
  getAllCakes,
  getSiteSettings,
  getAllPagesSeo,
  getCustomSitemapEntries,
} from "@/lib/data-service";
import SitemapManager from "@/components/admin/SitemapManager";

export default async function AdminSitemapPage() {
  const [cakes, settings, pages, customEntries] = await Promise.all([
    getAllCakes(),
    getSiteSettings(),
    getAllPagesSeo(),
    getCustomSitemapEntries(),
  ]);

  const baseUrl = settings.siteUrl.replace(/\/$/, "");

  const noIndexedPaths = new Set(
    pages
      .filter((p) => p.noIndex)
      .map((p) => (p.path.startsWith("/") ? p.path : `/${p.path}`))
  );

  const staticUrls = [
    {
      path: "/",
      url: `${baseUrl}`,
      label: "Home Page",
      priority: "1.0",
      freq: "daily",
      type: "Core Landing",
      isNoIndex: noIndexedPaths.has("/"),
    },
    {
      path: "/cakes",
      url: `${baseUrl}/cakes`,
      label: "Haute Cake Catalog",
      priority: "0.9",
      freq: "daily",
      type: "Catalog Index",
      isNoIndex: noIndexedPaths.has("/cakes"),
    },
    {
      path: "/occasions/weddings",
      url: `${baseUrl}/occasions/weddings`,
      label: "Weddings Collection",
      priority: "0.8",
      freq: "weekly",
      type: "Category SSR",
      isNoIndex: noIndexedPaths.has("/occasions/weddings"),
    },
    {
      path: "/occasions/birthdays",
      url: `${baseUrl}/occasions/birthdays`,
      label: "Birthdays Collection",
      priority: "0.8",
      freq: "weekly",
      type: "Category SSR",
      isNoIndex: noIndexedPaths.has("/occasions/birthdays"),
    },
    {
      path: "/occasions/anniversaries",
      url: `${baseUrl}/occasions/anniversaries`,
      label: "Anniversaries Collection",
      priority: "0.8",
      freq: "weekly",
      type: "Category SSR",
      isNoIndex: noIndexedPaths.has("/occasions/anniversaries"),
    },
    {
      path: "/occasions/baby-showers",
      url: `${baseUrl}/occasions/baby-showers`,
      label: "Baby Showers Collection",
      priority: "0.8",
      freq: "weekly",
      type: "Category SSR",
      isNoIndex: noIndexedPaths.has("/occasions/baby-showers"),
    },
    {
      path: "/occasions/galas",
      url: `${baseUrl}/occasions/galas`,
      label: "Galas Collection",
      priority: "0.8",
      freq: "weekly",
      type: "Category SSR",
      isNoIndex: noIndexedPaths.has("/occasions/galas"),
    },
  ];

  const cakeUrls = cakes.map((cake) => ({
    path: `/cakes/${cake.slug}`,
    url: `${baseUrl}/cakes/${cake.slug}`,
    label: cake.name,
    priority: "0.85",
    freq: "weekly",
    type: "Product SSR",
    isNoIndex: false,
  }));

  const staticAndCakeUrls = [...staticUrls, ...cakeUrls];

  return (
    <SitemapManager
      initialCustomEntries={customEntries}
      staticAndCakeUrls={staticAndCakeUrls}
      baseUrl={baseUrl}
    />
  );
}
