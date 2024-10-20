import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import the updated CSS for navbar styling

function Navbar({ cartItems, removeFromCart, balance }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Toggle cart visibility
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  // Helper function to format prices to two decimal places
  const formatPrice = (price) => `$${price.toFixed(2)}`;

  // Calculate the total price by converting item prices to numbers
  const totalPrice = cartItems.reduce((acc, item) => acc + Number(item.price), 0);

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
            <li>
              <Link to="/vrtest">vr</Link>
            </li>
          </ul>

        {/* Company Logo */}
        <div className="logo">
          <h1 style={{marginBottom: 0}}>THRIFT3D</h1>
        </div>

          {/* Cart Button */}
          <button onClick={toggleCart} className="cart-button">
            <span className="cart-icon">🛒</span> Cart ({cartItems.length})
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
          {cartItems.length > 0 ? (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <span>{item.name}</span>
                    <span>{formatPrice(Number(item.price))}</span>
                    <button onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-item">
                  <span>Total:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                <button className="checkout-button">Checkout (Under Construction)</button>
              </div>
            </>
          ) : (
            <div className="empty-cart">
              <p>Your cart is empty. Add items to see them here!</p>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop for clicking outside of the cart to close it */}
      {isCartOpen && <div className="backdrop" onClick={toggleCart}></div>}
    </>
  );
}

export default Navbar;
