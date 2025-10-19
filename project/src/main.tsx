import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./debug-ai"; // Add this line for AI debugging
import LandingPageDemo from "./LandingPageDemo.tsx";
import AppWithLanding from "./AppWithLanding.tsx";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWithLanding />
  </StrictMode>
);
