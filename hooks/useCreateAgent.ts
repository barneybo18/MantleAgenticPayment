"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN } from "@/lib/contracts";

export function useCreateAgent() {
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();

    const createAgent = async (
        to: string,
        amount: bigint,
        token: string,
        interval: bigint,
        description: string,
        initialDeposit: bigint,
        initialTokenDeposit: bigint = 0n,
        endDate: bigint = 0n
    ) => {
        const config = CONTRACT_CONFIG[chainId];
        const address = config?.address;

        if (!address || address === NATIVE_TOKEN) {
            console.error("Contract not deployed");
            return;
        }

        writeContract({
            address: address,
            abi: AGENT_PAY_ABI,
            functionName: "createScheduledPayment",
            args: [to as `0x${string}`, amount, token as `0x${string}`, interval, description, initialTokenDeposit, endDate],
            value: initialDeposit
        });
    };

    return {
        createAgent,
        hash,
        isPending: isWritePending || isConfirming,
        isSuccess,
        error: writeError
    };
}
