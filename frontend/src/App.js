import React from 'react';
import './App.css';
import Navbar from './Navbar';
import Home from './Home';
import About from './About';
import Thrift from './Thrift';
import Upload from './Upload';
import Vrtest from './Vrtest';
import Contact from './Contact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Test from './Test';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [balance, setBalance] = useState(localStorage.getItem('balance') || 0);

  // Add an item to the cart, but prevent duplicates
  const addToCart = (item) => {
    if (!cartItems.some((cartItem) => cartItem.id === item.id)) {
      setCartItems((prevItems) => [...prevItems, item]);
    } else {
      alert("This item is already in your cart.");
    }
  };

  // Remove an item from the cart by ID
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <Router>
      <div className="App" style={{ width: '100vw' }}>
        <Navbar cartItems={cartItems} removeFromCart={removeFromCart} balance={balance} />
        <div className="App-header" style={{ width: '100%', }}>
          <Routes>
            <Route path="/test" element={<Test />} />
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/thrift" element={<Thrift addToCart={addToCart} />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/vrtest" element={<Vrtest />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

