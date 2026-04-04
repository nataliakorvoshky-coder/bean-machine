"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { useAdminData, AdminDataProvider } from "@/lib/AdminDataContext";
import GlobalSync from "@/components/GlobalSync";
import Panda from "@/components/Panda";


function DashboardContent({ children }: { children: ReactNode }) {
const { username } = useAdminData();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 flex justify-center pt-20">
        {children}

        <Panda employeeName={username} />
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminDataProvider>
      <GlobalSync />
      <DashboardContent>{children}</DashboardContent>
    </AdminDataProvider>
  );
}