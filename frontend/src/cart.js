import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react"; // Ensure you have this icon package installed
import './cart.css'; // Import a separate CSS file for styling

const Cart = () => {
  // Mock state to manage cart items and fees
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Product 1", price: 19.99 },
    { id: 2, name: "Product 2", price: 29.99 },
  ]);
  const [balance, setBalance] = useState(null);  // State to hold the retrieved balance

  const fee = 0; // You can dynamically calculate transaction fee

  // Calculate the total price based on cart items
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  // Helper function to format prices
  const formatPrice = (price) => `$${price.toFixed(2)}`;

  // Function to toggle the cart visibility
  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  // Retrieve balance from localStorage when component mounts
  useEffect(() => {
    const savedBalance = localStorage.getItem('balance');
    if (savedBalance) {
      setBalance(savedBalance);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div>
      {/* Trigger Button to Open the Cart */}
      <button onClick={toggleCart} className="cart-button">
        <ShoppingCart aria-hidden="true" className="cart-icon" />
        <span className="cart-text">Cart</span>
      </button>

      {/* Sidebar Cart */}
      {cartOpen && (
        <div className="cart-sidebar">
          <div className="cart-header">
            <h2>Cart</h2>
            <button onClick={toggleCart} className="close-button">X</button>
          </div>

          <div className="cart-content">
            {cartItems.length > 0 ? (
              <>
                {/* Display Balance */}
                {balance && (
                  <div className="cart-balance">
                    <span>Your Balance:</span>
                    <span>{balance}</span>
                  </div>
                )}

                {/* Display Cart Items */}
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <span>{item.name}</span>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>

                <hr />

                {/* Fees and Total */}
                <div className="cart-summary">
                  <div className="summary-item">
                    <span>Transaction Fee:</span>
                    <span>{fee > 0 ? formatPrice(fee) : "Free"}</span>
                  </div>
                  <div className="summary-item total">
                    <span>Total:</span>
                    <span>{formatPrice(totalPrice + fee)}</span>
                  </div>

                  <button className="checkout-button">
                    Checkout (Under Construction)
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-cart">
                <p>Your cart is empty!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
