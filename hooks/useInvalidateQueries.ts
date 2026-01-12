"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Hook to invalidate all contract-related queries after a transaction.
 * This ensures the UI updates immediately after any state-changing transaction.
 */
export function useInvalidateQueries() {
    const queryClient = useQueryClient();

    const invalidateAll = useCallback(() => {
        // Invalidate all wagmi read contract queries
        // These query keys match wagmi's internal naming convention
        queryClient.invalidateQueries({ queryKey: ["readContract"] });
        queryClient.invalidateQueries({ queryKey: ["readContracts"] });

        // Also refetch any active queries immediately
        queryClient.refetchQueries({
            queryKey: ["readContract"],
            type: "active"
        });
        queryClient.refetchQueries({
            queryKey: ["readContracts"],
            type: "active"
        });
    }, [queryClient]);

    const invalidateAgents = useCallback(() => {
        queryClient.invalidateQueries({
            predicate: (query) => {
                const key = query.queryKey;
                // Match queries related to scheduled payments / agents
                return JSON.stringify(key).includes("getUserScheduledPayments") ||
                    JSON.stringify(key).includes("getScheduledPayment");
            }
        });
    }, [queryClient]);

    const invalidateInvoices = useCallback(() => {
        queryClient.invalidateQueries({
            predicate: (query) => {
                const key = query.queryKey;
                // Match queries related to invoices
                return JSON.stringify(key).includes("getUserCreatedInvoices") ||
                    JSON.stringify(key).includes("getUserReceivedInvoices") ||
                    JSON.stringify(key).includes("getInvoice");
            }
        });
    }, [queryClient]);

    return {
        invalidateAll,
        invalidateAgents,
        invalidateInvoices,
    };
}
