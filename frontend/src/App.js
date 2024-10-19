import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';
import About from './About';
import Contact from './Contact';
import Sidebar from './Sidebar';
import LidarModel from './LidarModel'; // Import the LidarModel component

import './App.css'; // Add this for overlay styling
import Test from './Test';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className={`App ${isSidebarOpen ? 'overlay' : ''}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        <header className="App-header">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          
          <Routes>
            <Route path="/test" element={<Test />} />
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/lidar" element={<LidarModel />} /> {/* Add this route */}
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
