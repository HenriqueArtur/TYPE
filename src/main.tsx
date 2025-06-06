import { StrictMode } from "react";
import { type Container, createRoot } from "react-dom/client";
import "./index.css";
import { HeroUIProvider } from "@heroui/react";
import App from "./App.tsx";

createRoot(document.getElementById("root") as Container).render(
  <StrictMode>
    <HeroUIProvider>
      <main className="dark text-foreground bg-content1">
        <App />
      </main>
    </HeroUIProvider>
  </StrictMode>,
);
