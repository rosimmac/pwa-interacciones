import { createRoot } from "react-dom/client";
import "./index.css";
// import InteraccionesPage from "./pages/InteraccionesPage";

import { InteraccionesApp } from "./InteraccionesApp";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <InteraccionesApp />,
  //</StrictMode>,
);
