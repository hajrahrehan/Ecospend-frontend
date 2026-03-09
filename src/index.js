import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "layouts/auth/Auth.js";
import AdminAuth from "layouts/auth/AdminAuth.js";
import NonAuthLayout from "layouts/nonauth/SignIn";
import AdminSignIn from "layouts/nonauth/AdminSignIn";
import Products from "layouts/nonauth/Products";

import "assets/scss/black-dashboard-react.scss";
import "assets/demo/demo.css";
import "assets/css/nucleo-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

import ThemeContextWrapper from "./components/ThemeWrapper/ThemeWrapper";
import BackgroundColorWrapper from "./components/BackgroundColorWrapper/BackgroundColorWrapper";

ReactDOM.render(
  <ThemeContextWrapper>
    <BackgroundColorWrapper>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<NonAuthLayout />} />
          <Route path="/register" element={<NonAuthLayout />} />
          <Route path="/admin-auth" element={<AdminSignIn />} />
          <Route path="/products" element={<Products />} />
          <Route path="/main/*" element={<AuthLayout />} />
          <Route path="/admin/*" element={<AdminAuth />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </BackgroundColorWrapper>
  </ThemeContextWrapper>,
  document.getElementById("root"),
);
