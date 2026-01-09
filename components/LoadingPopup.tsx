"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export function LoadingPopup() {
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // When pathname or searchParams change, loading is complete
        setIsLoading(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        // Intercept link clicks to show loading state
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest("a");

            if (link && link.href && !link.target && !link.download) {
                const url = new URL(link.href);
                // Only show loading for internal navigation
                if (url.origin === window.location.origin && url.pathname !== pathname) {
                    setIsLoading(true);
                }
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [pathname]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Blurred backdrop */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

            {/* Loading popup */}
            <div className="relative z-10 flex flex-col items-center gap-3 rounded-xl bg-card border shadow-2xl px-8 py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Please wait...</p>
            </div>
        </div>
    );
}
