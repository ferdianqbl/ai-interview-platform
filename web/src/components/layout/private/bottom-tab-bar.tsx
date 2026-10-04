import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getSidebarNavItems } from "./utils";

export default function BottomTabBar() {
  const location = useLocation();
  const navGroups = getSidebarNavItems();
  const items = navGroups.flatMap((g) => g.items);

  return (
    <div className="fixed bottom-0 left-0 z-40 flex h-16 w-full items-center justify-around border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href &&
          (location.pathname === item.href ||
            location.pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.name}
            to={item.href || "#"}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1 px-3 text-xs transition-colors",
              isActive
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
