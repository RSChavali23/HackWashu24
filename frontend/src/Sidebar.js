import React from 'react';
import './Sidebar.css'; // Create this CSS file for styling

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="close-btn" onClick={toggleSidebar}>X</button>
      <h2>Shopping Cart</h2>
      {/* Add your cart items here */}
    </div>
  );
};

export default Sidebar;