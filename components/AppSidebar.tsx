"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Bot, Wallet } from "lucide-react";

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Invoices",
        url: "/invoices",
        icon: FileText,
    },
    {
        title: "Agents",
        url: "/agents",
        icon: Bot,
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
            <div className="p-4 border-b flex items-center gap-2">
                <div className="size-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    AP
                </div>
                <span className="font-bold text-lg">AgentPay</span>
            </div>
            <div className="flex-1 py-4">
                <nav className="grid gap-1 px-2">
                    {items.map((item) => (
                        <Link
                            key={item.title}
                            href={item.url}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === item.url ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="size-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="p-4 border-t">
                {/* Footer info or user profile could go here */}
                <div className="text-xs text-muted-foreground">
                    Mantle Agentic Hackathon
                </div>
            </div>
        </div>
    );
}
