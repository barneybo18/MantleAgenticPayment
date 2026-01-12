"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

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

            {/* Loading popup with animated logo - dark bg for consistent GIF appearance */}
            <div className="relative z-10 flex flex-col items-center gap-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl px-8 py-6">
                <Image
                    src="/bogent-loading.gif"
                    alt="Loading..."
                    width={80}
                    height={80}
                    className="rounded-lg"
                    unoptimized // Required for GIFs to animate
                />
                <p className="text-sm font-medium text-slate-300">Loading...</p>
            </div>
        </div>
    );
}

