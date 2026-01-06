'use client';

import * as React from 'react';
import {
    RainbowKitProvider,
    getDefaultWallets,
    getDefaultConfig,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
    mantle,
} from 'wagmi/chains';
import { defineChain } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';

// Define Mantle Sepolia with correct RPC
const mantleSepolia = defineChain({
    id: 5003,
    name: 'Mantle Sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'MNT',
        symbol: 'MNT',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.sepolia.mantle.xyz'],
        },
    },
    blockExplorers: {
        default: { name: 'Mantle Sepolia Explorer', url: 'https://sepolia.mantlescan.xyz' },
    },
    testnet: true,
});

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
    appName: 'AgentPay',
    projectId: 'YOUR_PROJECT_ID', // Replace with WalletConnect project ID
    wallets: [
        ...wallets,
        {
            groupName: 'Other',
            wallets: [argentWallet, trustWallet, ledgerWallet],
        },
    ],
    chains: [mantleSepolia, mantle],
    transports: {
        [mantle.id]: http(),
        [mantleSepolia.id]: http('https://rpc.sepolia.mantle.xyz'),
    },
    ssr: true,
});

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

