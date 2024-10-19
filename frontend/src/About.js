import React from 'react';
import { Link } from 'react-router-dom';


function About() {
  return (
    <div>
      <h1>About Us</h1>
      <p>This is the about page of our application.</p>
      {/* Add the button link to the Lidar Model page */}
      <Link to="/lidar">
        <button>View Lidar Model</button>
      </Link>
    </div>
  );
}

export default About;
