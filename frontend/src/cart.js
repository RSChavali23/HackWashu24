import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react"; // Ensure you have this icon package installed
import './cart.css'; // Import a separate CSS file for styling

const Cart = ({ cartItems, removeFromCart, balance }) => {
  // Mock state to manage cart items and fees
  const [cartOpen, setCartOpen] = useState(false);

  const fee = 0; // You can dynamically calculate transaction fee

  // Calculate the total price based on cart items
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);



  // Function to toggle the cart visibility
  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  return (
    <div>
      {/* Sidebar Cart */}
      <div className="cart-sidebar">
        <div className="cart-header">
          <h2>Cart</h2>
          <button onClick={toggleCart} className="close-button">X</button>
        </div>

        <div className="cart-content">
          {cartItems.length > 0 ? (
            <>
              {balance && (
                <div className="cart-balance">
                  <span>Your Balance:</span>
                  <span>{balance}</span>
                </div>
              )}

              <div className="cart-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="cart-item">
                    <span>{item.name}</span>
                    <span>{item.price}</span>
                    <button onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                ))}
              </div>

              <hr />

              <div className="cart-summary">
                <div className="summary-item">
                  <span>Transaction Fee:</span>
                  <span>{fee > 0 ? fee : "Free"}</span>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <span>{totalPrice + fee}</span>
                </div>

                <button className="checkout-button">Checkout (Under Construction)</button>
              </div>
            </>
          ) : (
            <div className="empty-cart">
              <p>Your cart is empty!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;

