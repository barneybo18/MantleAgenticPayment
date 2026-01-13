"use client";

import { Badge } from "@/components/ui/badge";
import { useChainId, useAccount } from "wagmi";
import { Wifi, WifiOff } from "lucide-react";

const NETWORK_INFO: Record<number, { name: string; shortName: string; type: "mainnet" | "testnet" | "local" }> = {
    5000: { name: "Mantle", shortName: "MNT", type: "mainnet" },
    5003: { name: "Mantle Sepolia", shortName: "Sep", type: "testnet" },
    31337: { name: "Localhost", shortName: "Local", type: "local" },
    1: { name: "Ethereum", shortName: "ETH", type: "mainnet" },
};

export function NetworkBadge() {
    const chainId = useChainId();
    const { isConnected } = useAccount();

    if (!isConnected) {
        return (
            <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                <WifiOff className="size-3" />
                <span className="hidden sm:inline">Not Connected</span>
            </Badge>
        );
    }

    const network = NETWORK_INFO[chainId] || { name: `Chain ${chainId}`, shortName: `#${chainId}`, type: "testnet" as const };

    const colorClasses = {
        mainnet: "bg-green-500/10 text-green-500 border-green-500/30",
        testnet: "bg-orange-500/10 text-orange-500 border-orange-500/30",
        local: "bg-gray-500/10 text-gray-400 border-gray-500/30",
    };

    return (
        <Badge variant="outline" className={`gap-1.5 ${colorClasses[network.type]}`}>
            <Wifi className="size-3" />
            {/* Short name on mobile, full name on desktop */}
            <span className="sm:hidden">{network.shortName}</span>
            <span className="hidden sm:inline">{network.name}</span>
            {network.type !== "mainnet" && (
                <span className="hidden md:inline text-xs opacity-75">({network.type})</span>
            )}
        </Badge>
    );
}
