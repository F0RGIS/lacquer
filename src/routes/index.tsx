import { createFileRoute } from "@tanstack/react-router";
import { LacquerGame } from "@/components/lacquer-game";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <LacquerGame />;
}
