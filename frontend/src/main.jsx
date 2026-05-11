import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ChakraWrapper from "./components/chakraWrapper.jsx";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChakraWrapper>
      <App />
    </ChakraWrapper>
  </StrictMode>,
);
