import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LacquerGame } from "@/components/lacquer-game";
import "@/styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing root");

createRoot(root).render(
  <StrictMode>
    <LacquerGame />
  </StrictMode>,
);
