import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { PeriodProvider } from "./context/PeriodContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PeriodProvider>
        <App />
      </PeriodProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
