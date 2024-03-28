import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";
import { Leva } from "leva";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Leva collapsed="true" />
  </React.StrictMode>
);
