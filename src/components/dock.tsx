"use client";

import { Home, UtensilsCrossed, Globe, HamburgerIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Dock as MagicDock, DockIcon } from "@/components/magicui/dock";

type DockItem =
  | {
      href: string;
      icon: LucideIcon;
      label: string;
      name: string;
    }
  | {
      type: "separator";
    };

const dockItems: DockItem[] = [
  {
    href: "/",
    icon: Home,
    label: "home",
    name: "Home"
  },
  {
    type: "separator"
  },
  {
    href: "/lunch",
    icon: HamburgerIcon,
    label: "lunch",
    name: "Lunch"
  },
  {
    href: "/venos",
    icon: Globe,
    label: "venos",
    name: "Venos"
  }
];

export function Dock() {
  const pathname = usePathname();
  const isVenosPage = pathname === "/venos";

  return (
    <motion.div
      className={cn(
        "fixed bottom-4 z-50",
        isVenosPage
          ? "right-4"
          : "left-1/2 -translate-x-1/2"
      )}
      layout
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.6
      }}
    >
      <TooltipProvider>
        <MagicDock direction="middle">
          {dockItems.map((item, index) => {
            // Type guard for separator
            if ('type' in item && item.type === "separator") {
              return (
                <div key={`separator-${index}`} className="mx-2 flex items-center">
                  <div className="h-8 w-px bg-border/60 rounded-full" />
                </div>
              );
            }

            // Type guard for dock item
            if ('href' in item && 'icon' in item && 'label' in item) {
              return (
                <DockIcon key={item.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        aria-label={item.label}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "size-12 rounded-full",
                        )}
                      >
                        <item.icon className="size-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>
              );
            }

            return null;
          })}
        </MagicDock>
      </TooltipProvider>
    </motion.div>
  );
}
