import requests
import time
from config import Config
import xml.etree.ElementTree as ET

# Global variable to store token and timestamp
token_info = {
    "token": None,
    "timestamp": None
}

def get_finicity_token():
    # Define the Finicity authentication endpoint
    url = "https://api.finicity.com/aggregation/v2/partners/authentication"
    headers = {
        "Content-Type": "application/json",
        "Finicity-App-Key": Config.APP_KEY  # Include Finicity-App-Key here
    }

    # Prepare the payload with Partner ID and Secret
    payload = {
        "partnerId": Config.PARTNER_ID,
        "partnerSecret": Config.APP_SECRET
    }

    # Send the POST request
    response = requests.post(url, json=payload, headers=headers)

    # Log the raw response content to inspect it
    print(f"Status Code: {response.status_code}")
    print(f"Response Text: {response.text}")

    # Ensure that the response contains valid JSON before attempting to parse
    if response.status_code == 200:
        try:
            # Parse the XML response
            root = ET.fromstring(response.text)
            token = root.find("token").text  # Extract the token from the XML
            token_info["token"] = token
            token_info["timestamp"] = time.time()  # Store the current time
            return token_info["token"]
        except ET.ParseError:
            raise Exception("Error parsing XML from Finicity API")
    else:
        raise Exception(f"Failed to get Finicity token: {response.status_code} - {response.text}")

# Function to check if the token is still valid (less than 90 minutes old)
def get_valid_token():
    current_time = time.time()

    # If no token exists or it's older than 90 minutes, request a new one
    if token_info["token"] is None or (current_time - token_info["timestamp"]) > 90 * 60:
        return get_finicity_token()
    else:
        return token_info["token"]
