import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import the updated CSS for navbar styling

function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Toggle cart visibility
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="menu-items">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">Account</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/thrift">Thrift</Link>
            </li>
            <li>
              <Link to="/upload">Upload</Link>
            </li>
          </ul>
          {/* Cart Button */}
          <button onClick={toggleCart} className="cart-button">
            <span className="cart-icon">🛒</span> Cart
          </button>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-cart" onClick={toggleCart}>X</button>
        </div>
        <div className="cart-content">
          <p>Cart is empty. Add items to see them here!</p>
        </div>
      </div>

      {/* Backdrop for clicking outside of the cart to close it */}
      {isCartOpen && <div className="backdrop" onClick={toggleCart}></div>}
    </>
  );
}

export default Navbar;
