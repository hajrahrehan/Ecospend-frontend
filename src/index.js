import React from "react";
import { createRoot } from "react-dom/client";
import App3D from "./App3D";

import "assets/scss/black-dashboard-react.scss";
import "assets/demo/demo.css";
import "assets/css/nucleo-icons.css";
import "assets/css/three-shell.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import "./assets/css/globals.css";

const root = createRoot(document.getElementById("root"));
root.render(<App3D />);
