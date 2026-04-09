import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import NavBar from "./Components/NavBar";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute";
import LoginPage from "./Pages/Auth/LoginPage";
import RegisterPage from "./Pages/Auth/RegisterPage";
import UserDashboard from "./Pages/Dashboard/UserDashboard";
import AdminDashboard from "./Pages/Admin/AdminDash";
import ManageUsers from "./Pages/Admin/ManageUsers";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./Pages/Home/Home.jsx";
import BookingPage from "./Pages/Home/Bookings/BookingPage.jsx";
import "./App.css";
import AddResource from "./Pages/Admin/AddResource";
import FacilitiesPage from "./Pages/Facilities/FacilitiesPage";

function App() {
  return (
    <AuthProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/add-resource" element={<AddResource />} />

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

         <Route path="/facilities" element={<FacilitiesPage />} />

      
      </Routes>
    </AuthProvider>
  );
}

export default App;