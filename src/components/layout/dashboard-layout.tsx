import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-row bg-background overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:block shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}
