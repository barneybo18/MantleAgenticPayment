import { usePublicClient, useChainId } from 'wagmi';
import { useState, useEffect } from 'react';
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN } from '@/lib/contracts';

export interface ExecutionEvent {
    transactionHash: string;
    blockNumber: bigint;
    timestamp: bigint;
    amount: bigint;
    to: string;
}

export function useAgentHistory(agentId: bigint | undefined) {
    const publicClient = usePublicClient();
    const chainId = useChainId();
    const [history, setHistory] = useState<ExecutionEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const config = CONTRACT_CONFIG[chainId];
        if (agentId === undefined || !publicClient || !config || config.address === NATIVE_TOKEN) {
            // No contract on this chain yet or invalid config
            setHistory([]);
            return;
        }

        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const logs = await publicClient.getContractEvents({
                    address: config.address,
                    abi: AGENT_PAY_ABI,
                    eventName: 'ScheduledPaymentExecuted',
                    args: { id: agentId },
                    fromBlock: config.deployBlock
                });

                // Fetch timestamps
                // Optimization: Deduplicate block numbers to reduce requests
                const uniqueBlockNumbers = Array.from(new Set(logs.map(l => l.blockNumber)));
                const blockPromises = uniqueBlockNumbers.map(bn => publicClient.getBlock({ blockNumber: bn }));
                const blocks = await Promise.all(blockPromises);
                const blockMap = new Map(blocks.map(b => [b.number, b.timestamp]));

                const historyItems = logs.map((log) => ({
                    transactionHash: log.transactionHash,
                    blockNumber: log.blockNumber,
                    amount: log.args.amount as bigint,
                    timestamp: blockMap.get(log.blockNumber) || 0n,
                    to: log.args.to as string
                }));

                // Sort by block number descending
                historyItems.sort((a, b) => Number(b.blockNumber - a.blockNumber));

                setHistory(historyItems);
            } catch (e) {
                console.error("Failed to fetch agent history:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [agentId, publicClient]);

    return { history, isLoading };
}
