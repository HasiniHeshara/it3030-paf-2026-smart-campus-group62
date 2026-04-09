import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/Home/Home.jsx";
import Navbar from "./Components/NavBar";
import BookingPage from "./Pages/Home/Bookings/BookingPage.jsx";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bookings" element={<BookingPage />} />
      </Routes>
    </div>
  );
}

export default App;