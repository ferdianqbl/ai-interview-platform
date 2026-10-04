import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import PrivateSidebar from "./sidebar";
import PrivateNavbar from "./navbar";
import BottomTabBar from "./bottom-tab-bar";

export default function PrivateLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      {/* Collapsible Sidebar */}
      <PrivateSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <PrivateNavbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomTabBar />
    </div>
  );
}
