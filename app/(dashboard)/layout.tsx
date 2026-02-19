"use client";
import Bottom from "../components/Bottom";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      {children}

      <Bottom />
    </div>
  );
}
