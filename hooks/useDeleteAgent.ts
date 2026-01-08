import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN } from "@/lib/contracts";

export function useDeleteAgent() {
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();

    const deleteAgent = async (id: bigint) => {
        const config = CONTRACT_CONFIG[chainId];
        const address = config?.address;

        if (!address || address === NATIVE_TOKEN) {
            console.error("Contract not deployed on this chain");
            return;
        }

        writeContract({
            address: address,
            abi: AGENT_PAY_ABI,
            functionName: "cancelScheduledPayment",
            args: [id],
            gas: 500000n // Manual gas override to prevent "gas limit too low" error
        });
    };

    return {
        deleteAgent,
        hash,
        isPending: isWritePending || isConfirming,
        isSuccess,
        error: writeError
    };
}
