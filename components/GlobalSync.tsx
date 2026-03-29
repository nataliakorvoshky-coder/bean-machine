"use client";

import { useEffect, useRef, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { AdminContext } from "@/lib/AdminDataContext";

export default function GlobalSync() {
  const channelRef = useRef<any>(null);
  const initialized = useRef(false);

  const ctx = useContext(AdminContext);

  // ✅ SAFE GUARD (NO CRASH)
  if (!ctx) return null;

  const { setRequests, loading } = ctx;

  useEffect(() => {
    if (loading) return;
    if (initialized.current) return;
    initialized.current = true;

    async function start() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      console.log("🟢 Global realtime starting...");

      const channel = supabase.channel("global-live");

      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests" },
        (payload: any) => {
          setRequests((prev: any[]) => {
            if (payload.eventType === "DELETE") {
              return prev.filter((r) => r.id !== payload.old.id);
            }

            if (payload.eventType === "UPDATE") {
              return prev.map((r) =>
                r.id === payload.new.id ? payload.new : r
              );
            }

            if (payload.eventType === "INSERT") {
              return [payload.new, ...prev];
            }

            return prev;
          });
        }
      );

      channel.subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          console.log("🟢 Realtime connected");
        }
      });

      channelRef.current = channel;
    }

    start();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [loading]);

  return null;
}