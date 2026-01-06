"use client";

import { AppSidebar } from "@/components/AppSidebar";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NetworkBadge } from "@/components/NetworkBadge";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-background">
            <AppSidebar />
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <header className="h-14 border-b px-6 flex items-center justify-between bg-card">
                    <h1 className="font-semibold text-lg">AgentPay</h1>
                    <div className="flex items-center gap-4">
                        <NetworkBadge />
                        <ConnectButton showBalance={false} />
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

