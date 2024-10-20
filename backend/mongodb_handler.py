# mongodb_handler.py
from pymongo import MongoClient
import logging
import time
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection setup
def get_db_connection():
    try:
        client = MongoClient(
            os.getenv("MONGODB_URI"),
            tls=True,
            tlsAllowInvalidCertificates=True
        )
        db = client["Cluster0"]
        logger.info("Successfully connected to MongoDB.")
        return db
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

def save_clothes(cloth_type, size, color):
    try:
        db = get_db_connection()
        clothes_collection = db["clothes"]
        clothes_data = {
            "type": cloth_type,
            "size": size,
            "color": color,
            "uploaded_at": time.time()
        }
        clothes_collection.insert_one(clothes_data)
        logger.info("Clothes saved successfully!")
    except Exception as e:
        logger.error(f"Error saving clothes to MongoDB: {e}")
        raise e

def save_info(user_id, username, created_date, password):
    try:
        db = get_db_connection()
        user_collection = db["user"]
        user_data = {
            "id": user_id,
            "username": username,
            "createdDate": created_date,
            "password": password  
        }
        user_collection.insert_one(user_data)
        logger.info(f"User {username} saved successfully!")
    except Exception as e:
        logger.error(f"Error saving user info to MongoDB: {e}")
        raise e
