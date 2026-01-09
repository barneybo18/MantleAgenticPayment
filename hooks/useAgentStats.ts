import { useAccount, usePublicClient, useChainId } from 'wagmi';
import { useState, useEffect } from 'react';
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN } from '@/lib/contracts';

// Max block range for Mantle RPC (limit is 10,000, use 9,000 for safety)
const MAX_BLOCK_RANGE = 9000n;

export function useAgentStats() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const chainId = useChainId();
    const [stats, setStats] = useState<Record<string, bigint>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const config = CONTRACT_CONFIG[chainId];
        if (!address || !publicClient || !config || config.address === NATIVE_TOKEN) return;

        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const currentBlock = await publicClient.getBlockNumber();
                const allLogs: any[] = [];

                // Fetch logs in chunks to avoid RPC block range limit
                let fromBlock = config.deployBlock;
                while (fromBlock <= currentBlock) {
                    const toBlock = fromBlock + MAX_BLOCK_RANGE > currentBlock
                        ? currentBlock
                        : fromBlock + MAX_BLOCK_RANGE;

                    try {
                        const logs = await publicClient.getContractEvents({
                            address: config.address,
                            abi: AGENT_PAY_ABI,
                            eventName: 'ScheduledPaymentExecuted',
                            args: { from: address },
                            fromBlock,
                            toBlock
                        });
                        allLogs.push(...logs);
                    } catch (chunkError) {
                        console.warn(`Failed to fetch logs for blocks ${fromBlock}-${toBlock}:`, chunkError);
                    }

                    fromBlock = toBlock + 1n;
                }

                const newStats: Record<string, bigint> = {};

                for (const log of allLogs) {
                    const id = log.args.id?.toString();
                    const amount = log.args.amount as bigint;

                    if (id && amount) {
                        newStats[id] = (newStats[id] || 0n) + amount;
                    }
                }

                setStats(newStats);
            } catch (e) {
                console.error("Failed to fetch agent stats:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [address, publicClient, chainId]);

    return { stats, isLoading };
}
