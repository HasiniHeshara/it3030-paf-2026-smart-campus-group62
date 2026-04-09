import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./Components/NavBar";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute";
import LoginPage from "./Pages/Auth/LoginPage";
import RegisterPage from "./Pages/Auth/RegisterPage";
import UserDashboard from "./Pages/Dashboard/UserDashboard";
import AdminDashboard from "./Pages/Admin/AdminDash";
import ManageUsers from "./Pages/Admin/ManageUsers";
import ManageBookings from "./Pages/Admin/ManageBookings.jsx";
import { AuthProvider } from "./context/AuthContext";
import Home from "./Pages/Home/Home";
import BookingPage from "./Pages/Home/Bookings/BookingPage.jsx";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            }
          />

          <Route path="/bookings" element={<BookingPage />} />

          <Route
            path="/admin/manage-bookings"
            element={
              <AdminRoute>
                <ManageBookings />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;