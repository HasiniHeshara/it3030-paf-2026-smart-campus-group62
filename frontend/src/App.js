import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/Home/Home";
import Navbar from "./Components/NavBar";


function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
      
      </Routes>
    </div>
  );
}

export default App;