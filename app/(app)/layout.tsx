"use client";

import { AppSidebar, MobileMenuTrigger } from "@/components/AppSidebar";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NetworkBadge } from "@/components/NetworkBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "sonner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-background">
            <AppSidebar />
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <header className="h-14 border-b px-4 md:px-6 flex items-center justify-between bg-card gap-2">
                    <div className="flex items-center gap-2">
                        <MobileMenuTrigger />
                        <h1 className="font-semibold text-lg">Bogent</h1>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle />
                        <NetworkBadge />
                        <ConnectButton showBalance={false} />
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    {children}
                </div>
            </main>
            <Toaster richColors position="top-right" />
        </div>
    );
}
