import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { ERC20_ABI } from "@/lib/contracts";
import { useState, useEffect } from "react";
import { MaxUint256 } from "ethers"; // or just use BigInt

export function useTokenApproval(tokenAddress: `0x${string}`, spenderAddress: `0x${string}`) {
    const { address: userAddress } = useAccount();

    const { data: allowance, refetch: refetchAllowance, isLoading: isLoadingAllowance } = useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: userAddress && spenderAddress ? [userAddress, spenderAddress] : undefined,
        query: { enabled: !!userAddress && !!spenderAddress && tokenAddress !== "0x0000000000000000000000000000000000000000" }
    });

    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const approveToken = async (amount: bigint = 115792089237316195423570985008687907853269984665640564039457584007913129639935n) => { // MaxUint256
        writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [spenderAddress, amount]
        });
    };

    // Auto-refetch after approval
    useEffect(() => {
        if (isSuccess) {
            refetchAllowance();
        }
    }, [isSuccess, refetchAllowance]);

    return {
        allowance: allowance as bigint || 0n,
        approveToken,
        isPending: isWritePending || isConfirming,
        isSuccess,
        isLoadingAllowance
    };
}
