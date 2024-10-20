import React, { useState } from 'react';
import axios from 'axios';

function About() {
  // State variables for username, password, message, and link
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [specialLink, setSpecialLink] = useState(null);
  const [balance, setBalance] = useState(null);  // State to hold balance

  // Handler for login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('Success');
    setSpecialLink("https://connect2.finicity.com?customerId=7033710983&origin=url&partnerId=2445584660402&signature=21a8e915453a161ee8e6938153c64a7ae88a332b0e8f73cff8f723c42696c647&timestamp=1729384525153&ttl=1729391725153");

    try {
      console.log("Sending POST request to /login");
      const response = await axios.post('https://hackwashu24.onrender.com//login', {
        username: username,
        password: password,
      });

      // Handle successful response
      console.log('Response received:', response.data);
      setMessage(response.data.message);
      setSpecialLink(response.data.link);  // Store the special link if login is successful
    } catch (error) {
      console.error('Error during login:', error);
      if (error.response) {
        setMessage(error.response.data.error);
      } else {
        setMessage('An error occurred. Please try again.');
      }
    }
  };

  const handleAddBalance = () => {
    const dollarValue = prompt("Enter a dollar value:");
    if (dollarValue) {
      const formattedBalance = `$${parseFloat(dollarValue).toFixed(2)}`; 
      setBalance(`$${parseFloat(dollarValue).toFixed(2)}`);  // Format as a dollar value
      localStorage.setItem('balance', formattedBalance); //Save
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
          <a href={specialLink} target="_blank" rel="noopener noreferrer">Account Configuration</a>
        </div>
      )}
      {specialLink && (
        <div>
          <button onClick={handleAddBalance}>Add Balance</button>
        </div>
      )}
    </div>
  );
}

export default About;
