import { createRoot } from "react-dom/client";
import App from "./App";
import { registerServiceWorker } from "./pwa/registerServiceWorker";

const container = document.getElementById("root");
if (container) {
    createRoot(container).render(<App />);
}

registerServiceWorker();
