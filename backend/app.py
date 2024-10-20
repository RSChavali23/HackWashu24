# app.py
from datetime import time
import sys
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from mongodb_handler import save_clothes, save_info
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Hardcoded credentials
HARDCODED_ID = "7033710983"
HARDCODED_USERNAME = "unique_test_customer_001"
HARDCODED_PASSWORD = "securepassword123"  # Replace with a secure password

@app.route('/api')
def hello_world():
    return jsonify(message="Hello from Flask!")

@app.route('/uploadClothes', methods=['POST'])
def upload_clothes():
    logger.info("Received request to upload clothes")
    try:
        # Get data from the POST request
        data = request.get_json()
        logger.debug(f"Request Data: {data}")

        # Validate the required fields are in the request
        if not all(k in data for k in ("type", "size", "color")):
            return jsonify({"error": "Missing required fields"}), 400

        # Extract fields
        cloth_type = data["type"]
        size = data["size"]
        color = data["color"]

        # Save clothes data to MongoDB
        save_clothes(cloth_type, size, color)

        return jsonify({"message": "Clothes uploaded successfully!"}), 201
    except Exception as e:
        logger.error(f"Error uploading clothes: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    logger.info("Received login request")
    try:
        # Get username and password from the request
        data = request.get_json()
        logger.debug(f"Login Request Data: {data}")

        # Check if username and password are present
        if not all(k in data for k in ("username", "password")):
            return jsonify({"error": "Missing required fields (username, password)"}), 400

        username = data["username"]
        password = data["password"]

        # Validate credentials
        if username == HARDCODED_USERNAME and password == HARDCODED_PASSWORD:
            return jsonify({
                "message": "Login successful!",
                "link": "https://example.com/special-link"  # Link to be displayed on the About page
            }), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401

    except Exception as e:
        logger.error(f"Error during login: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
