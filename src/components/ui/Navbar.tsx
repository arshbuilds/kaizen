"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, Flame, Target, RotateCcw, User } from "lucide-react";

export default function Navbar({ hidden }: { hidden?: string[] }) {
  const pathname = usePathname();

  const navItems = [
    { icon: CalendarCheck, label: "Today", path: "/today" },
    { icon: Target, label: "Goals", path: "/goals" },
    { icon: Flame, label: "Focus", path: "/focus" },
    { icon: RotateCcw, label: "Review", path: "/review" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  if (hidden && hidden.some((h) => pathname.startsWith(h))) {
    return null;
  }

  // Also hide on auth screens for zero distraction
  if (
    pathname.startsWith("/enter") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 w-full">
      <div className="relative w-full max-w-lg mx-auto">
        <div className="bg-[#1e2235]/95 backdrop-blur-md px-4 py-2.5 border-t border-slate-700/60 shadow-2xl rounded-t-2xl">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/today"
                  ? pathname === "/" || pathname === "/today"
                  : pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                    aria-label={item.label}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className={`text-[11px] font-medium transition-colors ${
                      isActive ? "text-blue-400 font-semibold" : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
