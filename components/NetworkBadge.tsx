"use client";

import { Badge } from "@/components/ui/badge";
import { useChainId, useAccount } from "wagmi";
import { Wifi, WifiOff } from "lucide-react";

const NETWORK_INFO: Record<number, { name: string; type: "mainnet" | "testnet" | "local" }> = {
    5000: { name: "Mantle", type: "mainnet" },
    5003: { name: "Mantle Sepolia", type: "testnet" },
    31337: { name: "Localhost", type: "local" },
    1: { name: "Ethereum", type: "mainnet" },
};

export function NetworkBadge() {
    const chainId = useChainId();
    const { isConnected } = useAccount();

    if (!isConnected) {
        return (
            <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                <WifiOff className="size-3" />
                Not Connected
            </Badge>
        );
    }

    const network = NETWORK_INFO[chainId] || { name: `Chain ${chainId}`, type: "testnet" as const };

    const colorClasses = {
        mainnet: "bg-green-500/10 text-green-500 border-green-500/30",
        testnet: "bg-orange-500/10 text-orange-500 border-orange-500/30",
        local: "bg-gray-500/10 text-gray-400 border-gray-500/30",
    };

    return (
        <Badge variant="outline" className={`gap-1.5 ${colorClasses[network.type]}`}>
            <Wifi className="size-3" />
            {network.name}
            {network.type !== "mainnet" && (
                <span className="text-xs opacity-75">({network.type})</span>
            )}
        </Badge>
    );
}
