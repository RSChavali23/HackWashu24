import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Link to a new CSS file for navbar styling

function Navbar() {
  return (
    <nav>
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
          <Link to="/test">Test</Link>
        </li>
        <li>
          <Link to="/thrift">Thrift</Link>
        </li>
        <li>
          <Link to="/upload">Upload</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
