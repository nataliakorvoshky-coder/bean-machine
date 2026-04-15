"use client";

import { useEffect, useContext } from "react";
import { AdminContext } from "@/lib/AdminDataContext";
import { initRealtime } from "@/lib/realtime";

export default function GlobalSync() {
  const ctx = useContext(AdminContext);
  if (!ctx) return null;

  const { setRequests, loading } = ctx;

  useEffect(() => {
    if (loading) return;

    const cleanup = initRealtime({
      onRequestUpdate: (payload) => {
        setRequests((prev: any[]) => {
          if (!prev) return [];

          if (payload.type === "DELETE") {
            return prev.filter((r) => r.id !== payload.old.id);
          }

          if (payload.type === "UPDATE") {
            return prev.map((r) =>
              r.id === payload.new.id ? payload.new : r
            );
          }

          if (payload.type === "INSERT") {
            if (prev.some((r) => r.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          }

          return prev;
        });
      },
    });

    return cleanup;
  }, [loading]);

  return null;
}