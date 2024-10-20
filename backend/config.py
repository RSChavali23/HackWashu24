import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    # Set the base URL for the Mastercard Open Banking API (use sandbox for testing)
    BASE_URL = "https://sandbox.api.mastercard.com"  # For production, switch this to production URL
    OAUTH_TOKEN_URL = f"{BASE_URL}/oauth2/token"  # OAuth token endpoint for Mastercard

    # Credentials for OAuth
    PARTNER_ID = os.getenv('PARTNER_ID')
    APP_KEY = os.getenv('APP_KEY')
    APP_SECRET = os.getenv('APP_SECRET')
    APP_TOKEN = os.getenv('APP_TOKEN')
