import { ThemeToggle } from "@/components/ui/theme-toggle";
import PrivateBreadcrumb from "./breadcrumb";
import PrivateNavMenu from "./menu";

export default function PrivateNavbar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 md:px-6 backdrop-blur-md transition-all">
      <div className="flex items-center gap-2">
        <PrivateBreadcrumb />
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <PrivateNavMenu />
      </div>
    </header>
  );
}
