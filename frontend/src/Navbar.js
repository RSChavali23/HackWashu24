import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Link to a new CSS file for navbar styling

function Navbar({ toggleSidebar }) {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
        <li className="cart-link">
          <button onClick={toggleSidebar}>Cart</button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
