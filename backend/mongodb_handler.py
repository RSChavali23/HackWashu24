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
            "mongodb+srv://rahulchavali1:Ec1rg2VHXzPdIFYX@cluster0.xiwbg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
            tls=True,
            tlsAllowInvalidCertificates=True
        )
        db = client["Cluster0"]
        logger.info("Successfully connected to MongoDB.")
        return db
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

def save_clothes(type, size, color, filename):
    db = get_db_connection()  # Ensure this is defined to connect to MongoDB
    clothes_collection = db["clothes"]
    filename = filename.rsplit('.', 1)[0]
    
    clothes_data = {
        "type": type,
        "size": size,
        "color": color,
        "photo_filename": filename  # Save the file name in the MongoDB entry
    }
    
    clothes_collection.insert_one(clothes_data)

    #success("Clothes saved successfully!")


def get_all_clothes():
    db = get_db_connection()  # Ensure this is defined to connect to MongoDB
    clothes_collection = db["clothes"]
    
    clothes = list(clothes_collection.find({}, {"_id": 0}))
    return clothes