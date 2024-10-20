import React, { useState, useEffect } from 'react';
import axios from 'axios';

function About() {
  // State variables for username, password, message, and link
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [specialLink, setSpecialLink] = useState(null);
  const [balance, setBalance] = useState(null);  // State to hold balance

  // Load balance from localStorage on component mount
  useEffect(() => {
    const storedBalance = localStorage.getItem('balance');
    if (storedBalance) {
      setBalance(storedBalance);
    }
  }, []);

  // Handler for login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(''); // Reset message
    setSpecialLink(null); // Reset link before new login attempt

    try {
      console.log("Sending POST request to /login");
      const response = await axios.post('https://hackwashu24.onrender.com/login', {
        username: username,
        password: password,
      });

      // Handle successful response
      console.log('Response received:', response.data);
      setMessage(response.data.message);  // Set the login success message
      setSpecialLink(response.data.link);  // Store the special link if login is successful
    } catch (error) {
      console.error('Error during login:', error);
      if (error.response) {
        setMessage(error.response.data.error);  // Set error message from the server
      } else {
        setMessage('An error occurred. Please try again.');  // Generic error message
      }
    }
  };

  // Handler to add balance
  const handleAddBalance = () => {
    const dollarValue = prompt("Enter a dollar value:");
    if (dollarValue) {
      const formattedBalance = `$${parseFloat(dollarValue).toFixed(2)}`; 
      setBalance(formattedBalance);  // Format as a dollar value
      localStorage.setItem('balance', formattedBalance); // Save to localStorage
    }
  };

  return (
    <div>
      {/* Display Balance on the top left if available */}
      {balance && (
        <div style={{ 
          position: 'absolute', 
          top: '150px', 
          left: '10px', 
          color: 'white', 
          backgroundColor: '#333333', /* Background color behind the balance */
          padding: '10px',            /* Add padding for spacing */
          borderRadius: '8px'         /* Rounded corners */
        }}>
          <h3>Balance: {balance}</h3>
        </div>
      )}
      <h1>Account</h1>
      <p>Log in to access special features.</p>
      
      {/* Login Form */}
      <form onSubmit={handleLogin}>
        <div className='type'>
          <p>Username:</p>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            style={{ marginBottom: '1rem' }}
          />
        </div>
        
        <div className='type'>
          <p>Password:</p>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ marginBottom: '1rem' }}  // Add some space below the input field
          />
        </div>
        
        <button type="submit">Login</button>
      </form>

      {/* Display Messages */}
      {message && <p>{message}</p>}

      {/* Display Special Link Upon Successful Login */}
      {specialLink && (
        <div>
          <h2>Account Information</h2>
          <a href={"https://connect2.finicity.com?customerId=7033710983&origin=url&partnerId=2445584660402&signature=e4ce3550817937e036d931a1a7e11ec44810ac930a544c621eb3c69559f75d2a&timestamp=1729441455212&ttl=1729448655212"} target="_blank" rel="noopener noreferrer">Account Configuration</a>
        </div>
      )}

      {/* Add Balance Button if Link is Present */}
      {specialLink && (
        <div>
          <button onClick={handleAddBalance}>Add Balance</button>
        </div>
      )}
    </div>
  );
}

export default About;
