import { useWriteContract, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG } from "@/lib/contracts";

export function useToggleAgentStatus() {
    const { writeContractAsync, isPending, isSuccess } = useWriteContract();
    const chainId = useChainId();

    const toggleAgentStatus = async (id: bigint, isActive: boolean) => {
        const config = CONTRACT_CONFIG[chainId];
        if (!config?.address) throw new Error("Contract not deployed on this chain");

        return writeContractAsync({
            address: config.address,
            abi: AGENT_PAY_ABI,
            functionName: "toggleAgentStatus",
            args: [id, isActive]
        });
    };

    return {
        toggleAgentStatus,
        isPending,
        isSuccess,
    };
}
