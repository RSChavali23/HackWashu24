import React from 'react';
import './App.css';
import Navbar from './Navbar';
import Home from './Home';
import About from './About';
import Thrift from './Thrift';
import Upload from './Upload';
import Contact from './Contact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Test from './Test';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="App" style={{width: '100vw'}}>
        <Navbar />
        <div className="App-header" style={{width: '100%'}}>
          <Routes>
            <Route path="/test" element={<Test />} />
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/thrift" element={<Thrift />} />
            <Route path="/upload" element={<Upload />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
