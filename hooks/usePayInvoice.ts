"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { AGENT_PAY_ABI, AGENT_PAY_ADDRESS } from "@/lib/contracts";

export function usePayInvoice() {
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const payInvoice = async (invoiceId: bigint, amount: bigint) => {
        writeContract({
            address: AGENT_PAY_ADDRESS,
            abi: AGENT_PAY_ABI,
            functionName: "payInvoice",
            args: [invoiceId],
            value: amount
        });
    };

    return {
        payInvoice,
        hash,
        isPending: isWritePending || isConfirming,
        isSuccess,
        error: writeError
    };
}
