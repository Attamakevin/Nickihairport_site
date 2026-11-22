"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setOrderStatus } from "@/app/admin/actions";

export default function OrderActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (status !== "paid") return null;
  const go = (s: "fulfilled" | "cancelled") => start(async () => { await setOrderStatus(id, s); router.refresh(); });
  return (
    <div className="flex gap-2">
      <button disabled={pending} onClick={() => go("fulfilled")} className="btn btn-gold !px-4 !py-2">Mark fulfilled</button>
      <button disabled={pending} onClick={() => confirm("Cancel this order?") && go("cancelled")} className="btn btn-outline !px-4 !py-2">Cancel</button>
    </div>
  );
}
