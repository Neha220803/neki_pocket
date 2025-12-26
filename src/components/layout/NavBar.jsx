"use client";

// ============================================
// NAVBAR COMPONENT
// Navigation bar with app title and tabs
// ============================================

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Receipt, HandCoins } from "lucide-react";
const logo = "/images/logo-nav.png";

function NavBar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/expenses",
      label: "Expenses",
      icon: Receipt,
    },
    {
      href: "/settlements",
      label: "Settlements",
      icon: HandCoins,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="NeKiPocket logo"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn("gap-2", isActive && "shadow-sm")}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout (optional - you can remove if not needed) */}
        {/* <Button variant="ghost" size="sm" className="gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button> */}
      </div>
    </header>
  );
}

export { NavBar };
