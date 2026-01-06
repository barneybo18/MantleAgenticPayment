import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="text-center space-y-6 max-w-2xl px-6">
        <div className="flex items-center justify-center">
          <div className="size-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg shadow-primary/20">
            AP
          </div>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-linear-to-tr from-foreground to-muted-foreground">
          AgentPay
        </h1>
        <p className="text-xl text-muted-foreground">
          Autonomous agents for your decentralized payments. Schedule, automate, and relax on Mantle Network.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button size="lg" className="rounded-full shadow-xl shadow-primary/20" asChild>
            <Link href="/dashboard">
              Launch App <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full" asChild>
            <Link href="https://docs.mantle.xyz" target="_blank">
              Learn about Mantle
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
