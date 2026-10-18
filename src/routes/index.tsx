import { createFileRoute } from "@tanstack/react-router";
import { ArchitectApp } from "@/components/architect-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ArchitectApp />;
}
