import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("VitalWatch main.tsx loading...");

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found!");
  } else {
    console.log("Root element found, creating React root...");
    const root = createRoot(rootElement);
    console.log("React root created, rendering App...");
    root.render(<App />);
    console.log("App rendered successfully!");
  }
} catch (error) {
  console.error("Error in main.tsx:", error);
}
