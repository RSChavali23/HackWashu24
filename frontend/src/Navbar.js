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
        <li>
          <Link to="/test">Test</Link>
        </li>
        <li>
          <Link to="/lidar">Lidar Model</Link> {/* Add this link */}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
