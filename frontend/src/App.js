import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';
import About from './About';
import Contact from './Contact';
import Sidebar from './Sidebar';
import LidarViewer from './lidarviewer';
import './App.css'; // Add this for overlay styling

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLidarVisible, setIsLidarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleLidar = () => {
    setIsLidarVisible(!isLidarVisible);
  };

  return (
    <Router>
      <div className={`App ${isSidebarOpen ? 'overlay' : ''}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        <header className="App-header">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <button onClick={toggleLidar}>Toggle 3D Viewer</button>
          {isLidarVisible && <LidarViewer isVisible={isLidarVisible} lidarFilePath="\Poppet or Marionnettos glb.glb" />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
