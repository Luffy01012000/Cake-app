import React from "react";
import { notFound } from "next/navigation";
import { getCakeBySlug } from "@/lib/data-service";
import { getSession } from "@/lib/auth";
import CakeForm from "@/components/admin/CakeForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditCakePage({ params }: Props) {
  const [session, { id }] = await Promise.all([
    getSession(),
    params,
  ]);
  const cake = await getCakeBySlug(id);

  if (!cake) {
    notFound();
  }

  return <CakeForm initialCake={cake} isNew={false} userRole={session?.role} />;
}
