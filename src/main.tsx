import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import InteraccionesPage from "./pages/InteraccionesPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InteraccionesPage />
  </StrictMode>,
);
