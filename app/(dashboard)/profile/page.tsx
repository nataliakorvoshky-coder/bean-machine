"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // ✅ IMPORTANT

export default function ProfilePage() {

  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {

    // ✅ GET SESSION
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      console.error("No session found");
      return;
    }

    // ✅ SEND TOKEN TO API
    const res = await fetch("/api/user/profile/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data.error) {
      console.error("API Error:", data.error);
      return;
    }

    setEmployee(data?.employee);
  }

  if (!employee) return <div className="px-10 py-8">Loading...</div>;

  const isAdmin = employee.rank === "Coffee Panda";

  function statusBadge(status: string) {
    if (status === "Active") return "bg-emerald-100 text-emerald-700";
    if (status === "ROA" || status === "LOA") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  }

  function rankBadgeColor(rank: string) {
    switch (rank) {
      case "Macchiato": return "bg-[var(--macchiato)] text-white";
      case "Cappuccino": return "bg-[var(--cappuccino)] text-white";
      case "Latte": return "bg-[var(--latte)] text-white";
      case "Mocha": return "bg-[var(--mocha)] text-white";
      case "Iced Coffee": return "bg-[var(--iced-coffee)] text-white";
      case "Frappuccino": return "bg-[var(--frappuccino)] text-white";
      case "Croissant": return "bg-[var(--croissant)] text-white";
      case "Coffee Panda": return "bg-[var(--coffee-panda)] text-white";
      case "Bean": return "bg-[var(--bean)] text-gray-700";
      case "Coffee": return "bg-[var(--coffee)] text-white";
      default: return "bg-gray-100 text-gray-600";
    }
  }

  function rowBorder(status: string, isAdmin: boolean) {
    if (isAdmin) {
      return "border-none shadow-[0px_0px_4px_2px_rgba(138,43,226,0.6)]";
    }
    if (status === "Active") return "border border-emerald-400";
    if (status === "ROA" || status === "LOA") return "border border-yellow-400";
    return "border border-gray-200";
  }

  return (
    <div className="w-full px-10 py-8">

      <h1 className="text-4xl font-bold text-emerald-700 mb-8">
        My Profile
      </h1>

      <div className="grid grid-cols-[5fr_2fr_2fr_2fr_1.5fr_2fr_1.5fr] text-sm font-semibold text-emerald-700 px-6 mb-3">
        <div>Name</div>
        <div>Status</div>
        <div>Rank</div>
        <div>Wage</div>
        <div>Hours</div>
        <div>Earnings</div>
        <div>Goal</div>
      </div>

      <div
        className={`grid grid-cols-[5fr_2fr_2fr_2fr_1.5fr_2fr_1.5fr] items-center bg-white shadow rounded-xl px-6 py-2 ${rowBorder(
          employee.status,
          isAdmin
        )}`}
      >

        <Link
          href={`/employees/${employee.id}`}
          className="text-emerald-700 font-medium hover:bg-emerald-50 px-2 py-[2px] rounded w-fit"
        >
          {employee.name}
        </Link>

        <div>
          <span className={`px-2 py-[2px] rounded-full text-xs ${statusBadge(employee.status)}`}>
            {employee.status}
          </span>
        </div>

        <div>
          <span className={`${rankBadgeColor(employee.rank)} px-2 py-[2px] rounded-full text-xs`}>
            {isAdmin && <span className="mr-2">🐼</span>}
            {employee.rank}
          </span>
        </div>

        <div className="text-emerald-700 font-medium text-sm">
          {isAdmin ? "∞" : `$${employee.wage}/hr`}
        </div>

        <div className="text-emerald-700 font-medium text-sm">
          {employee.weekly_hours ?? 0}
        </div>

        <div className="text-emerald-700 font-semibold text-sm">
          {isAdmin ? "∞" : `$${employee.weekly_earnings ?? 0}`}
        </div>

        <div
          className={
            isAdmin
              ? "text-purple-500 font-semibold text-sm"
              : employee.goal_met
              ? "text-emerald-600"
              : "text-red-500"
          }
        >
          {isAdmin ? "Always" : employee.goal_met ? "Met" : "Not Met"}
        </div>

      </div>

    </div>
  );
}